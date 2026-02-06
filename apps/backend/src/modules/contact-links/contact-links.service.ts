import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactLink } from '../../entities/contact-link.entity';
import { CreateContactLinkDto } from './dto/create-contact-link.dto';
import { UpdateContactLinkDto } from './dto/update-contact-link.dto';

/**
 * ContactLinks service - handles business logic for contact and social media links
 */
@Injectable()
export class ContactLinksService {
  private readonly logger = new Logger(ContactLinksService.name);

  constructor(
    @InjectRepository(ContactLink)
    private readonly contactLinkRepository: Repository<ContactLink>,
  ) {}

  /**
   * Create a new contact link
   */
  async create(createDto: CreateContactLinkDto): Promise<ContactLink> {
    const contactLink = this.contactLinkRepository.create(createDto);
    const saved = await this.contactLinkRepository.save(contactLink);

    this.logger.log(
      `Contact link created: ${saved.id} (${saved.platform})`,
    );
    return saved;
  }

  /**
   * Find all active contact links ordered by sortOrder (public)
   */
  async findActive(): Promise<ContactLink[]> {
    return await this.contactLinkRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * Find all contact links ordered by sortOrder (backoffice)
   */
  async findAll(): Promise<ContactLink[]> {
    return await this.contactLinkRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * Find a contact link by ID
   */
  async findById(id: string): Promise<ContactLink> {
    const contactLink = await this.contactLinkRepository.findOne({
      where: { id },
    });

    if (!contactLink) {
      throw new NotFoundException(`Contact link with ID "${id}" not found`);
    }

    return contactLink;
  }

  /**
   * Update a contact link
   */
  async update(
    id: string,
    updateDto: UpdateContactLinkDto,
  ): Promise<ContactLink> {
    const contactLink = await this.findById(id);

    // Exclude protected fields from the update payload
    const { id: _id, createdAt: _createdAt, ...safeUpdate } =
      updateDto as UpdateContactLinkDto & { id?: string; createdAt?: Date };
    Object.assign(contactLink, safeUpdate);

    const updated = await this.contactLinkRepository.save(contactLink);
    this.logger.log(`Contact link updated: ${id}`);
    return updated;
  }

  /**
   * Delete a contact link
   */
  async remove(id: string): Promise<void> {
    const contactLink = await this.findById(id);

    await this.contactLinkRepository.remove(contactLink);
    this.logger.log(`Contact link deleted: ${id}`);
  }
}
