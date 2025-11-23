import type { IUserRepository } from '../repository/User.repository.interface';

export class UpdateUserUseCase {
  private readonly _userRepository: IUserRepository;

  constructor(args: { userRepository: IUserRepository }) {
    this._userRepository = args.userRepository;
  }

  async execute(args: {
    id: number;
    data: {
      name?: string;
      email?: string;
      age?: number;
    };
  }) {
    const user = await this._userRepository.update({
      id: args.id,
      data: args.data,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
