import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('policies')
export class Policy {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 200, name: 'region_name' })
  regionName: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  lng: number;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'policy_type' })
  policyType: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'target_audience' })
  targetAudience: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'text', nullable: true })
  materials: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'official_url' })
  officialUrl: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'date', nullable: true, name: 'published_on' })
  publishedOn: Date;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'source_name' })
  sourceName: string;

  @Column({ type: 'date', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  isFeatured: boolean;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at_db' })
  updatedAtDb: Date;
}
