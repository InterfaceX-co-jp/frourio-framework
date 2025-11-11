/**
 * JWT Configuration
 *
 * Configuration for JSON Web Token authentication.
 */

import { env } from '$/env';

export default {
  /**
   * JWT Secret Key
   */
  secret: env.API_JWT_SECRET,

  /**
   * Token Expiration Time (in seconds)
   */
  expiresIn: env.JWT_EXPIRES_IN,

  /**
   * Refresh Token Expiration Time (in seconds)
   */
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,

  /**
   * JWT Scopes
   */
  scope: {
    admin: ['admin'] as const,
    user: {
      default: ['user'] as const,
    },
  },

  /**
   * JWT Algorithm
   */
  algorithm: 'HS256' as const,

  /**
   * JWT Issuer
   */
  issuer: env.JWT_ISSUER,

  /**
   * JWT Audience
   */
  audience: env.JWT_AUDIENCE,
};
