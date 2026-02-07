import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ProductImage } from './product-image.entity';

/**
 * Product entity
 * Represents a product (wall hanging or rug) in the Atelier Kaisla catalog
 */
@Entity('products')
@Index(['category', 'status']) // Composite index for filtering
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false })
  @Index() // Index for search and filtering
  name: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['wall-hanging', 'rug'],
    nullable: false,
  })
  @Index()
  category: 'wall-hanging' | 'rug';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({
    type: 'enum',
    enum: ['available', 'sold', 'draft'],
    default: 'draft',
    nullable: false,
  })
  @Index()
  status: 'available' | 'sold' | 'draft';

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @OneToMany(() => ProductImage, (img) => img.product, {
    cascade: true,
    eager: true,
  })
  productImages: ProductImage[];

  @Column({ type: 'json', nullable: true })
  dimensions?: {
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };

  @Column({ type: 'text', nullable: true })
  materials?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
