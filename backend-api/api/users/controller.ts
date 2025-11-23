/**
 * Users Controller
 *
 * Demonstrates proper dependency injection with Application container
 */

import { defineController } from './$relay';
import { ApiResponse } from '$/@frouvel/kaname/http/ApiResponse';
import app from '$/bootstrap/app';
import type { CreateUserUseCase } from '$/domain/user/usecase/CreateUser.usecase';
import type { PaginateUserUsecase } from '$/domain/user/usecase/PaginateUser.usecase';

export default defineController(() => ({
  /**
   * GET /users
   * Uses PaginateUserUsecase resolved from the Application container
   */
  get: ({ query }) => {
    const paginateUserUsecase = app.make<PaginateUserUsecase>(
      'PaginateUserUsecase',
    );

    return paginateUserUsecase
      .execute({
        page: query.page,
        perPage: query.limit,
        search: query.search,
      })
      .then((result) => {
        const res = ApiResponse.success({
          data: result.users,
          meta: result.meta.toResponse().meta,
        });

        return res;
      })
      .catch(ApiResponse.method.get.error);
  },

  /**
   * POST /users
   * Example: Direct Prisma usage with validation
   */
  post: ({ body }) => {
    const createUserUseCase = app.make<CreateUserUseCase>('CreateUserUseCase');

    return createUserUseCase
      .execute({
        name: body.name,
        email: body.email,
        age: body.age,
      })
      .then(ApiResponse.success)
      .catch(ApiResponse.method.post.error);
  },
}));
