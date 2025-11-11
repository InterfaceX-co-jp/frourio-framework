/**
 * Admin Configuration
 * 
 * Configuration for admin user credentials and settings.
 */

import { env } from '$/env';

export default {
  /**
   * Default Admin Email
   */
  email: env.ADMIN_EMAIL,

  /**
   * Default Admin Password
   */
  password: env.ADMIN_PASSWORD,

  /**
   * Admin Session Timeout (in seconds)
   */
  sessionTimeout: env.ADMIN_SESSION_TIMEOUT,

  /**
   * Admin JWT Token Expiration (in seconds)
   */
  tokenExpiration: env.ADMIN_TOKEN_EXPIRATION,
};