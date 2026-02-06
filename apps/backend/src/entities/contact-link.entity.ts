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
 * Platform types for contact links and social media profiles
 */
export enum ContactPlatform {
  EMAIL = 'email',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  LINKEDIN = 'linkedin',
  PINTEREST = 'pinterest',
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  WEBSITE = 'website',
  OTHER = 'other',
}

/**
 * ContactLink entity
 * Represents a contact method or social media link for the creator
 */
@Entity('contact_links')
@Index(['isActive', 'sortOrder'])
@Unique(['platform', 'url'])
export class ContactLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ContactPlatform,
    nullable: false,
  })
  platform: ContactPlatform;

  @Column({ length: 500, nullable: false })
  url: string;

  @Column({ length: 255, nullable: true })
  label?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
