import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { PageContent } from './page-content.entity';

/**
 * PageContentBlock entity
 * Represents an editable info-block (title + description) attached to a
 * PageContent section. Used by the wall-hanging/info and rugs/info sections
 * to render a variable list of blocks managed from the backoffice.
 */
@Entity('page_content_blocks')
export class PageContentBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  pageContentId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'int', default: 0 })
  @Index()
  sortOrder: number;

  @ManyToOne(() => PageContent, (pageContent) => pageContent.blocks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pageContentId' })
  pageContent: PageContent;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
