import { z } from 'zod';

/**
 * Environment configuration schema with strict validation.
 * Uses Zod for runtime type safety and validation.
 */
export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('api/v1'),

  // Database (optional if DATABASE_URL is provided)
  DATABASE_HOST: z.string().optional().default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_NAME: z.string().optional().default('tdtu'),
  DATABASE_USER: z.string().optional().default('postgres'),
  DATABASE_PASSWORD: z.string().optional().default(''),
  DATABASE_SSL: z.coerce.boolean().default(false),
  DATABASE_SYNCHRONIZE: z.coerce.boolean().default(false),
  DATABASE_LOGGING: z.coerce.boolean().default(false),
  DATABASE_URL: z.string().optional(),

  // Redis (optional if REDIS_URL is provided)
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_URL: z.string().optional(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1).regex(/^\d+:[A-Za-z0-9_-]+$/, 'Invalid Telegram bot token format'),
  ADMIN_TELEGRAM_ID: z.string().regex(/^\d+$/, 'Admin Telegram ID must be a number'),
  WEBAPP_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRY: z.string().default('1h'),

  // Telegram WebApp Auth
  TELEGRAM_INIT_DATA_MAX_AGE: z.coerce.number().int().positive().default(300),

  // Data Encryption (optional - use default if not provided)
  DATA_ENCRYPTION_KEY: z.string().optional().default('a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(52428800), // 50MB
  ALLOWED_MIME_TYPES: z
    .string()
    .optional()
    .transform((val) => {
      const defaultMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/ogg'];
      if (!val) return defaultMimes;
      return val.split(',').map((type) => type.trim()).filter(Boolean);
    }),

  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
  THROTTLE_AUTH_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_AUTH_LIMIT: z.coerce.number().int().positive().default(10),

  // Broadcast
  BROADCAST_RATE_LIMIT: z.coerce.number().int().positive().default(25),
  BROADCAST_BATCH_SIZE: z.coerce.number().int().positive().default(100),

  // Security
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return ['http://localhost:3000'];
      return val.split(',').map((origin) => origin.trim()).filter(Boolean);
    }),
  TRUSTED_PROXIES: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return ['127.0.0.1'];
      return val.split(',').map((ip) => ip.trim()).filter(Boolean);
    }),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed config.
 * Throws detailed error messages on validation failure.
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  
  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => {
      const path = issue.path.join('.');
      return `  - ${path}: ${issue.message}`;
    }).join('\n');
    
    throw new Error(
      `Environment validation failed:\n${errorMessages}\n\nPlease check your .env file.`
    );
  }
  
  return result.data;
}
