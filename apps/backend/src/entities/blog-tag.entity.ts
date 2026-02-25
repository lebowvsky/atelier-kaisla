import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { BlogArticle } from './blog-article.entity';

/**
 * BlogTag entity
 * Represents a tag that can be associated with blog articles
 */
@Entity('blog_tags')
export class BlogTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: false, unique: true })
  @Index()
  name: string;

  @Column({ length: 100, nullable: false, unique: true })
  @Index()
  slug: string;

  @ManyToMany(() => BlogArticle, (article) => article.tags)
  articles: BlogArticle[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
