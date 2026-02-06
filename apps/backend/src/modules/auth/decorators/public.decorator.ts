import { SetMetadata } from '@nestjs/common';

/**
 * Public decorator metadata key
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public decorator
 * Use this decorator to mark routes that should skip JWT authentication
 * Example: @Public() @Post('login')
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
