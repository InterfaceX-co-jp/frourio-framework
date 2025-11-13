/**
 * Swagger/OpenAPI Configuration
 *
 * This file contains settings for API documentation generation and Swagger UI.
 */

import { z } from 'zod';
import { env } from '../env.js';

const swaggerConfigSchema = z.object({
  enabled: z.boolean(),
  path: z.string(),
  title: z.string(),
  version: z.string(),
  description: z.string().optional(),
  servers: z
    .array(
      z.object({
        url: z.string(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

export type SwaggerConfig = z.infer<typeof swaggerConfigSchema>;

const isEnabled = (() => {
  if (process.env.SWAGGER_ENABLED !== undefined) {
    return String(process.env.SWAGGER_ENABLED).toLowerCase() === 'true';
  }
  return process.env.NODE_ENV !== 'production';
})();

export default swaggerConfigSchema.parse({
  enabled: isEnabled,
  path: env.SWAGGER_PATH || '/api-docs',
  title: env.SWAGGER_TITLE || env.APP_NAME || 'API',
  version: env.SWAGGER_VERSION || '1.0.0',
  description: env.SWAGGER_DESCRIPTION || 'API Documentation',
  servers: [
    {
      url: env.APP_URL || 'http://localhost:31577',
      description: env.NODE_ENV === 'production' ? 'Production' : 'Development',
    },
  ],
});
