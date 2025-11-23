import { z } from 'zod';
import { defineConfig, type ConfigType } from '$/@frouvel/kaname/config';
import { env } from '../env';

const redisConfig = defineConfig({
  schema: z.object({
    url: z.string().optional(),
    host: z.string(),
    port: z.number(),
    password: z.string().optional(),
    database: z.number(),
    maxRetries: z.number(),
    retryDelay: z.number(),
    keyPrefix: z.string().optional(),
    defaultTTL: z.number().optional(),
  }),
  load: () => ({
    url: env.REDIS_URL,
    host: env.REDIS_HOST || 'localhost',
    port: parseInt(env.REDIS_PORT || '6379', 10),
    password: env.REDIS_PASSWORD,
    database: parseInt(env.REDIS_DB || '0', 10),
    maxRetries: parseInt(env.REDIS_MAX_RETRIES || '3', 10),
    retryDelay: parseInt(env.REDIS_RETRY_DELAY || '1000', 10),
    keyPrefix: env.REDIS_KEY_PREFIX,
    defaultTTL: env.REDIS_DEFAULT_TTL
      ? parseInt(env.REDIS_DEFAULT_TTL, 10)
      : undefined,
  }),
});

export type RedisConfig = ConfigType<typeof redisConfig>;
export const redisConfigSchema = redisConfig.schema;
export default redisConfig;
