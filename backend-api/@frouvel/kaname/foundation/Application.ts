/**
 * Application Container
 *
 * Core application container inspired by Laravel's Illuminate\Foundation\Application.
 * Manages service bindings, singletons, and application lifecycle.
 */

import type { FastifyInstance } from 'fastify';

export interface ServiceProvider {
  register(app: Application): void | Promise<void>;
  boot?(app: Application): void | Promise<void>;
}

export class Application {
  private readonly _bindings: Map<string, any> = new Map();
  private readonly _singletons: Map<string, any> = new Map();
  private readonly _singletonInstances: Map<string, any> = new Map();
  private readonly _providers: ServiceProvider[] = [];
  private _booted: boolean = false;
  private _basePath: string;
  private _fastifyInstance: FastifyInstance | null = null;

  constructor(basePath: string) {
    this._basePath = basePath;
    this.registerBaseBindings();
  }

  /**
   * Register base application bindings
   */
  private registerBaseBindings(): void {
    this._singletons.set('app', this);
  }

  /**
   * Get the base path of the application
   */
  basePath(path: string = ''): string {
    return this._basePath + (path ? `/${path.replace(/^\//, '')}` : '');
  }

  /**
   * Get the bootstrap path
   */
  bootstrapPath(): string {
    return this.basePath('bootstrap/cache');
  }

  /**
   * Get the config path
   */
  configPath(): string {
    return this.basePath('config');
  }

  /**
   * Bind a service to the container
   */
  bind<T>(key: string, factory: () => T): void {
    this._bindings.set(key, factory);
  }

  /**
   * Bind a singleton to the container
   */
  singleton<T>(key: string, factory: () => T): void {
    this._singletons.set(key, factory);
  }

  /**
   * Resolve a service from the container
   */
  make<T>(key: string): T {
    // Check singletons first
    if (this._singletons.has(key)) {
      // Return cached instance if it exists
      if (this._singletonInstances.has(key)) {
        return this._singletonInstances.get(key);
      }
      
      // Create and cache the instance
      const factory = this._singletons.get(key);
      const instance = typeof factory === 'function' ? factory() : factory;
      this._singletonInstances.set(key, instance);
      return instance;
    }

    // Check bindings
    if (this._bindings.has(key)) {
      const factory = this._bindings.get(key);
      return factory();
    }

    throw new Error(`Service [${key}] not found in container`);
  }

  /**
   * Check if a service is bound
   */
  has(key: string): boolean {
    return this._bindings.has(key) || this._singletons.has(key);
  }

  /**
   * Register a service provider
   */
  register(provider: ServiceProvider): void {
    this._providers.push(provider);
    provider.register(this);
  }

  /**
   * Boot all registered providers
   */
  async boot(): Promise<void> {
    if (this._booted) {
      return;
    }

    for (const provider of this._providers) {
      if (provider.boot) {
        await provider.boot(this);
      }
    }

    this._booted = true;
  }

  /**
   * Check if the application is booted
   */
  isBooted(): boolean {
    return this._booted;
  }

  /**
   * Set the Fastify instance
   */
  setFastifyInstance(instance: FastifyInstance): void {
    this._fastifyInstance = instance;
    this.singleton('fastify', () => instance);
  }

  /**
   * Get the Fastify instance
   */
  getFastifyInstance(): FastifyInstance | null {
    return this._fastifyInstance;
  }

  /**
   * Get environment value
   */
  environment(): string {
    return process.env.NODE_ENV || 'production';
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.environment() === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.environment() === 'development';
  }

  /**
   * Check if running in testing
   */
  isTesting(): boolean {
    return this.environment() === 'test';
  }
}
