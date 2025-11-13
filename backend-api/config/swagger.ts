/**
 * Swagger/OpenAPI Configuration
 *
 * This file contains settings for API documentation generation and Swagger UI.
 */

import { z } from 'zod';

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
  tagDescriptions: z.record(z.string(), z.string()).optional(),
});

export type SwaggerConfig = z.infer<typeof swaggerConfigSchema>;

/**
 * Tag descriptions for API grouping
 * Define custom descriptions for your API tags here
 */
const tagDescriptions: Record<string, string> = {
  Users: 'User management and account operations',
  Health: 'Service health and status checks',
  Auth: 'Authentication and authorization',
  Admin: 'Administrative operations',
  Example: 'Example endpoints for testing',
};

const isEnabled = (() => {
  if (process.env.SWAGGER_ENABLED !== undefined) {
    return String(process.env.SWAGGER_ENABLED).toLowerCase() === 'true';
  }
  return process.env.NODE_ENV !== 'production';
})();

export default swaggerConfigSchema.parse({
  enabled: isEnabled,
  path: process.env.SWAGGER_PATH || '/api-docs',
  title: process.env.SWAGGER_TITLE || process.env.APP_NAME || 'API',
  version: process.env.SWAGGER_VERSION || '1.0.0',
  description: process.env.SWAGGER_DESCRIPTION || 'API Documentation',
  servers: [
    {
      url: process.env.APP_URL || 'http://localhost:31577',
      description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
    },
  ],
  tagDescriptions,
});
