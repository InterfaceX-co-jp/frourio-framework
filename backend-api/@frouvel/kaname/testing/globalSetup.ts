import net from 'node:net';

/**
 * Vitest global setup to ensure the database needed for integration tests
 * is reachable. If not, we mark DB-dependent tests to be skipped so that
 * `npm run test` can still succeed without a running PostgreSQL instance.
 */
export default async function globalSetup() {
  const databaseUrl =
    process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? '';

  const canReachDatabase = await checkDatabaseAvailability(databaseUrl);

  if (!canReachDatabase) {
    process.env.SKIP_DB_TESTS = '1';
    console.warn(
      '[TestSetup] Database is not reachable. Skipping database-dependent tests. ' +
        'Set TEST_DATABASE_URL or start the PostgreSQL container to run them.',
    );
  }
}

async function checkDatabaseAvailability(url: string): Promise<boolean> {
  if (!url) return false;

  let host: string;
  let port: number;

  try {
    const parsed = new URL(url);
    host = parsed.hostname || 'localhost';
    port = parsed.port ? Number(parsed.port) : 5432;
  } catch {
    return false;
  }

  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    const cleanup = () => {
      socket.removeAllListeners();
      socket.end();
      socket.destroy();
    };

    socket.setTimeout(1500);

    socket.on('connect', () => {
      cleanup();
      resolve(true);
    });

    socket.on('timeout', () => {
      cleanup();
      resolve(false);
    });

    socket.on('error', () => {
      cleanup();
      resolve(false);
    });
  });
}
