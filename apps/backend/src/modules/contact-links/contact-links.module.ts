import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactLinksService } from './contact-links.service';
import { ContactLinksController } from './contact-links.controller';
import { ContactLink } from '../../entities/contact-link.entity';

/**
 * ContactLinks module
 * Encapsulates all contact link and social media related functionality
 */
@Module({
  imports: [TypeOrmModule.forFeature([ContactLink])],
  controllers: [ContactLinksController],
  providers: [ContactLinksService],
  exports: [ContactLinksService],
})
export class ContactLinksModule {}
