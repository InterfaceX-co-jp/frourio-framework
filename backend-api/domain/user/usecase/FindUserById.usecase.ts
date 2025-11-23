import { NotFoundError } from '$/@frouvel/kaname/error/CommonErrors';
import type { IUserRepository } from '../repository/User.repository.interface';

export class FindUserByIdUseCase {
  private readonly _userRepository: IUserRepository;

  constructor(args: { userRepository: IUserRepository }) {
    this._userRepository = args.userRepository;
  }

  async execute(args: { id: number }) {
    const user = await this._userRepository.findById({ id: args.id });

    if (!user) {
      throw NotFoundError.create('User not found', { userId: args.id });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
