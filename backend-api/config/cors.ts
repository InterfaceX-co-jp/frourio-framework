/**
 * CORS Configuration
 *
 * Configure allowed origins for Cross-Origin Resource Sharing.
 */

import { env } from '$/env';

export default {
  /**
   * Allowed Origins
   *
   * List of origins that are allowed to access the API.
   * Can be strings or RegExp patterns.
   */
  origins: [
    env.WEB_FRONTEND_URL,
    // Add additional origins from environment variable
    ...(env.CORS_ADDITIONAL_ORIGINS
      ? env.CORS_ADDITIONAL_ORIGINS.split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : []),
  ],

  /**
   * Allowed Methods
   */
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  /**
   * Allowed Headers
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],

  /**
   * Exposed Headers
   */
  exposedHeaders: ['X-Total-Count'],

  /**
   * Credentials
   */
  credentials: true,

  /**
   * Max Age (in seconds)
   */
  maxAge: 86400, // 24 hours
};
