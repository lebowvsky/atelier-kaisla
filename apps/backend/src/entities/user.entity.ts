import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * User entity
 * Represents an admin or editor user with authentication credentials
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100, nullable: false })
  @Index() // Index for login queries
  username: string;

  @Column({ length: 255, nullable: false })
  password: string; // Bcrypt hashed password

  @Column({
    type: 'enum',
    enum: ['admin', 'editor'],
    default: 'editor',
    nullable: false,
  })
  role: 'admin' | 'editor';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
