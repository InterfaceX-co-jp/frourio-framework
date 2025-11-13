import type { DefineMethods } from 'aspida';

export type Methods = DefineMethods<{
  /**
   * Health check
   * @summary Check API health status
   * @description Returns a simple health check response to verify the API is running
   * @tag Health
   */
  get: {
    resBody: string;
  };
}>;
