/**
 * Application Service Provider
 *
 * Register application-specific services and commands here.
 * This is where you register your custom console commands.
 */

import type {
  Application,
  ServiceProvider,
} from '$/@frouvel/kaname/foundation';
import type { ConsoleKernel } from '$/@frouvel/kaname/foundation';

// Import your custom commands here
import { ExampleCommand } from '$/app/console/ExampleCommand';
import { GenerateOpenApiCommand } from '$/app/console/GenerateOpenApiCommand';

// Import repositories
import type { IUserRepository } from '$/domain/user/repository/User.repository.interface';
import { UserRepository } from '$/domain/user/repository/prisma/User.repository';
import { DeleteUserByIdUseCase } from '$/domain/user/usecase/DeleteUserById.usecase';
import { FindUserByIdUseCase } from '$/domain/user/usecase/FindUserById.usecase';

// Import use cases
import { PaginateUserUsecase } from '$/domain/user/usecase/PaginateUser.usecase';
import { UpdateUserUseCase } from '$/domain/user/usecase/UpdateUser.usecase';

export class AppServiceProvider implements ServiceProvider {
  register(app: Application): void {
    // Bind IUserRepository to Prisma implementation
    app.bind<IUserRepository>('IUserRepository', () => new UserRepository());

    // Bind UseCases with dependency injection
    app.bind<PaginateUserUsecase>('PaginateUserUsecase', () => {
      const userRepository = app.make<IUserRepository>('IUserRepository');
      return new PaginateUserUsecase({ userRepository });
    });
    app.bind<FindUserByIdUseCase>('FindUserByIdUseCase', () => {
      const userRepository = app.make<IUserRepository>('IUserRepository');
      return new FindUserByIdUseCase({ userRepository });
    });
    app.bind<UpdateUserUseCase>('UpdateUserUseCase', () => {
      const userRepository = app.make<IUserRepository>('IUserRepository');
      return new UpdateUserUseCase({ userRepository });
    });
    app.bind<DeleteUserByIdUseCase>('DeleteUserByIdUseCase', () => {
      const userRepository = app.make<IUserRepository>('IUserRepository');
      return new DeleteUserByIdUseCase({ userRepository });
    });

    console.log('[AppServiceProvider] Application services registered');
  }

  async boot(app: Application): Promise<void> {
    // Register custom console commands
    const kernel = app.make<ConsoleKernel>('ConsoleKernel');

    // Register your commands here:
    kernel.registerCommands([
      new ExampleCommand(app),
      new GenerateOpenApiCommand(app),
      // Add more commands here as needed
    ]);

    console.log('[AppServiceProvider] Application services booted');
  }
}
