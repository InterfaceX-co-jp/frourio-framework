// Global type declarations for environment variables
import type { z } from 'zod';
import type { envSchema } from './env';

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
