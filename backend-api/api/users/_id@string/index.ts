import type { DefineMethods } from 'aspida';
import type { ProblemDetails } from '@fullstack/shared-types';

/**
 * Success response type for getting a user
 */
type UserGetSuccess = {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Success response type for updating a user
 */
type UserUpdateSuccess = {
  id: number;
  name: string;
  email: string;
  age: number;
  updatedAt: string;
};

/**
 * Success response type for deleting a user
 */
type UserDeleteSuccess = { success: true };

export type Methods = DefineMethods<{
  /**
   * Get user by ID
   * @summary Retrieve a single user
   * @description Fetches detailed information about a specific user by their unique identifier
   * @tag Users
   */
  get: {
    resBody: UserGetSuccess | ProblemDetails;
  };

  /**
   * Update user
   * @summary Update user information
   * @description Updates one or more fields of an existing user. All fields are optional.
   * @tag Users
   */
  patch: {
    reqBody: {
      /** Updated user name */
      name?: string;
      /** Updated email address (must be unique) */
      email?: string;
      /** Updated age (must be 18 or older) */
      age?: number;
    };
    resBody: UserUpdateSuccess | ProblemDetails;
  };

  /**
   * Delete user
   * @summary Delete a user account
   * @description Permanently deletes a user account. This action cannot be undone.
   * @tag Users
   * @deprecated Use POST /users/{id}/deactivate instead
   */
  delete: {
    resBody: UserDeleteSuccess | ProblemDetails;
  };
}>;