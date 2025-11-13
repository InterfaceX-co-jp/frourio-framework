import { ApiResponse } from '$/@frouvel/kaname/http/ApiResponse';
import { defineController } from './$relay';

export default defineController(() => ({
  get: ({ params }) =>
    // TODO: Implement FindUserUseCase
    ApiResponse.success({
      id: parseInt(params.id),
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),

  patch: ({ params, body }) =>
    // TODO: Implement UpdateUserUseCase
    ApiResponse.success({
      id: parseInt(params.id),
      name: body.name || 'John Doe',
      email: body.email || 'john@example.com',
      age: body.age || 25,
      updatedAt: new Date().toISOString(),
    }),

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete: ({ params }) =>
    // TODO: Implement DeleteUserUseCase
    ApiResponse.success({ success: true as const }),
}));
