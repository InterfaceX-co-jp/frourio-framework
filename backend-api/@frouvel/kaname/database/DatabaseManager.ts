import type {
  DatabaseManager as IDatabaseManager,
  ConnectionConfig,
} from './contracts/DatabaseManager.interface';
import type { PrismaClient } from '@prisma/client';
import { getPrismaClient } from './PrismaClientManager';
import { getDrizzleClient } from './DrizzleClientManager';

/**
 * Database Manager
 *
 * Manages database connections and provides direct pass-through access
 * to ORM clients (Prisma, Drizzle) for zero performance overhead.
 *
 * @example
 * ```typescript
 * // Direct Prisma access (zero overhead)
 * const prisma = DB.prisma();
 * const users = await prisma.user.findMany();
 *
 * // Transactions
 * await DB.transaction(async (tx) => {
 *   await tx.user.create({ data: { name: 'John' } });
 * });
 *
 * // Multiple connections
 * const readReplica = DB.prisma('read-replica');
 * ```
 */
export class DatabaseManager implements IDatabaseManager {
  private defaultConnection: string;
  private connections: Map<string, ConnectionConfig> = new Map();
  private clients: Map<string, any> = new Map();
  private connectedClients: Set<string> = new Set();

  constructor(config: {
    default: string;
    connections: Record<string, ConnectionConfig>;
  }) {
    this.defaultConnection = config.default;

    // Store connection configurations
    for (const [name, connConfig] of Object.entries(config.connections)) {
      this.connections.set(name, connConfig);
    }
  }

  /**
   * Get the default connection name
   */
  getDefaultConnection(): string {
    return this.defaultConnection;
  }

  /**
   * Set the default connection
   */
  setDefaultConnection(name: string): void {
    if (!this.connections.has(name)) {
      throw new Error(`Connection '${name}' is not configured`);
    }
    this.defaultConnection = name;
  }

  /**
   * Get Prisma client for direct access (zero overhead)
   */
  prisma<T = PrismaClient>(connection?: string): T | null {
    const name = connection || this.defaultConnection;
    const config = this.connections.get(name);

    if (!config || config.driver !== 'prisma') {
      return null;
    }

    return this.getOrCreateClient<T>(name);
  }

  /**
   * Get Drizzle client for direct access (zero overhead)
   */
  drizzle<T = any>(connection?: string): T | null {
    const name = connection || this.defaultConnection;
    const config = this.connections.get(name);

    if (!config || config.driver !== 'drizzle') {
      return null;
    }

    return this.getOrCreateClient<T>(name);
  }

  /**
   * Get the underlying client (ORM-agnostic)
   */
  client<T = any>(connection?: string): T {
    const name = connection || this.defaultConnection;
    return this.getOrCreateClient<T>(name);
  }

  /**
   * Execute within a transaction
   */
  async transaction<T>(
    callback: (client: any) => Promise<T>,
    connection?: string,
  ): Promise<T> {
    const name = connection || this.defaultConnection;
    const config = this.connections.get(name);

    if (!config) {
      throw new Error(`Connection '${name}' is not configured`);
    }

    const client = this.getOrCreateClient(name);

    // Prisma transaction
    if (config.driver === 'prisma') {
      return (client as any).$transaction(callback);
    }

    // Drizzle transaction
    if (config.driver === 'drizzle') {
      return (client as any).transaction(callback);
    }

    throw new Error(`Unsupported driver: ${config.driver}`);
  }

  /**
   * Disconnect from a specific database
   */
  async disconnect(connection?: string): Promise<void> {
    const name = connection || this.defaultConnection;
    const client = this.clients.get(name);

    if (!client) {
      return;
    }

    const config = this.connections.get(name);
    if (!config) {
      return;
    }

    try {
      if (config.driver === 'prisma') {
        await client.$disconnect();
      } else if (config.driver === 'drizzle') {
        // Drizzle disconnect logic
        if (client.end) {
          await client.end();
        }
      }

      this.connectedClients.delete(name);
    } catch (error) {
      console.error(`Failed to disconnect from '${name}':`, error);
    }
  }

  /**
   * Disconnect from all databases
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.clients.keys()).map((name) =>
      this.disconnect(name),
    );

    await Promise.all(disconnectPromises);
    this.clients.clear();
    this.connectedClients.clear();
  }

  /**
   * Check if a connection is established
   */
  isConnected(connection?: string): boolean {
    const name = connection || this.defaultConnection;
    return this.connectedClients.has(name);
  }

  /**
   * Register a pre-configured client
   * Useful for testing or when you already have a client instance
   */
  registerClient(
    name: string,
    client: any,
    driver: 'prisma' | 'drizzle',
  ): void {
    this.clients.set(name, client);
    this.connections.set(name, {
      driver,
      // Other config doesn't matter since we're using a pre-configured client
    });
    this.connectedClients.add(name);
  }

  /**
   * Get or create a client for the given connection
   */
  private getOrCreateClient<T>(name: string): T {
    // Return existing client if available
    if (this.clients.has(name)) {
      return this.clients.get(name) as T;
    }

    const config = this.connections.get(name);
    if (!config) {
      throw new Error(`Connection '${name}' is not configured`);
    }

    // Create new client based on driver
    const client = this.createClient(name, config);
    this.clients.set(name, client);
    this.connectedClients.add(name);

    return client as T;
  }

  /**
   * Create a new database client
   */
  private createClient(name: string, config: ConnectionConfig): any {
    if (config.driver === 'prisma') {
      return this.createPrismaClient(config);
    }

    if (config.driver === 'drizzle') {
      return this.createDrizzleClient(config);
    }

    throw new Error(`Unsupported driver: ${config.driver}`);
  }

  /**
   * Create Prisma client
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createPrismaClient(config: ConnectionConfig): any {
    try {
      return getPrismaClient();
    } catch (error) {
      throw new Error(`Failed to create Prisma client: ${error}`);
    }
  }

  /**
   * Create Drizzle client
   */
  private createDrizzleClient(config: ConnectionConfig): any {
    try {
      const connectionString = config.url;
      if (!connectionString) {
        throw new Error('Drizzle connection URL is required in config');
      }
      return getDrizzleClient(connectionString);
    } catch (error) {
      throw new Error(`Failed to create Drizzle client: ${error}`);
    }
  }
}
