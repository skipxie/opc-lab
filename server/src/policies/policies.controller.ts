import { Controller, Get, Query, Param, Post, Put, Delete, Body } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { Policy } from './policy.entity';

@Controller('api')
export class PoliciesController {
  constructor(private policiesService: PoliciesService) {}

  // ===== 公开接口 =====

  @Get('policies')
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

  @Get('policies/featured')
  async findFeatured(@Query('limit') limit?: string) {
    const data = await this.policiesService.findFeatured(limit ? parseInt(limit, 10) : 6);
    return { data };
  }

  @Get('policies/:id')
  async findOne(@Param('id') id: string) {
    const policy = await this.policiesService.findOne(id);
    if (!policy) {
      return { data: null, message: '政策不存在' };
    }
    return { data: policy };
  }

  // ===== 管理后台接口 =====

  @Get('admin/policies')
  async findAllForAdmin(@Query() query: any) {
    const filters = {
      q: query.q,
      region: query.region,
      types: query.types?.split(',').filter(Boolean),
      audiences: query.audiences?.split(',').filter(Boolean),
      updatedWithinDays: query.days ? parseInt(query.days, 10) : undefined,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
    };
    const result = await this.policiesService.findAllForAdmin(filters);
    return result;
  }

  @Get('admin/policies/:id')
  async findOneForAdmin(@Param('id') id: string) {
    const policy = await this.policiesService.findOne(id);
    return { data: policy };
  }

  @Post('admin/policies')
  async create(@Body() data: CreatePolicyDto): Promise<Policy> {
    return this.policiesService.create(data);
  }

  @Put('admin/policies/:id')
  async update(@Param('id') id: string, @Body() data: UpdatePolicyDto): Promise<Policy> {
    return this.policiesService.update(id, data);
  }

  @Delete('admin/policies/:id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.policiesService.delete(id);
  }
}

interface CreatePolicyDto {
  id: string;
  title: string;
  regionName: string;
  lat?: number;
  lng?: number;
  policyType?: string;
  targetAudience?: string;
  summary?: string;
  requirements?: string;
  materials?: string;
  officialUrl?: string;
  deadline?: string;
  publishedOn?: string;
  sourceName?: string;
  updatedAt?: string;
  isFeatured?: boolean;
  tags?: string[];
}

interface UpdatePolicyDto {
  title?: string;
  regionName?: string;
  lat?: number;
  lng?: number;
  policyType?: string;
  targetAudience?: string;
  summary?: string;
  requirements?: string;
  materials?: string;
  officialUrl?: string;
  deadline?: string;
  publishedOn?: string;
  sourceName?: string;
  updatedAt?: string;
  isFeatured?: boolean;
  tags?: string[];
}
