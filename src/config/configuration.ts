import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  name: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: process.env.DATABASE_SSL === 'true',
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}));

export const telegramConfig = registerAs('telegram', () => ({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  adminTelegramId: process.env.ADMIN_TELEGRAM_ID || '',
  // Support comma-separated list of admin IDs
  adminTelegramIds: (process.env.ADMIN_TELEGRAM_ID || '').split(',').map(id => id.trim()).filter(Boolean),
  webAppUrl: process.env.WEBAPP_URL,
  initDataMaxAge: parseInt(process.env.TELEGRAM_INIT_DATA_MAX_AGE || '300', 10),
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiry: process.env.JWT_EXPIRY || '1h',
}));

export const encryptionConfig = registerAs('encryption', () => ({
  key: process.env.DATA_ENCRYPTION_KEY,
}));

export const storageConfig = registerAs('storage', () => ({
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
}));

export const uploadConfig = registerAs('upload', () => ({
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,audio/mpeg,audio/ogg')
    .split(',').map((type) => type.trim()).filter(Boolean),
}));

export const throttleConfig = registerAs('throttle', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  authTtl: parseInt(process.env.THROTTLE_AUTH_TTL || '60', 10),
  authLimit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '10', 10),
}));

export const broadcastConfig = registerAs('broadcast', () => ({
  rateLimit: parseInt(process.env.BROADCAST_RATE_LIMIT || '25', 10),
  batchSize: parseInt(process.env.BROADCAST_BATCH_SIZE || '100', 10),
}));

export const securityConfig = registerAs('security', () => ({
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  trustedProxies: (process.env.TRUSTED_PROXIES || '127.0.0.1').split(',').map((ip) => ip.trim()).filter(Boolean),
}));
