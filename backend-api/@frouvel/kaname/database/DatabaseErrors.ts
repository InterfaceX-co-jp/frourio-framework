import { AbstractFrourioFrameworkError } from '$/@frouvel/kaname/error/FrourioFrameworkError';

const DATABASE_ERROR_TYPE_BASE = 'https://example.com/errors/database';

export class DatabaseNotInitializedError extends AbstractFrourioFrameworkError {
  constructor() {
    super({
      message:
        'Database manager not initialized. Call DB.init(config) first or use the DatabaseServiceProvider.',
      code: 'DATABASE_NOT_INITIALIZED',
      typeUri: `${DATABASE_ERROR_TYPE_BASE}/not-initialized`,
    });
  }
}

export class DatabaseConnectionNotConfiguredError extends AbstractFrourioFrameworkError {
  constructor(connection: string) {
    super({
      message: `Connection '${connection}' is not configured`,
      code: 'DATABASE_CONNECTION_NOT_CONFIGURED',
      details: { connection },
      typeUri: `${DATABASE_ERROR_TYPE_BASE}/connection-not-configured`,
    });
  }
}

export class UnsupportedDatabaseDriverError extends AbstractFrourioFrameworkError {
  constructor(driver: string) {
    super({
      message: `Unsupported database driver: '${driver}'`,
      code: 'DATABASE_UNSUPPORTED_DRIVER',
      details: { driver },
      typeUri: `${DATABASE_ERROR_TYPE_BASE}/unsupported-driver`,
    });
  }
}

export class DatabaseClientUnavailableError extends AbstractFrourioFrameworkError {
  constructor(connection: string, driver: string) {
    super({
      message: `Database client not available for connection '${connection}' using driver '${driver}'`,
      code: 'DATABASE_CLIENT_UNAVAILABLE',
      details: { connection, driver },
      typeUri: `${DATABASE_ERROR_TYPE_BASE}/client-unavailable`,
    });
  }
}

export class DatabaseClientCreationError extends AbstractFrourioFrameworkError {
  constructor(driver: string, cause?: unknown) {
    super({
      message: `Failed to create database client for driver '${driver}'`,
      code: 'DATABASE_CLIENT_CREATION_FAILED',
      details: { driver, cause },
      typeUri: `${DATABASE_ERROR_TYPE_BASE}/client-creation-failed`,
    });
  }
}
