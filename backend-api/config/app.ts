/**
 * Application Configuration
 * 
 * This file contains core application settings.
 */

import { env } from '$/env';

export default {
  /**
   * Application Name
   */
  name: env.APP_NAME,

  /**
   * Application Environment
   */
  env: env.NODE_ENV,

  /**
   * Debug Mode
   */
  debug: env.APP_DEBUG,

  /**
   * Application URL
   */
  url: env.APP_URL,

  /**
   * Application Timezone
   */
  timezone: env.TZ,

  /**
   * Application Locale
   */
  locale: env.APP_LOCALE,

  /**
   * Fallback Locale
   */
  fallbackLocale: env.APP_FALLBACK_LOCALE,
};