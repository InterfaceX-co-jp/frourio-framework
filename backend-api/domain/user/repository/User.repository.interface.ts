export interface IUserRepository {
  findById(args: { id: number }): Promise<{
    id: number;
    name: string;
    email: string;
    age: number;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  create(data: { name: string; email: string; age: number }): Promise<{
    id: number;
    name: string;
    email: string;
    age: number;
    createdAt: Date;
    updatedAt: Date;
  }>;

  update(args: {
    id: number;
    data: {
      name?: string;
      email?: string;
      age?: number;
    };
  }): Promise<{
    id: number;
    name: string;
    email: string;
    age: number;
    createdAt: Date;
    updatedAt: Date;
  }>;

  deleteById(args: { id: number }): Promise<void>;
}
