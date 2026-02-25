import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BlogArticleImage } from './blog-article-image.entity';
import { BlogTag } from './blog-tag.entity';

/**
 * BlogArticle entity
 * Represents a blog article with HTML content, images, and tags
 */
@Entity('blog_articles')
export class BlogArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ length: 255, nullable: true })
  subtitle?: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ length: 255, nullable: false, unique: true })
  @Index()
  slug: string;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  @Index()
  publishedAt?: Date;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  @Index()
  isPublished: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  @Index()
  sortOrder: number;

  @OneToMany(() => BlogArticleImage, (img) => img.article, {
    cascade: true,
    eager: true,
  })
  images: BlogArticleImage[];

  @ManyToMany(() => BlogTag, (tag) => tag.articles, {
    eager: true,
  })
  @JoinTable({
    name: 'blog_articles_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: BlogTag[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
