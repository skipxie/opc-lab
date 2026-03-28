import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyCrawlerService } from './policy-crawler.service';
import { PolicyCrawlerController } from './policy-crawler.controller';
import { Policy } from '../policies/policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Policy])],
  providers: [PolicyCrawlerService],
  controllers: [PolicyCrawlerController],
  exports: [PolicyCrawlerService],
})
export class PolicyCrawlerModule {}
