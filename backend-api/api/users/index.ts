import type { DefineMethods } from 'aspida';
import type { ProblemDetails } from 'commonTypesWithClient';

/**
 * User Management API
 *
 * Provides endpoints for managing user accounts in the system.
 * All endpoints require authentication except where noted.
 */
export type Methods = DefineMethods<{
  /**
   * List all users
   * @summary Get paginated list of users
   * @description Returns a paginated list of all users in the system with optional search filtering
   * @tag Users
   */
  get: {
    query: {
      /** Page number (starts from 1) */
      page: number;
      /** Number of items per page */
      limit: number;
      /** Optional search query to filter users by name or email */
      search?: string;
    };
    resBody:
      | {
          data: Array<{
            id: number;
            name: string;
            email: string;
            createdAt: string;
          }>;
          meta: {
            currentPage: number;
            lastPage: number;
            total: number;
            perPage: number;
          };
        }
      | ProblemDetails;
  };

  /**
   * Create a new user
   * @summary Create new user account
   * @description Creates a new user account with the provided information. Email must be unique.
   * @tag Users
   */
  post: {
    reqBody: {
      /** User's full name */
      name: string;
      /** Valid email address (must be unique) */
      email: string;
      /** User's age (must be 18 or older) */
      age: number;
    };
    resBody:
      | {
          id: number;
          name: string;
          email: string;
          age: number;
          createdAt: string;
        }
      | ProblemDetails;
  };
}>;
