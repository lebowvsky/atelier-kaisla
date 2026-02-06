import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * AboutSection entity
 * Represents a section on the About page with text content and an image
 */
@Entity('about_sections')
export class AboutSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ type: 'jsonb', nullable: false })
  paragraphs: string[];

  @Column({ length: 500, nullable: false })
  image: string;

  @Column({ name: 'image_alt', length: 255, nullable: false })
  imageAlt: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  @Index()
  sortOrder: number;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  @Index()
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
