import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';

/**
 * User Seeder
 * Seeds the database with default admin user
 */
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Run the seeder
   * @param clean - If true, removes all existing users before seeding
   */
  async run(clean: boolean = false): Promise<void> {
    this.logger.log('Starting user seeder...');

    const userRepository = this.dataSource.getRepository(User);

    try {
      // Clean existing data if requested
      if (clean) {
        this.logger.log('Cleaning existing users...');
        await userRepository.clear();
        this.logger.log('All existing users removed');
      }

      // Read credentials from environment variables (with defaults for dev)
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'k4sla1!';

      // Check if admin user already exists
      const adminExists = await userRepository.findOne({
        where: { username: adminUsername },
      });

      if (adminExists) {
        this.logger.log(`User "${adminUsername}" already exists, skipping creation`);
        return;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const adminUser = userRepository.create({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin',
      });

      await userRepository.save(adminUser);

      this.logger.log('\n========================================');
      this.logger.log('User Seeding Statistics:');
      this.logger.log('✓ Admin user created successfully');
      this.logger.log(`  Username: ${adminUsername}`);
      this.logger.log('  Password: ********');
      this.logger.log('  Role: admin');
      this.logger.log('========================================');

      this.logger.log('\nSeeding completed successfully!');
    } catch (error) {
      this.logger.error(`Seeding failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
