import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ArticlesService, CreateArticleDto, UpdateArticleDto } from './articles.service';
import { Article } from './entities/article.entity';

@Controller('api')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  // ===== 公开接口 =====

  // 获取已发布文章列表
  @Get('articles')
  async getPublishedArticles(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.articlesService.findPublished(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return result;
  }

  // 获取文章详情（通过 slug）
  @Get('articles/:slug')
  async getArticle(@Param('slug') slug: string): Promise<{ data: Article | null }> {
    const article = await this.articlesService.findBySlug(slug);
    return { data: article };
  }

  // ===== 管理后台接口 =====

  // 获取文章列表（管理后台）
  @Get('admin/articles')
  async getArticles(@Query() query: any) {
    const filters = {
      q: query.q,
      status: query.status,
      category: query.category ? parseInt(query.category, 10) : undefined,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
    };
    const result = await this.articlesService.findAll(filters);
    return result;
  }

  // 获取文章详情
  @Get('admin/articles/:id')
  async getArticleById(@Param('id') id: number): Promise<{ data: Article }> {
    const article = await this.articlesService.findOne(id);
    return { data: article };
  }

  // 创建文章
  @Post('admin/articles')
  async createArticle(@Body() data: CreateArticleDto, @Query('authorId') authorId: number): Promise<Article> {
    return this.articlesService.create(data, authorId);
  }

  // 更新文章
  @Put('admin/articles/:id')
  async updateArticle(@Param('id') id: number, @Body() data: UpdateArticleDto): Promise<Article> {
    return this.articlesService.update(id, data);
  }

  // 发布文章
  @Post('admin/articles/:id/publish')
  async publishArticle(@Param('id') id: number): Promise<Article> {
    return this.articlesService.publish(id);
  }

  // 取消发布
  @Post('admin/articles/:id/unpublish')
  async unpublishArticle(@Param('id') id: number): Promise<Article> {
    return this.articlesService.unpublish(id);
  }

  // 删除文章
  @Delete('admin/articles/:id')
  async deleteArticle(@Param('id') id: number): Promise<void> {
    return this.articlesService.delete(id);
  }

  // ===== 分类管理 =====

  @Get('admin/article-categories')
  async getCategories(): Promise<any[]> {
    const categories = await this.articlesService.getCategories();
    return categories;
  }

  @Post('admin/article-categories')
  async createCategory(@Body() data: { name: string; slug: string; description?: string }): Promise<any> {
    return this.articlesService.createCategory(data);
  }

  @Put('admin/article-categories/:id')
  async updateCategory(@Param('id') id: number, @Body() data: any): Promise<any> {
    return this.articlesService.updateCategory(id, data);
  }

  @Delete('admin/article-categories/:id')
  async deleteCategory(@Param('id') id: number): Promise<void> {
    return this.articlesService.deleteCategory(id);
  }
}
