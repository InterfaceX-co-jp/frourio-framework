import type { IUserRepository } from '../User.repository.interface';
import { DB } from '$/@frouvel/kaname/database';
import { users } from '$/database/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Drizzle User Repository
 * 
 * Uses DB facade for database access (same pattern as Prisma repository).
 * Demonstrates ORM-agnostic repository interface.
 */
export class UserRepositoryDrizzle implements IUserRepository {
  private db = DB.drizzle();

  async findById(args: { id: number }) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, args.id))
      .limit(1);

    return user || null;
  }

  async create(data: { name: string; email: string; age: number }) {
    const [user] = await this.db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        age: data.age,
      })
      .returning();

    return user;
  }

  async update(args: {
    id: number;
    data: {
      name?: string;
      email?: string;
      age?: number;
    };
  }) {
    const [user] = await this.db
      .update(users)
      .set({
        ...args.data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, args.id))
      .returning();

    return user;
  }

  async deleteById(args: { id: number }) {
    await this.db.delete(users).where(eq(users.id, args.id));
  }
}