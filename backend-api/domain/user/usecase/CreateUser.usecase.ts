import type { IUserRepository } from '../repository/User.repository.interface';

export class CreateUserUseCase {
  private readonly _userRepository: IUserRepository;

  constructor(args: { userRepository: IUserRepository }) {
    this._userRepository = args.userRepository;
  }

  async execute(args: { name: string; email: string; age: number }) {
    const user = await this._userRepository.create({
      name: args.name,
      email: args.email,
      age: args.age,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
