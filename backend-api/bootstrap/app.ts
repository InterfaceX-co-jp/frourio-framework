/**
 * Bootstrap Application
 *
 * Creates and returns the application instance.
 * This is the main entry point for both HTTP and Console kernels.
 *
 * Similar to Laravel's bootstrap/app.php
 */

import {
  Application,
  HttpKernel,
  ConsoleKernel,
  DatabaseServiceProvider,
  ConsoleServiceProvider,
  SwaggerServiceProvider,
} from '$/@frouvel/kaname/foundation';
import { AppServiceProvider } from '$/app/providers/AppServiceProvider';
import { resolve } from 'path';

// Get the base path (backend-api directory)
// Resolve to absolute path to ensure consistency across environments
// In production build, __dirname is backend-api/ (where index.js is)
// In development, __dirname is backend-api/bootstrap/
const basePath = __dirname.endsWith('bootstrap')
  ? resolve(__dirname, '..')
  : __dirname;


/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| The first thing we will do is create a new application instance
| which serves as the "glue" for all the components, and is
| the IoC container for the system binding all of the various parts.
|
*/

const app = new Application(basePath);

/*
|--------------------------------------------------------------------------
| Bind Important Interfaces
|--------------------------------------------------------------------------
|
| Next, we need to bind some important interfaces into the container so
| we will be able to resolve them when needed. The kernels serve the
| incoming requests to this application from both the web and CLI.
|
*/

app.singleton('HttpKernel', () => new HttpKernel(app));
app.singleton('ConsoleKernel', () => new ConsoleKernel(app));

/*
|--------------------------------------------------------------------------
| Register Service Providers
|--------------------------------------------------------------------------
|
| Register all application service providers. These providers bind
| services into the container and will be booted when the application
| starts handling requests.
|
*/

const providers = [
  // Framework providers
  DatabaseServiceProvider,
  ConsoleServiceProvider,
  SwaggerServiceProvider,
  
  // Application providers
  AppServiceProvider,
];

providers.forEach((Provider) => {
  const provider = new Provider();
  app.register(provider);
});

/*
|--------------------------------------------------------------------------
| Return The Application
|--------------------------------------------------------------------------
|
| This script returns the application instance. The instance is given to
| the calling script so we can separate the building of the instances
| from the actual running of the application and sending responses.
|
*/

export default app;
