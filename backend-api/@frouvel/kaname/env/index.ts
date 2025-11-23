/**
 * Environment Module Entry Point
 *
 * Re-exports the Env facade for convenient importing.
 *
 * @example
 * import { Env } from '$/@frouvel/kaname/env';
 *
 * const port = Env.getInt('PORT', 3000);
 * const isDev = Env.isDevelopment();
 */

export { Env } from './Env';