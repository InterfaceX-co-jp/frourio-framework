import type { DefineMethods } from 'aspida';
import type { ApiResponse } from 'commonTypesWithClient';

export type Methods = DefineMethods<{
  /**
   * Test RFC9457 error response - GET
   * @summary Example endpoint demonstrating RFC9457 error responses
   * @description Returns a simple success message. Useful for testing error handling patterns.
   * @tag Example
   */
  get: {
    resBody: {
      message: string;
    };
  };
  /**
   * Test RFC9457 error response - POST
   * @summary Simulate various error scenarios
   * @description Allows testing different RFC9457 error responses based on request body flags
   * @tag Example
   */
  post: {
    reqBody: {
      simulateNotFound?: boolean;
      simulateValidation?: boolean;
      simulateUnauthorized?: boolean;
      resourceId?: string;
    };
    resBody: ApiResponse<{
      message: string;
    }>;
  };
  /**
   * Test RFC9457 error response - PUT
   * @summary Test PUT method error handling
   * @description Demonstrates error responses for PUT operations
   * @tag Example
   */
  put: {
    reqBody: {
      name?: string;
      token?: string;
    };
    resBody: ApiResponse<{
      message: string;
    }>;
  };
  /**
   * Test RFC9457 error response - DELETE
   * @summary Test DELETE method error handling
   * @description Always returns an error to demonstrate error response format
   * @tag Example
   */
  delete: {
    resBody: ApiResponse<never>; // Never returns success, only errors
  };
  /**
   * Test RFC9457 validation errors - PATCH
   * @summary Test validation error responses
   * @description Demonstrates detailed validation error responses using RFC9457 format
   * @tag Example
   */
  patch: {
    reqBody: {
      name: string;
      description?: string;
      email: string;
      age: number;
      siteAreaSquareMeter?: number | null;
      minCapacity: number;
    };
    resBody: ApiResponse<{
      message: string;
      data: {
        name: string;
        description?: string;
        email: string;
        age: number;
        siteAreaSquareMeter?: number | null;
        minCapacity: number;
      };
    }>;
  };
  options: {
    reqBody: {
      name: string;
      description?: string;
      email: string;
      age: number;
      siteAreaSquareMeter?: number | null;
      minCapacity: number;
    };
    resBody: ApiResponse<{
      message: string;
      data: {
        name: string;
        description?: string;
        email: string;
        age: number;
        siteAreaSquareMeter?: number | null;
        minCapacity: number;
      };
    }>;
  };
}>;
