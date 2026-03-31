import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Cron } from '@nestjs/schedule';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Policy } from '../policies/policy.entity';
import { Article, ArticleTag, ArticleCategory } from '../articles/entities/article.entity';
import { CrawlerConfig } from './crawler-config.entity';

interface PolicySearchResult {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedDate?: string;
  region: string;
}

interface PolicyDetail {
  title: string;
  summary: string;
  requirements: string;
  materials: string;
  officialUrl: string;
  deadline?: string;
  publishedOn: string;
  sourceName: string;
  regionName: string;
  policyType: string;
  targetAudience: string;
  tags: string[];
  lat?: number;
  lng?: number;
}

interface ContentClassification {
  isPolicy: boolean;
  confidence: number; // 0-1
  reason: string;
}

@Injectable()
export class PolicyCrawlerService {
  private readonly logger = new Logger(PolicyCrawlerService.name);
  private readonly bochaApiKey: string;
  private readonly bochaApiUrl: string;
  private crawlerScheduledEnabled: boolean;
  private isScheduledTaskRunning = false;

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
    private crawlerConfigRepository: Repository<CrawlerConfig>
  ) {
    this.bochaApiKey = this.configService.get<string>('BOCHA_API_KEY') || '';
    this.bochaApiUrl = this.configService.get<string>('BOCHA_API_URL') || 'https://api.bochaai.com/v1/web-search';
    this.crawlerScheduledEnabled = true; // 默认值，初始化时从数据库加载
  }

  /**
   * 初始化配置，从数据库读取定时任务开关状态
   */
  async onModuleInit() {
    try {
      const config = await this.crawlerConfigRepository.findOne({
        where: { key: 'schedule_enabled' },
      });
      if (config) {
        this.crawlerScheduledEnabled = config.value === 'true';
      } else {
        // 如果数据库没有配置，使用环境变量默认值并保存
        this.crawlerScheduledEnabled = this.configService.get<boolean>('CRAWLER_SCHEDULED_ENABLED', true);
        await this.crawlerConfigRepository.save({
          key: 'schedule_enabled',
          value: this.crawlerScheduledEnabled ? 'true' : 'false',
          description: '爬虫定时任务是否启用 (true/false)',
        });
      }
      this.logger.log(`爬虫定时任务初始化状态：${this.crawlerScheduledEnabled ? '启用' : '禁用'}`);
    } catch (error) {
      this.logger.error('加载爬虫配置失败:', error);
    }
  }

  /**
   * 检查定时任务是否启用
   */
  isScheduledTaskEnabled(): boolean {
    return this.crawlerScheduledEnabled;
  }

  /**
   * 设置定时任务启用状态（保存到数据库）
   */
  async setScheduledTaskEnabled(enabled: boolean): Promise<void> {
    this.crawlerScheduledEnabled = enabled;
    this.logger.log(`定时任务已${enabled ? '启用' : '禁用'}`);

    // 保存到数据库
    await this.crawlerConfigRepository.upsert(
      {
        key: 'schedule_enabled',
        value: enabled ? 'true' : 'false',
        description: '爬虫定时任务是否启用 (true/false)',
      },
      ['key'],
    );
  }

  /**
   * 获取定时任务状态
   */
  getScheduledTaskStatus(): { enabled: boolean; isRunning: boolean } {
    return {
      enabled: this.crawlerScheduledEnabled,
      isRunning: this.isScheduledTaskRunning,
    };
  }

  // 地区坐标
  private readonly regionCoordinates: Record<string, { lat: number; lng: number }> = {
    '北京': { lat: 39.9042, lng: 116.4074 },
    '上海': { lat: 31.2304, lng: 121.4737 },
    '广东': { lat: 23.1291, lng: 113.2644 },
    '深圳': { lat: 22.5431, lng: 114.0579 },
    '浙江': { lat: 30.2741, lng: 120.1551 },
    '杭州': { lat: 30.2741, lng: 120.1551 },
    '江苏': { lat: 32.0603, lng: 118.7969 },
    '苏州': { lat: 31.2989, lng: 120.5853 },
    '海南': { lat: 20.0444, lng: 110.1999 },
    '四川': { lat: 30.5728, lng: 104.0668 },
    '成都': { lat: 30.5728, lng: 104.0668 },
  };

  // 政策类型关键词
  private readonly policyTypeKeywords: Record<string, string[]> = {
    '补贴': ['补贴', '补助', '资金', '资助', '奖励'],
    '税收优惠': ['税收', '税务', '减免', '免征', '退税'],
    '贷款支持': ['贷款', '融资', '贴息', '担保'],
    '创业支持': ['创业', '孵化', '园区', '基地', '众创'],
    '人才政策': ['人才', '落户', '住房', '公寓', '补贴'],
    '其他': ['服务', '平台', '对接', '通道', '开放'],
  };

  // 政策类内容判定关键词 - 包含这些词的是政策
  private readonly policyKeywords: string[] = [
    '政策', '办法', '条例', '规定', '通知', '意见', '方案', '措施', '指引',
    '申报', '申请', '补贴', '补助', '资金', '资助', '奖励', '扶持',
    '税收', '税务', '减免', '免征', '退税', '贴息',
    '认定', '资质', '资格', '审批', '许可',
    '政府', '部门', '委员会', '办公室', '厅', '局',
  ];

  // 文章类内容判定关键词 - 包含这些词的是文章/资讯
  private readonly articleKeywords: string[] = [
    '新闻', '资讯', '报道', '消息', '动态', '快讯',
    '分享', '经验', '技巧', '干货', '指南', '教程', '攻略',
    '交流', '社群', '圈子', '平台', '服务',
    '日记', '日常', '成长', '故事', '案例',
    '解析', '解读', '分析', '评论', '观点',
    '如何', '怎么', '什么', '为什么', '攻略',
  ];

  /**
   * 定时任务：每天凌晨 2 点执行
   */
  @Cron('0 2 * * *')
  async handleCron(): Promise<void> {
    if (!this.crawlerScheduledEnabled) {
      this.logger.log('定时任务已禁用，跳过执行');
      return;
    }

    if (this.isScheduledTaskRunning) {
      this.logger.warn('定时任务正在运行中，跳过本次执行');
      return;
    }

    this.isScheduledTaskRunning = true;
    this.logger.log('开始执行定时政策爬取任务...');

    try {
      await this.fetchPolicies();
    } finally {
      this.isScheduledTaskRunning = false;
    }
  }

  /**
   * 手动触发爬取
   */
  async fetchPolicies(): Promise<number> {
    const searchQueries = [
      // 核心品牌SEO
      "OPC一人公司",
      "AI一人公司创业模式",
      "一人公司日常运营",
      "超级个体成长之路",
      "OPC资源合作对接"
    ];

    let policyCount = 0;
    let articleCount = 0;

    for (const query of searchQueries) {
      try {
        this.logger.log(`搜索关键词：${query}`);
        const results = await this.searchFromSearchEngine(query);
        this.logger.log(`找到 ${results.length} 条结果`);

        for (const result of results) {
          // 检查是否已存在（政策表或文章表）
          const exists = await this.checkContentExists(result.title, result.url);
          if (exists) {
            continue;
          }

          // 分类判断
          const classification = this.classifyContent(result.title, result.summary);

          if (classification.isPolicy) {
            // 保存到政策表
            const detail = await this.fetchPolicyDetail(result);
            if (detail) {
              await this.savePolicy(detail);
              policyCount++;
              this.logger.log(`[政策] 已保存：${detail.title}`);
            }
          } else {
            // 保存到文章表
            const articleData = await this.fetchArticleDetail(result);
            if (articleData) {
              await this.saveArticle(articleData, classification.reason);
              articleCount++;
              this.logger.log(`[文章] 已保存：${articleData.title}`);
            }
          }
        }

        // 避免请求过快，等待一段时间
        await this.sleep(2000);
      } catch (error) {
        this.logger.error(`搜索失败 ${query}:`, error);
      }
    }

    this.logger.log(`爬取完成，新增 ${policyCount} 条政策，${articleCount} 篇文章`);
    return policyCount + articleCount;
  }

  /**
   * 从博查 API 获取搜索结果
   */
  private async searchFromSearchEngine(query: string): Promise<PolicySearchResult[]> {
    const results: PolicySearchResult[] = [];

    try {
      this.logger.log(`搜索关键词：${query}`);

      const { data } = await axios.post(
        this.bochaApiUrl,
        {
          query: query,
          count: 10,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.bochaApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      this.logger.log(`博查 API 响应状态：${data.code}`);

      // 博查 API 响应格式：{ code: 200, data: { webPages: { value: [...] } } }
      const searchResults = data.data?.webPages?.value || data.data?.value || [];
      this.logger.log(`博查 API 返回结果数：${searchResults.length}`);

      if (Array.isArray(searchResults)) {
        for (const item of searchResults) {
          const region = this.extractRegion(item.name + ' ' + (item.snippet || ''));

          results.push({
            title: item.name || item.title || '',
            url: item.url || item.link || '',
            summary: item.snippet || item.summary || '',
            source: item.siteName || item.site || '',
            region,
          });
        }
      }

      this.logger.log(`成功获取 ${results.length} 条结果`);
    } catch (error) {
      this.logger.error(`博查 API 请求失败：${error.message}`, error.stack);
    }

    return results.slice(0, 10); // 限制每个查询最多 10 条
  }

  /**
   * 爬取政策详情
   */
  private async fetchPolicyDetail(searchResult: PolicySearchResult): Promise<PolicyDetail | null> {
    try {
      // 如果是 PDF 文件，跳过详细内容爬取
      if (searchResult.url.endsWith('.pdf')) {
        return this.generatePolicyFromSearchResult(searchResult);
      }

      const { data } = await axios.get(searchResult.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(data);

      // 尝试从页面提取政策信息
      const title = $('h1').first().text().trim() || searchResult.title;
      const content = $('body').text();

      // 提取发布日期
      const dateMatch = content.match(/(\d{4}[-年]\d{1,2}[-月]\d{1,2}[日号]?)/);
      const publishedOn = dateMatch ? this.normalizeDate(dateMatch[0]) : new Date().toISOString().split('T')[0];

      // 提取政策类型
      const policyType = this.extractPolicyType(content);

      // 提取目标受众
      const targetAudience = this.extractTargetAudience(content);

      // 提取申报要求
      const requirements = this.extractRequirements(content);

      // 提取所需材料
      const materials = this.extractMaterials(content);

      // 提取截止时间
      const deadline = this.extractDeadline(content);

      const coords = this.regionCoordinates[searchResult.region] || { lat: 39.9042, lng: 116.4074 };

      return {
        title,
        summary: searchResult.summary,
        requirements: requirements || '详见官方文件',
        materials: materials.length > 0 ? JSON.stringify(materials) : '[]',
        officialUrl: searchResult.url,
        deadline,
        publishedOn,
        sourceName: searchResult.source,
        regionName: searchResult.region,
        policyType,
        targetAudience,
        tags: this.generateTags(searchResult),
        lat: coords.lat,
        lng: coords.lng,
      };
    } catch (error) {
      this.logger.warn(`爬取详情失败 ${searchResult.url}: ${error.message}`);
      // 返回基于搜索结果生成的数据
      return this.generatePolicyFromSearchResult(searchResult);
    }
  }

  /**
   * 基于搜索结果生成政策数据
   */
  private generatePolicyFromSearchResult(result: PolicySearchResult): PolicyDetail {
    const coords = this.regionCoordinates[result.region] || { lat: 39.9042, lng: 116.4074 };

    return {
      title: result.title,
      summary: result.summary,
      requirements: '详见官方文件',
      materials: '[]',
      officialUrl: result.url,
      publishedOn: new Date().toISOString().split('T')[0],
      sourceName: result.source,
      regionName: result.region,
      policyType: this.extractPolicyType(result.title + ' ' + result.summary),
      targetAudience: 'OPC 创业者、人工智能从业者',
      tags: this.generateTags(result),
      lat: coords.lat,
      lng: coords.lng,
    };
  }

  /**
   * 提取地区信息
   */
  private extractRegion(text: string): string {
    const regions = Object.keys(this.regionCoordinates);
    for (const region of regions) {
      if (text.includes(region)) {
        return region;
      }
    }
    return '全国';
  }

  /**
   * 提取政策类型
   */
  private extractPolicyType(text: string): string {
    for (const [type, keywords] of Object.entries(this.policyTypeKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return type;
        }
      }
    }
    return '其他';
  }

  /**
   * 提取目标受众
   */
  private extractTargetAudience(text: string): string {
    if (text.includes('一人公司') || text.includes('OPC')) {
      return '人工智能一人公司创业者';
    }
    if (text.includes('小微企业')) {
      return '小微企业';
    }
    if (text.includes('创业')) {
      return '创业者';
    }
    return '相关企业和从业者';
  }

  /**
   * 提取申报要求
   */
  private extractRequirements(text: string): string {
    const reqMatch = text.match(/(?:申报条件 | 申请条件 | 申请条件 | 适用对象)[\s\S]{0,500}/);
    if (reqMatch) {
      return reqMatch[0].substring(0, 1000);
    }
    return '';
  }

  /**
   * 提取所需材料
   */
  private extractMaterials(text: string): string[] {
    const materials: string[] = [];
    const materialPatterns = [
      /营业执照/,
      /身份证/,
      /申请表/,
      /商业计划书/,
      /财务报表/,
      /社保证明/,
      /合同/,
      /项目书/,
    ];

    for (const pattern of materialPatterns) {
      const match = text.match(new RegExp(`.{0,20}${pattern.source}.{0,30}`));
      if (match) {
        materials.push(match[0].trim());
      }
    }

    return materials.slice(0, 10);
  }

  /**
   * 提取截止时间
   */
  private extractDeadline(text: string): string | undefined {
    const deadlineMatch = text.match(/(?:截止 | 截至|申报截止|申请截止)[:：]?\s*(\d{4}[-年]\d{1,2}[-月]\d{1,2}[日号]?)/);
    if (deadlineMatch) {
      return deadlineMatch[1].replace(/[年月]/g, '-').replace(/日号/, '');
    }
    // 默认设置一年后
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  }

  /**
   * 生成标签
   */
  private generateTags(result: PolicySearchResult): string[] {
    const tags = new Set<string>();

    // 添加地区标签
    if (result.region !== '全国') {
      tags.add(result.region);
    }

    // 添加政策类型标签
    const policyType = this.extractPolicyType(result.title + ' ' + result.summary);
    tags.add(policyType);

    // 添加关键词标签
    const keywords = ['OPC', '一人公司', 'AI', '人工智能', '创业', '补贴', '算力券', '超级个体'];
    for (const keyword of keywords) {
      if (result.title.includes(keyword) || result.summary.includes(keyword)) {
        tags.add(keyword);
      }
    }

    return Array.from(tags);
  }

  /**
   * 检查内容是否已存在（政策表或文章表）
   */
  private async checkContentExists(title: string, url: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      // 检查政策表
      const policyResult = await queryRunner.query(
        'SELECT id FROM policies WHERE title = ? OR official_url = ?',
        [title, url],
      );
      if (policyResult.length > 0) {
        return true;
      }

      // 检查文章表
      const articleResult = await queryRunner.query(
        'SELECT id FROM articles WHERE title = ? OR slug = ?',
        [title, this.generateSlug(title)],
      );
      return articleResult.length > 0;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 分类内容：判断是政策还是文章
   * @returns { isPolicy: boolean, confidence: number, reason: string }
   */
  private classifyContent(title: string, summary: string): { isPolicy: boolean; confidence: number; reason: string } {
    const text = (title + ' ' + summary).toLowerCase();

    let policyScore = 0;
    let articleScore = 0;
    const reasons: string[] = [];

    // 检查政策关键词
    for (const keyword of this.policyKeywords) {
      if (text.includes(keyword)) {
        policyScore += 2;
        reasons.push(`政策关键词：${keyword}`);
      }
    }

    // 检查文章关键词
    for (const keyword of this.articleKeywords) {
      if (text.includes(keyword)) {
        articleScore += 2;
        reasons.push(`文章关键词：${keyword}`);
      }
    }

    // 标题包含「政府」「部门」「委员会」等，政策概率高
    if (/政府 | 部门 | 委员会 | 办公室 | 厅 | 局/.test(title)) {
      policyScore += 5;
      reasons.push('标题包含政府机构名称');
    }

    // 标题包含「新闻」「报道」「分享」等，文章概率高
    if (/新闻 | 报道 | 分享 | 交流 | 社群 | 圈子/.test(title)) {
      articleScore += 5;
      reasons.push('标题包含资讯类词汇');
    }

    // 包含申报、申请、补贴等核心政策词，直接判定为政策
    if (/(申报 | 申请 | 补贴 | 补助 | 资金 | 资助|奖励)/.test(text)) {
      policyScore += 10;
      reasons.push('包含政策核心词汇');
    }

    // 包含「如何」「怎么」「攻略」等，直接判定为文章
    if (/(如何 | 怎么 | 什么 | 为什么 | 攻略 | 教程)/.test(text)) {
      articleScore += 10;
      reasons.push('包含教程类词汇');
    }

    const totalScore = policyScore + articleScore;
    if (totalScore === 0) {
      // 默认判定为文章
      return { isPolicy: false, confidence: 0.5, reason: '无明确分类特征，默认为文章' };
    }

    const isPolicy = policyScore > articleScore;
    const confidence = Math.max(policyScore, articleScore) / totalScore;

    return {
      isPolicy,
      confidence,
      reason: isPolicy
        ? `判定为政策（置信度${(confidence * 100).toFixed(0)}%）：${reasons.slice(0, 3).join('; ')}`
        : `判定为文章（置信度${(confidence * 100).toFixed(0)}%）：${reasons.slice(0, 3).join('; ')}`,
    };
  }

  /**
   * 生成文章 slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  }

  /**
   * 获取文章详情
   */
  private async fetchArticleDetail(searchResult: PolicySearchResult): Promise<{
    title: string;
    summary: string;
    content: string;
    sourceName: string;
    publishedOn: string;
    tags: string[];
  } | null> {
    try {
      const { data } = await axios.get(searchResult.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(data);
      const title = $('h1').first().text().trim() || searchResult.title;
      const content = $('article, .content, .article-content, #content').first().html() || searchResult.summary;
      const dateMatch = $('body').text().match(/(\d{4}[-年]\d{1,2}[-月]\d{1,2}[日号]?)/);
      const publishedOn = dateMatch
        ? this.normalizeDate(dateMatch[0])
        : new Date().toISOString().split('T')[0];

      return {
        title,
        summary: searchResult.summary,
        content,
        sourceName: searchResult.source,
        publishedOn,
        tags: this.generateTags(searchResult),
      };
    } catch (error) {
      this.logger.warn(`获取文章内容失败 ${searchResult.url}: ${error.message}`);
      // 返回基本信息
      return {
        title: searchResult.title,
        summary: searchResult.summary,
        content: `<p>${searchResult.summary}</p><p>来源：<a href="${searchResult.url}" target="_blank">${searchResult.url}</a></p>`,
        sourceName: searchResult.source,
        publishedOn: new Date().toISOString().split('T')[0],
        tags: this.generateTags(searchResult),
      };
    }
  }

  /**
   * 保存文章到数据库
   */
  private async saveArticle(
    data: { title: string; summary: string; content: string; sourceName: string; publishedOn: string; tags: string[] },
    category: string
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();

      const slug = this.generateSlug(data.title) + '-' + Date.now();

      // 插入文章
      await queryRunner.query(`
        INSERT INTO articles (
          title, slug, summary, content, status, published_at,
          meta_title, meta_description, meta_keywords,
          view_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'published', ?, ?, ?, ?, 0, NOW(), NOW())
      `, [
        data.title,
        slug,
        data.summary,
        data.content,
        data.publishedOn,
        data.title,
        data.summary,
        data.tags.join(','),
      ]);

      // 获取文章 ID
      const [result] = await queryRunner.query('SELECT LAST_INSERT_ID() as id') as any[];
      const articleId = result.id;

      // 插入标签
      for (const tag of data.tags) {
        await queryRunner.query(
          'INSERT INTO article_tags (article_id, tag_name) VALUES (?, ?)',
          [articleId, tag],
        );
      }

      // 查找或创建分类
      const [categoryResult] = await queryRunner.query(
        'SELECT id FROM article_categories WHERE slug = ?',
        [category],
      ) as any[];

      let categoryId: number;
      if (categoryResult) {
        categoryId = categoryResult.id;
      } else {
        await queryRunner.query(
          'INSERT INTO article_categories (name, slug, description, created_at) VALUES (?, ?, ?, NOW())',
          [category === 'policy' ? '政策资讯' : '行业资讯', category, category === 'policy' ? '政策相关内容' : '行业资讯内容'],
        );
        const [catResult] = await queryRunner.query('SELECT LAST_INSERT_ID() as id') as any[];
        categoryId = catResult.id;
      }

      // 插入分类映射
      await queryRunner.query(
        'INSERT INTO article_category_map (article_id, category_id) VALUES (?, ?)',
        [articleId, categoryId],
      );

    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 保存政策到数据库
   */
  private async savePolicy(detail: PolicyDetail): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();

      const id = `opc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      await queryRunner.query(`
        INSERT INTO policies (
          id, title, region_name, lat, lng, policy_type, target_audience,
          summary, requirements, materials, official_url, deadline,
          published_on, source_name, is_featured, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        id,
        detail.title,
        detail.regionName,
        detail.lat,
        detail.lng,
        detail.policyType,
        detail.targetAudience,
        detail.summary,
        detail.requirements,
        detail.materials,
        detail.officialUrl,
        detail.deadline,
        detail.publishedOn,
        detail.sourceName,
        0,
        JSON.stringify(detail.tags),
      ]);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 标准化日期格式为 YYYY-MM-DD
   */
  private normalizeDate(dateStr: string): string {
    const match = dateStr.match(/(\d{4})[-年](\d{1,2})[-月](\d{1,2})[日号]?/);
    if (!match) {
      return new Date().toISOString().split('T')[0];
    }
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 延时函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 搜索并爬取指定关键词的政策
   */
  async searchAndFetch(keyword: string): Promise<number> {
    this.logger.log(`开始手动搜索：${keyword}`);
    const results = await this.searchFromSearchEngine(keyword);
    let policyCount = 0;
    let articleCount = 0;

    for (const result of results) {
      // 检查是否已存在（政策表或文章表）
      const exists = await this.checkContentExists(result.title, result.url);
      if (exists) {
        continue;
      }

      // 分类判断
      const classification = this.classifyContent(result.title, result.summary);

      if (classification.isPolicy) {
        // 保存到政策表
        const detail = await this.fetchPolicyDetail(result);
        if (detail) {
          await this.savePolicy(detail);
          policyCount++;
          this.logger.log(`[政策] 已保存：${detail.title}`);
        }
      } else {
        // 保存到文章表
        const articleData = await this.fetchArticleDetail(result);
        if (articleData) {
          await this.saveArticle(articleData, classification.reason);
          articleCount++;
          this.logger.log(`[文章] 已保存：${articleData.title}`);
        }
      }
    }

    this.logger.log(`手动搜索完成，新增 ${policyCount} 条政策，${articleCount} 篇文章`);
    return policyCount + articleCount;
  }
}
