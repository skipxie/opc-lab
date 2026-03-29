import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyCrawlerService } from './policy-crawler.service';
import { PolicyCrawlerController } from './policy-crawler.controller';
import { Policy } from '../policies/policy.entity';
import { Article, ArticleTag, ArticleCategory, ArticleCategoryMap } from '../articles/entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Policy, Article, ArticleTag, ArticleCategory, ArticleCategoryMap])],
  providers: [PolicyCrawlerService],
  controllers: [PolicyCrawlerController],
  exports: [PolicyCrawlerService],
})
export class PolicyCrawlerModule {}
