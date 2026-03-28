import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, Not } from 'typeorm';
import { Article, ArticleStatus, ArticleTag, ArticleCategory, ArticleCategoryMap } from './entities/article.entity';
import { StaticPageService } from '../common/static-page.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(ArticleTag)
    private tagsRepository: Repository<ArticleTag>,
    @InjectRepository(ArticleCategory)
    private categoriesRepository: Repository<ArticleCategory>,
    private staticPageService: StaticPageService,
  ) {}

  // 获取文章列表（支持筛选）
  async findAll(filters: ArticleFilters): Promise<{ data: Article[]; total: number }> {
    const { q, status, category, page = 1, limit = 20 } = filters;
    const where: any = {};

    if (q?.trim()) {
      where.title = Like(`%${q.trim()}%`);
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.articlesRepository.findAndCount({
      where,
      relations: ['author', 'categories', 'tags'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  // 获取已发布的文章（公开接口）
  async findPublished(page = 1, limit = 20): Promise<{ data: Article[]; total: number }> {
    const [data, total] = await this.articlesRepository.findAndCount({
      where: { status: ArticleStatus.PUBLISHED },
      relations: ['author'],
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  // 通过 slug 获取文章（公开接口）
  async findBySlug(slug: string): Promise<Article | null> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author', 'categories', 'tags'],
    });

    if (!article) {
      return null;
    }

    // 只有已发布的文章才能被访问
    if (article.status !== ArticleStatus.PUBLISHED) {
      return null;
    }

    // 增加浏览次数
    article.viewCount += 1;
    await this.articlesRepository.save(article);

    return article;
  }

  // 通过 ID 获取文章
  async findOne(id: number): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author', 'categories', 'tags'],
    });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return article;
  }

  // 创建文章
  async create(data: CreateArticleDto, authorId: number): Promise<Article> {
    // 检查 slug 是否已存在
    const existing = await this.articlesRepository.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new ForbiddenException('URL 标识已存在');
    }

    const article = this.articlesRepository.create();
    article.title = data.title;
    article.slug = data.slug;
    article.summary = data.summary;
    article.content = data.content;
    article.coverImage = data.coverImage;
    article.authorId = authorId;
    article.status = (data.status as any) || 'draft';
    article.metaTitle = data.metaTitle || data.title;
    article.metaDescription = data.metaDescription || data.summary;
    article.metaKeywords = data.metaKeywords;

    return this.articlesRepository.save(article);
  }

  // 更新文章
  async update(id: number, data: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);
    Object.assign(article, data);

    // 如果 slug 改变，检查是否重复
    if (data.slug && data.slug !== article.slug) {
      const existing = await this.articlesRepository.findOne({
        where: { slug: data.slug, id: Not(id) },
      });
      if (existing) {
        throw new ForbiddenException('URL 标识已存在');
      }
    }

    return this.articlesRepository.save(article);
  }

  // 发布文章（生成静态页面）
  async publish(id: number): Promise<Article> {
    const article = await this.findOne(id);
    article.status = ArticleStatus.PUBLISHED;
    article.publishedAt = new Date();

    // 生成静态页面
    const staticPath = await this.staticPageService.generateArticlePage(article);
    article.staticPath = staticPath;

    return this.articlesRepository.save(article);
  }

  // 取消发布
  async unpublish(id: number): Promise<Article> {
    const article = await this.findOne(id);
    article.status = ArticleStatus.DRAFT;
    return this.articlesRepository.save(article);
  }

  // 删除文章（同时删除静态页面）
  async delete(id: number): Promise<void> {
    const article = await this.findOne(id);
    // 删除静态页面
    if (article.slug) {
      await this.staticPageService.deleteArticlePage(article.slug);
    }
    await this.articlesRepository.remove(article);
  }

  // 获取所有分类
  async getCategories(): Promise<ArticleCategory[]> {
    return this.categoriesRepository.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  // 创建分类
  async createCategory(data: { name: string; slug: string; description?: string }): Promise<ArticleCategory> {
    const existing = await this.categoriesRepository.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new ForbiddenException('分类标识已存在');
    }
    const category = this.categoriesRepository.create(data);
    return this.categoriesRepository.save(category);
  }

  // 更新分类
  async updateCategory(id: number, data: any): Promise<ArticleCategory> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    Object.assign(category, data);
    return this.categoriesRepository.save(category);
  }

  // 删除分类
  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    await this.categoriesRepository.remove(category);
  }
}

interface ArticleFilters {
  q?: string;
  status?: string;
  category?: number;
  page?: number;
  limit?: number;
}

export interface CreateArticleDto {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface UpdateArticleDto {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  coverImage?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}
