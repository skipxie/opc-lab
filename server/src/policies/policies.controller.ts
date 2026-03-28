import { Controller, Get, Query, Param } from '@nestjs/common';
import { PoliciesService } from './policies.service';

@Controller('api/policies')
export class PoliciesController {
  constructor(private policiesService: PoliciesService) {}

  @Get()
  async findAll(@Query() query: any) {
    const filters = {
      q: query.q,
      region: query.region,
      types: query.types?.split(',').filter(Boolean),
      audiences: query.audiences?.split(',').filter(Boolean),
      updatedWithinDays: query.days ? parseInt(query.days, 10) : undefined,
    };
    const data = await this.policiesService.findAll(filters);
    return { data };
  }

  @Get('featured')
  async findFeatured(@Query('limit') limit?: string) {
    const data = await this.policiesService.findFeatured(limit ? parseInt(limit, 10) : 6);
    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const policy = await this.policiesService.findOne(id);
    if (!policy) {
      return { data: null, message: '政策不存在' };
    }
    return { data: policy };
  }
}
