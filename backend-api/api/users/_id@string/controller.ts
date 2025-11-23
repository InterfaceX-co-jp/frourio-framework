/**
 * User Detail Controller
 *
 * Demonstrates single resource operations using UseCases
 */

import { defineController } from './$relay';
import { ApiResponse } from '$/@frouvel/kaname/http/ApiResponse';
import { getApp } from '$/@frouvel/kaname/foundation';
import type { FindUserByIdUseCase } from '$/domain/user/usecase/FindUserById.usecase';
import type { UpdateUserUseCase } from '$/domain/user/usecase/UpdateUser.usecase';
import type { DeleteUserByIdUseCase } from '$/domain/user/usecase/DeleteUserById.usecase';

export default defineController((fastify) => ({
  /**
   * GET /users/:id
   * Uses FindUserByIdUseCase for fetching user details
   */
  get: ({ params }) => {
    const app = getApp(fastify);
    const userId = parseInt(params.id, 10);

    return app
      .make<FindUserByIdUseCase>('FindUserByIdUseCase')
      .execute({ id: userId })
      .then(ApiResponse.success)
      .catch(ApiResponse.method.get.error);
  },

  /**
   * PATCH /users/:id
   * Uses UpdateUserUseCase for updating user information
   */
  patch: ({ params, body }) => {
    const app = getApp(fastify);
    const userId = parseInt(params.id, 10);

    return app
      .make<UpdateUserUseCase>('UpdateUserUseCase')
      .execute({ id: userId, data: body })
      .then(ApiResponse.success)
      .catch(ApiResponse.method.patch.error);
  },

  /**
   * DELETE /users/:id
   * Uses DeleteUserByIdUseCase for deleting users
   */
  delete: ({ params }) => {
    const app = getApp(fastify);
    const userId = parseInt(params.id, 10);

    return app
      .make<DeleteUserByIdUseCase>('DeleteUserByIdUseCase')
      .execute({ id: userId })
      .then(ApiResponse.success)
      .catch(ApiResponse.method.delete.error);
  },
}));
