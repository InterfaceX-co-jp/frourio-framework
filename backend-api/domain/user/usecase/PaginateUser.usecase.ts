import type { IUserRepository } from '../repository/User.repository.interface';

export class PaginateUserUsecase {
  private readonly _userRepository: IUserRepository;

  constructor(args: { userRepository: IUserRepository }) {
    this._userRepository = args.userRepository;
  }

  async execute(args: { page: number; perPage: number; search?: string }) {
    const { data: users, meta } = await this._userRepository.paginate({
      page: args.page,
      perPage: args.perPage,
      search: args.search,
    });

    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
      })),
      meta,
    };
  }
}
