import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Upload service
 * Provides file management operations (delete, retrieve, etc.)
 */
@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly baseUploadDir = './uploads';

  /**
   * Get the upload directory path for a given subdirectory
   */
  private getUploadDir(subdir: string = 'products'): string {
    return join(this.baseUploadDir, subdir);
  }

  /**
   * Get the full URL for an uploaded file
   */
  getFileUrl(
    filename: string,
    baseUrl: string,
    subdir: string = 'products',
  ): string {
    const url = `${baseUrl}/uploads/${subdir}/${filename}`;
    this.logger.debug(`Generated file URL: ${url}`);
    return url;
  }

  /**
   * Delete a file from the uploads directory
   */
  async deleteFile(
    filename: string,
    subdir: string = 'products',
  ): Promise<void> {
    try {
      const filePath = join(this.getUploadDir(subdir), filename);
      await fs.unlink(filePath);
      this.logger.log(`File deleted successfully: ${filename}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException(`File not found: ${filename}`);
      }
      this.logger.error(`Failed to delete file ${filename}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(
    filenames: string[],
    subdir: string = 'products',
  ): Promise<void> {
    const deletePromises = filenames.map((filename) =>
      this.deleteFile(filename, subdir).catch((error) => {
        // Log error but don't fail the entire operation
        this.logger.warn(`Failed to delete file ${filename}: ${error.message}`);
      }),
    );

    await Promise.all(deletePromises);
  }

  /**
   * Check if upload directory exists, create if not
   */
  async ensureUploadDir(subdir: string = 'products'): Promise<void> {
    const uploadDir = this.getUploadDir(subdir);
    try {
      await fs.access(uploadDir);
      this.logger.debug(`Upload directory exists: ${uploadDir}`);
    } catch {
      this.logger.log(`Creating upload directory: ${uploadDir}`);
      await fs.mkdir(uploadDir, { recursive: true });
      this.logger.log(`Upload directory created successfully: ${uploadDir}`);
    }
  }
}
