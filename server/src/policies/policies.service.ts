import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Policy } from './policy.entity';

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
      where.policyType = types;
    }

    if (updatedWithinDays) {
      const now = new Date();
      const pastDate = new Date();
      pastDate.setDate(now.getDate() - updatedWithinDays);
      where.updatedAt = { $gte: pastDate };
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

  async upsert(policy: Partial<Policy>): Promise<Policy> {
    return this.policiesRepository.save(policy);
  }
}

interface PolicyFilters {
  q?: string;
  region?: string;
  types?: string[];
  audiences?: string[];
  updatedWithinDays?: number;
}
