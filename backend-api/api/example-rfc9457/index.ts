import type { DefineMethods } from 'aspida';
import type { ApiResponse } from '$/commonTypesWithClient';

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
}>;