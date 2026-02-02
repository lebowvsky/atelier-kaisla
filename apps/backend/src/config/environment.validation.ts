import * as Joi from 'joi';

/**
 * Environment variables validation schema
 * Ensures all required environment variables are present and valid
 * Supports both POSTGRES_* and DATABASE_* naming conventions for Docker compatibility
 */
export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4000),

  // Database - Support both naming conventions
  POSTGRES_HOST: Joi.string().default('postgres'),
  DATABASE_HOST: Joi.string().optional(),
  POSTGRES_PORT: Joi.number().default(5432),
  DATABASE_PORT: Joi.number().optional(),
  POSTGRES_USER: Joi.string().when('DATABASE_USER', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_USER: Joi.string().optional(),
  POSTGRES_PASSWORD: Joi.string().when('DATABASE_PASSWORD', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_PASSWORD: Joi.string().optional(),
  POSTGRES_DB: Joi.string().when('DATABASE_NAME', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_NAME: Joi.string().optional(),

  // TypeORM options
  TYPEORM_SYNC: Joi.string().valid('true', 'false').default('false'),
});
