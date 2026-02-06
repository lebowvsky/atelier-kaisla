import { PartialType } from '@nestjs/swagger';
import { CreateAboutSectionDto } from './create-about-section.dto';

/**
 * DTO for updating an existing about section
 * All fields from CreateAboutSectionDto are optional
 */
export class UpdateAboutSectionDto extends PartialType(CreateAboutSectionDto) {}
