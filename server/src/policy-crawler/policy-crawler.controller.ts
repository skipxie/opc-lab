import { Controller, Get, Post, Query, Body, Logger } from '@nestjs/common';
import { PolicyCrawlerService } from './policy-crawler.service';

@Controller('api/admin/policy-crawler')
export class PolicyCrawlerController {
  private readonly logger = new Logger(PolicyCrawlerController.name);

  constructor(private readonly crawlerService: PolicyCrawlerService) {}

  /**
   * 手动触发政策爬取
   */
  @Post('fetch')
  async fetchPolicies(@Query('keyword') keyword?: string): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    try {
      let count: number;
      if (keyword) {
        count = await this.crawlerService.searchAndFetch(keyword);
      } else {
        count = await this.crawlerService.fetchPolicies();
      }

      return {
        success: true,
        count,
        message: `成功获取 ${count} 条新政策`,
      };
    } catch (error) {
      this.logger.error('爬取失败:', error);
      return {
        success: false,
        count: 0,
        message: `爬取失败：${error.message}`,
      };
    }
  }

  /**
   * 获取爬取状态
   */
  @Get('status')
  async getStatus(): Promise<{
    lastRun?: string;
    nextRun: string;
    totalPolicies: number;
    scheduledTask: { enabled: boolean; isRunning: boolean };
  }> {
    const scheduledTask = this.crawlerService.getScheduledTaskStatus();
    return {
      nextRun: '每天凌晨 2:00',
      totalPolicies: await this.getTotalPolicies(),
      scheduledTask,
    };
  }

  /**
   * 切换定时任务开关
   */
  @Post('toggle-schedule')
  async toggleSchedule(@Body('enabled') enabled: boolean): Promise<{
    success: boolean;
    message: string;
    enabled: boolean;
  }> {
    this.crawlerService.setScheduledTaskEnabled(enabled);
    return {
      success: true,
      message: `定时任务已${enabled ? '启用' : '禁用'}`,
      enabled,
    };
  }

  /**
   * 获取定时任务开关状态
   */
  @Get('schedule-enabled')
  async getScheduleEnabled(): Promise<{
    enabled: boolean;
  }> {
    return {
      enabled: this.crawlerService.isScheduledTaskEnabled(),
    };
  }

  private async getTotalPolicies(): Promise<number> {
    // 简单实现，实际应该从数据库查询
    return 0;
  }
}
