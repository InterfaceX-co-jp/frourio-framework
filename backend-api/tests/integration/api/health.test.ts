import { expect } from 'vitest';
import { TestApiClient } from '$/@frouvel/kaname/testing';
import { TestCaseIntegration } from '$/@frouvel/kaname/testing';

class HealthApiTest extends TestCaseIntegration {
  run() {
    this.suite('Health API (TestApiClient)', () => {
      this.test('GET /api/health returns OK', async () => {
        const client = new TestApiClient(this.server);
        const response = await client.get<string>('/api/health');

        client.assertOk(response);
        expect(response.body).toBe('OK');
      });
    });
  }
}

new HealthApiTest().run();
