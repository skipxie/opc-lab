import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, In } from 'typeorm';
import { Policy } from './policy.entity';

interface PolicyFilters {
  q?: string;
  region?: string;
  types?: string[];
  audiences?: string[];
  updatedWithinDays?: number;
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

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(Policy)
    private policiesRepository: Repository<Policy>,
  ) {}

  async findAll(filters: PolicyFilters): Promise<Policy[]> {
    const { q, region, types, audiences, updatedWithinDays } = filters;

    const where: any = {};

    if (q?.trim()) {
      where.title = Like(`%${q.trim()}%`);
    }

    if (region?.trim()) {
      where.regionName = Like(`%${region.trim()}%`);
    }

    if (types?.length > 0) {
      where.policyType = In(types);
    }

    if (audiences?.length > 0) {
      where.targetAudience = Like(`%${audiences.join('%')}%`);
    }

    if (updatedWithinDays) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - updatedWithinDays);
      where.updatedAt = MoreThanOrEqual(pastDate);
    }

    return this.policiesRepository.find({
      where,
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Policy | null> {
    return this.policiesRepository.findOne({ where: { id } });
  }

  async findFeatured(limit: number = 6): Promise<Policy[]> {
    return this.policiesRepository.find({
      where: { isFeatured: true },
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }

  async findAllForAdmin(filters: PolicyFilters & { page?: number; limit?: number }): Promise<{ data: Policy[]; total: number }> {
    const { page = 1, limit = 20, ...restFilters } = filters;

    const [data, total] = await this.policiesRepository.findAndCount({
      where: this.buildWhere(restFilters),
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async create(data: CreatePolicyDto): Promise<Policy> {
    const policy = this.policiesRepository.create(data) as any;
    return this.policiesRepository.save(policy);
  }

  async update(id: string, data: UpdatePolicyDto): Promise<Policy> {
    const policy = await this.policiesRepository.findOne({ where: { id } });
    if (!policy) {
      throw new Error('政策不存在');
    }
    Object.assign(policy, data);
    return this.policiesRepository.save(policy);
  }

  async delete(id: string): Promise<void> {
    await this.policiesRepository.delete(id);
  }

  private buildWhere(filters: PolicyFilters): any {
    const where: any = {};
    const { q, region, types, audiences, updatedWithinDays } = filters;

    if (q?.trim()) {
      where.title = Like(`%${q.trim()}%`);
    }
    if (region?.trim()) {
      where.regionName = Like(`%${region.trim()}%`);
    }
    if (types?.length > 0) {
      where.policyType = In(types);
    }
    if (audiences?.length > 0) {
      where.targetAudience = Like(`%${audiences.join('%')}%`);
    }
    if (updatedWithinDays) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - updatedWithinDays);
      where.updatedAt = MoreThanOrEqual(pastDate);
    }

    return where;
  }
}
