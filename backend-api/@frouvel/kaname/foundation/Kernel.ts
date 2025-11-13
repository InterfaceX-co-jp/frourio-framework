/**
 * Base Kernel
 *
 * Abstract base class for HTTP and Console kernels.
 * Defines the core bootstrap process.
 */

import type { Application } from './Application';
import type { Bootstrapper } from './Bootstrapper.interface';

export abstract class Kernel {
  protected readonly _app: Application;
  protected _bootstrapped: boolean = false;

  constructor(app: Application) {
    this._app = app;
  }

  /**
   * Get the bootstrappers for the application
   */
  protected abstract getBootstrappers(): Array<new () => Bootstrapper>;

  /**
   * Bootstrap the application for the given request/command
   */
  async bootstrap(): Promise<void> {
    if (this._bootstrapped) {
      return;
    }

    const bootstrappers = this.getBootstrappers().map(
      (Bootstrapper) => new Bootstrapper(),
    );

    for (const bootstrapper of bootstrappers) {
      await bootstrapper.bootstrap(this._app);
    }

    this._bootstrapped = true;
  }

  /**
   * Get the application instance
   */
  getApplication(): Application {
    return this._app;
  }
}
