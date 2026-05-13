/**
 * HTTP Entry Point
 *
 * Bootstraps the application and starts the HTTP server.
 * This is the entry point for web requests.
 */

import app from '$/bootstrap/app';
import type { HttpKernel } from '$/@frouvel/kaname/foundation';
import { env } from '$/env';

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request using
| the application's HTTP kernel. Then, we will send the response back
| to this client's browser, allowing them to enjoy our application.
|
*/

const kernel = app.make<HttpKernel>('HttpKernel');

kernel
  .handle()
  .then((fastify) => {
    fastify.listen(
      {
        port: env.API_SERVER_PORT,
        host: '0.0.0.0'
      },
      (err, address) => {
        if (err) {
          console.error('Error starting server:', err);
          process.exit(1);
        }
        console.log(`Server listening at ${address}`);
      }
    );
  })
  .catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
