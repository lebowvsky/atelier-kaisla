import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { BlogArticle } from './blog-article.entity';

/**
 * BlogArticleImage entity
 * Represents an image belonging to a blog article, with metadata for display options
 */
@Entity('blog_article_images')
export class BlogArticleImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ name: 'alt_text', type: 'varchar', length: 255, nullable: true })
  altText?: string;

  @Column({ name: 'is_cover', type: 'boolean', default: false })
  @Index()
  isCover: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'article_id', type: 'uuid' })
  @Index()
  articleId: string;

  @ManyToOne(() => BlogArticle, (article) => article.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: BlogArticle;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
