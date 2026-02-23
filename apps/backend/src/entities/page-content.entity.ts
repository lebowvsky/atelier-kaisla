import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

/**
 * PageContent entity
 * Generic CMS content for any page/section combination
 * Unique constraint on (page, section) ensures one entry per section per page
 */
@Entity('page_content')
@Unique(['page', 'section'])
export class PageContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: false })
  @Index()
  page: string;

  @Column({ length: 100, nullable: false })
  section: string;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 500, nullable: true })
  image: string;

  @Column({ name: 'image_alt', length: 255, nullable: true })
  imageAlt: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  @Index()
  isPublished: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  @Index()
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
