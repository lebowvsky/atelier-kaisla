import { PartialType } from '@nestjs/swagger';
import { CreateContactLinkDto } from './create-contact-link.dto';

/**
 * DTO for updating an existing contact link
 * All fields from CreateContactLinkDto are optional
 */
export class UpdateContactLinkDto extends PartialType(CreateContactLinkDto) {}
