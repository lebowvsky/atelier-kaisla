import { PartialType } from '@nestjs/swagger';
import { CreatePageContentDto } from './create-page-content.dto';

/**
 * DTO for updating an existing page content entry
 * All fields from CreatePageContentDto are optional
 */
export class UpdatePageContentDto extends PartialType(CreatePageContentDto) {}
