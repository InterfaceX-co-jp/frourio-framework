/**
 * Swagger/OpenAPI Configuration
 *
 * This file contains settings for API documentation generation and Swagger UI.
 */

import { z } from 'zod';
import {
  defineConfig,
  type ConfigType,
} from '../@frouvel/kaname/config/index.js';
import { env } from '../env.js';

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

const swaggerConfig = defineConfig({
  schema: z.object({
    enabled: z.boolean(),
    path: z.string(),
    apiBasePath: z.string().optional(),
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
  }),
  load: () => {
    const enabled =
      env.SWAGGER_ENABLED !== undefined
        ? env.SWAGGER_ENABLED
        : env.NODE_ENV !== 'production';

    return {
      enabled,
      path: env.SWAGGER_PATH || '/api-docs',
      apiBasePath: '/api',
      title: env.SWAGGER_TITLE || env.APP_NAME || 'API',
      version: env.SWAGGER_VERSION || '1.0.0',
      description: env.SWAGGER_DESCRIPTION || 'API Documentation',
      servers: [
        {
          url: env.APP_URL,
          description:
            env.NODE_ENV === 'production' ? 'Production' : 'Development',
        },
      ],
      tagDescriptions,
    };
  },
});

export type SwaggerConfig = ConfigType<typeof swaggerConfig>;
export const swaggerConfigSchema = swaggerConfig.schema;
export default swaggerConfig;
