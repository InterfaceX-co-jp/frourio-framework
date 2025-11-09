import type { DefineMethods } from 'aspida';
import type { ApiResponse } from 'commonTypesWithClient';

export type Methods = DefineMethods<{
  get: {
    resBody: {
      message: string;
    };
  };
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
  put: {
    reqBody: {
      name?: string;
      token?: string;
    };
    resBody: ApiResponse<{
      message: string;
    }>;
  };
  delete: {
    resBody: ApiResponse<never>; // Never returns success, only errors
  };
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
}>;
