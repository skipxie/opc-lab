import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article, ArticleTag, ArticleCategory, ArticleCategoryMap } from './entities/article.entity';
import { StaticPageService } from '../common/static-page.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleTag, ArticleCategory, ArticleCategoryMap]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, StaticPageService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
