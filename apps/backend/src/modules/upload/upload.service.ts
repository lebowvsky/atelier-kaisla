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
  private readonly uploadDir = './uploads/products';

  /**
   * Get the full URL for an uploaded file
   */
  getFileUrl(filename: string, baseUrl: string): string {
    return `${baseUrl}/uploads/products/${filename}`;
  }

  /**
   * Delete a file from the uploads directory
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = join(this.uploadDir, filename);
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
  async deleteFiles(filenames: string[]): Promise<void> {
    const deletePromises = filenames.map((filename) =>
      this.deleteFile(filename).catch((error) => {
        // Log error but don't fail the entire operation
        this.logger.warn(`Failed to delete file ${filename}: ${error.message}`);
      }),
    );

    await Promise.all(deletePromises);
  }

  /**
   * Check if upload directory exists, create if not
   */
  async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }
}
