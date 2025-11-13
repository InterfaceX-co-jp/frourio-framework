/**
 * Swagger/OpenAPI Configuration
 *
 * This file contains settings for API documentation generation and Swagger UI.
 */

import { z } from 'zod';
import { env } from '$/env';

export const swaggerConfigSchema = z.object({
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

export default swaggerConfigSchema.parse({
  enabled: env.SWAGGER_ENABLED ?? env.NODE_ENV !== 'production',
  path: env.SWAGGER_PATH ?? '/api-docs',
  title: env.SWAGGER_TITLE ?? env.APP_NAME,
  version: env.SWAGGER_VERSION ?? '1.0.0',
  description: env.SWAGGER_DESCRIPTION ?? 'API Documentation',
  servers: [
    {
      url: env.APP_URL ?? 'http://localhost:8080',
      description: env.NODE_ENV === 'production' ? 'Production' : 'Development',
    },
  ],
});
