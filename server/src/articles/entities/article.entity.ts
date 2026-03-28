import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cover_image' })
  coverImage: string;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'author_id' })
  authorId: number;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @Column({ type: 'datetime', nullable: true, name: 'published_at' })
  publishedAt: Date;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'view_count' })
  viewCount: number;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'meta_title' })
  metaTitle: string;

  @Column({ type: 'text', nullable: true, name: 'meta_description' })
  metaDescription: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'meta_keywords' })
  metaKeywords: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'static_path' })
  staticPath: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => ArticleTag, (tag) => tag.article, { cascade: true })
  tags: ArticleTag[];

  @OneToMany(() => ArticleCategoryMap, (map) => map.article, { cascade: true })
  categories: ArticleCategoryMap[];
}

@Entity('article_tags')
export class ArticleTag {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'article_id' })
  articleId: number;

  @Column({ type: 'varchar', length: 50, name: 'tag_name' })
  tagName: string;

  article: Article;
}

@Entity('article_categories')
export class ArticleCategory {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'sort_order' })
  sortOrder: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ArticleCategoryMap, (map) => map.category)
  articles: ArticleCategoryMap[];
}

@Entity('article_category_map')
export class ArticleCategoryMap {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'article_id' })
  articleId: number;

  @Column({ type: 'int', unsigned: true, name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Article, (article) => article.categories, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => ArticleCategory, (category) => category.articles, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: ArticleCategory;
}
