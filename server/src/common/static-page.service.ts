import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import { Article } from '../articles/entities/article.entity';

@Injectable()
export class StaticPageService {
  private staticDir: string;
  private templateDir: string;

  constructor() {
    this.staticDir = path.join(process.cwd(), 'dist', 'static');
    this.templateDir = path.join(process.cwd(), 'templates');
    this.ensureDirsExist();
  }

  private ensureDirsExist() {
    const dirs = [
      this.staticDir,
      this.templateDir,
      path.join(this.staticDir, 'articles'),
      path.join(this.templateDir, 'articles'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // 创建文章模板（如果不存在）
    const templatePath = path.join(this.templateDir, 'articles', 'article.html');
    if (!fs.existsSync(templatePath)) {
      this.createDefaultTemplate(templatePath);
    }
  }

  private createDefaultTemplate(templatePath: string) {
    const defaultTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= article.metaTitle || article.title %></title>
  <meta name="description" content="<%= article.metaDescription || article.summary %>">
  <meta name="keywords" content="<%= article.metaKeywords || '' %>">

  <!-- Open Graph -->
  <meta property="og:title" content="<%= article.title %>">
  <meta property="og:description" content="<%= article.summary %>">
  <meta property="og:type" content="article">
  <meta property="og:published_time" content="<%= article.publishedAt %>">
  <% if (article.coverImage) { %>
  <meta property="og:image" content="<%= article.coverImage %>">
  <% } %>

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<%= article.title %>">
  <meta name="twitter:description" content="<%= article.summary %>">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://opc-lab.com/articles/<%= article.slug %>">

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "<%= article.title %>",
    "description": "<%= article.summary || '' %>",
    "datePublished": "<%= article.publishedAt %>",
    "dateModified": "<%= article.updatedAt %>",
    <% if (article.author) { %>
    "author": {
      "@type": "Person",
      "name": "<%= article.author.username || article.author.nickname %>"
    },
    <% } %>
    "publisher": {
      "@type": "Organization",
      "name": "光未在线 OPC",
      "logo": {
        "@type": "ImageObject",
        "url": "https://opc-lab.com/logo.png"
      }
    }
  }
  </script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    header { margin-bottom: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .meta { color: #666; font-size: 0.875rem; }
    .cover-image { width: 100%; height: auto; margin-bottom: 1.5rem; border-radius: 8px; }
    .content { font-size: 1.125rem; }
    .content h2 { margin-top: 2rem; margin-bottom: 1rem; }
    .content p { margin-bottom: 1rem; }
    .content img { max-width: 100%; height: auto; }
    footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eee; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <header>
    <h1><%= article.title %></h1>
    <div class="meta">
      <% if (article.author) { %>
        <span>作者：<%= article.author.nickname || article.author.username %></span> |
      <% } %>
      <span>发布于：<%= new Date(article.publishedAt).toLocaleDateString('zh-CN') %></span> |
      <span>浏览：<%= article.viewCount %></span>
    </div>
  </header>

  <% if (article.coverImage) { %>
    <img src="<%= article.coverImage %>" alt="封面图" class="cover-image">
  <% } %>

  <% if (article.summary) { %>
    <div class="summary" style="margin-bottom: 1.5rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
      <%= article.summary %>
    </div>
  <% } %>

  <article class="content">
    <%- article.content %>
  </article>

  <footer>
    <p>本文链接：<a href="https://opc-lab.com/articles/<%= article.slug %>">https://opc-lab.com/articles/<%= article.slug %></a></p>
    <p>© 光未在线 OPC - 让一人公司跑起来</p>
  </footer>
</body>
</html>`;

    fs.writeFileSync(templatePath, defaultTemplate, 'utf-8');
    console.log('Default article template created at:', templatePath);
  }

  async generateArticlePage(article: Article): Promise<string> {
    const templatePath = path.join(this.templateDir, 'articles', 'article.html');
    const outputPath = path.join(this.staticDir, 'articles', `${article.slug}.html`);

    try {
      // 读取模板
      const template = await fs.promises.readFile(templatePath, 'utf-8');

      // 渲染 EJS 模板
      const html = ejs.render(template, { article }, {
        locals: { article },
      });

      // 确保输出目录存在
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

      // 写入静态文件
      await fs.promises.writeFile(outputPath, html, 'utf-8');

      // 更新文章的 staticPath
      const relativePath = `/static/articles/${article.slug}.html`;
      return relativePath;
    } catch (error) {
      console.error('Failed to generate static page:', error);
      throw error;
    }
  }

  async deleteArticlePage(slug: string): Promise<void> {
    const filePath = path.join(this.staticDir, 'articles', `${slug}.html`);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Failed to delete static page:', error);
    }
  }

  // 生成 sitemap
  async generateSitemap(articles: Article[], policies: any[]): Promise<string> {
    const sitemapPath = path.join(this.staticDir, 'sitemap.xml');

    const baseUrl = 'https://opc-lab.com';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 首页 -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- 政策地图 -->
  <url>
    <loc>${baseUrl}/policy-map</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- 社区 -->
  <url>
    <loc>${baseUrl}/community</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // 添加文章
    articles.forEach(article => {
      if (article.status === 'published') {
        xml += `  <url>
    <loc>${baseUrl}/articles/${article.slug}</loc>
    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    });

    // 添加政策
    policies.forEach(policy => {
      xml += `  <url>
    <loc>${baseUrl}/policy-map?focus=${policy.id}</loc>
    <lastmod>${new Date(policy.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    await fs.promises.writeFile(sitemapPath, xml, 'utf-8');
    return '/sitemap.xml';
  }
}
