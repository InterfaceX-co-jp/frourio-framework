import type { IUserRepository } from '../repository/User.repository.interface';

export class DeleteUserByIdUseCase {
  private readonly _userRepository: IUserRepository;

  constructor(args: { userRepository: IUserRepository }) {
    this._userRepository = args.userRepository;
  }

  async execute(args: { id: number }) {
    await this._userRepository.deleteById({ id: args.id });

    return { success: true as const };
  }
}
