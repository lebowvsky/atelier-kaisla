import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Exception filter for file upload errors
 * Handles multer errors and provides user-friendly error messages
 */
@Catch(Error)
export class FileUploadExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle multer-specific errors
    if (exception.message.includes('Invalid file type')) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        error: 'Invalid File Type',
      });
    }

    if (exception.message.includes('File too large')) {
      return response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'File size exceeds 5MB limit',
        error: 'File Too Large',
      });
    }

    // Default error handling
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An error occurred during file upload',
      error: 'Upload Error',
    });
  }
}
