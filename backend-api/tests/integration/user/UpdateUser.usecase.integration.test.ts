import { expect } from 'vitest';
import { TestCaseDatabase } from '$/@frouvel/kaname/testing';
import { fake } from '$/@frouvel/kaname/testing';
import { UpdateUserUseCase } from '$/domain/user/usecase/UpdateUser.usecase';
import { UserRepositoryDrizzle } from '$/domain/user/repository/drizzle/User.repository';
import { getDrizzleClient } from '$/@frouvel/kaname/database';
import { DB } from '$/@frouvel/kaname/database';

/**
 * UpdateUser UseCase Integration Test
 *
 * Tests the UpdateUserUseCase with real database operations
 */
class UpdateUserUseCaseIntegrationTest extends TestCaseDatabase {
  protected async setUpBeforeClass(): Promise<void> {
    await super.setUpBeforeClass();
    
    // Initialize Drizzle client and register with DB facade
    const db = getDrizzleClient();
    DB.register('default', db, 'drizzle');
  }

  run() {
    this.suite('UpdateUserUseCase Integration Tests', () => {
      this.test('can update user name', async () => {
        // Arrange: Create a test user
        const user = await this.prisma.user.create({
          data: {
            name: fake.name(),
            email: fake.email(),
            age: fake.number(20, 60),
          },
        });

        const newName = fake.name();

        // Act: Update the user's name
        const result = await new UpdateUserUseCase({
          userRepository: new UserRepositoryDrizzle(),
        }).execute({
          id: user.id,
          data: { name: newName },
        });

        // Assert
        expect(result.id).toBe(user.id);
        expect(result.name).toBe(newName);
        expect(result.email).toBe(user.email);
        expect(result.age).toBe(user.age);

        // Verify database was updated
        const updatedUser = await this.prisma.user.findUnique({
          where: { id: user.id },
        });
        expect(updatedUser?.name).toBe(newName);
      });

      this.test('can update user email', async () => {
        // Arrange
        const user = await this.prisma.user.create({
          data: {
            name: fake.name(),
            email: fake.email(),
            age: fake.number(20, 60),
          },
        });

        const newEmail = fake.email();

        // Act
        const result = await new UpdateUserUseCase({
          userRepository: new UserRepositoryDrizzle(),
        }).execute({
          id: user.id,
          data: { email: newEmail },
        });

        // Assert
        expect(result.id).toBe(user.id);
        expect(result.email).toBe(newEmail);
        expect(result.name).toBe(user.name);

        // Verify database
        const updatedUser = await this.prisma.user.findUnique({
          where: { id: user.id },
        });
        expect(updatedUser?.email).toBe(newEmail);
      });

      this.test('can update user age', async () => {
        // Arrange
        const user = await this.prisma.user.create({
          data: {
            name: fake.name(),
            email: fake.email(),
            age: 25,
          },
        });

        const newAge = 30;

        // Act
        const result = await new UpdateUserUseCase({
          userRepository: new UserRepositoryDrizzle(),
        }).execute({
          id: user.id,
          data: { age: newAge },
        });

        // Assert
        expect(result.age).toBe(newAge);

        // Verify database
        const updatedUser = await this.prisma.user.findUnique({
          where: { id: user.id },
        });
        expect(updatedUser?.age).toBe(newAge);
      });

      this.test('can update multiple fields at once', async () => {
        // Arrange
        const user = await this.prisma.user.create({
          data: {
            name: fake.name(),
            email: fake.email(),
            age: 25,
          },
        });

        const updates = {
          name: fake.name(),
          email: fake.email(),
          age: 35,
        };

        // Act
        const result = await new UpdateUserUseCase({
          userRepository: new UserRepositoryDrizzle(),
        }).execute({
          id: user.id,
          data: updates,
        });

        // Assert
        expect(result.id).toBe(user.id);
        expect(result.name).toBe(updates.name);
        expect(result.email).toBe(updates.email);
        expect(result.age).toBe(updates.age);

        // Verify database
        const updatedUser = await this.prisma.user.findUnique({
          where: { id: user.id },
        });
        expect(updatedUser?.name).toBe(updates.name);
        expect(updatedUser?.email).toBe(updates.email);
        expect(updatedUser?.age).toBe(updates.age);
      });

      this.test('returns updated timestamp', async () => {
        // Arrange
        const user = await this.prisma.user.create({
          data: {
            name: fake.name(),
            email: fake.email(),
            age: 25,
          },
        });

        const originalUpdatedAt = user.updatedAt;

        // Wait a bit to ensure timestamp difference
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Act
        const result = await new UpdateUserUseCase({
          userRepository: new UserRepositoryDrizzle(),
        }).execute({
          id: user.id,
          data: { name: fake.name() },
        });

        // Assert
        expect(result.updatedAt).toBeDefined();
        expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      });

      this.test('throws NotFoundError when user does not exist', async () => {
        // Arrange
        const nonExistentId = 999999;

        // Act & Assert
        await expect(
          new UpdateUserUseCase({
            userRepository: new UserRepositoryDrizzle(),
          }).execute({
            id: nonExistentId,
            data: { name: fake.name() },
          }),
        ).rejects.toThrow();
      });

      this.test('can update with empty data object (no changes)', async () => {
        // Arrange
        const user = await this.prisma.user.create({
          data: {
            name: fake.name(),
            email: fake.email(),
            age: 25,
          },
        });

        const originalName = user.name;
        const originalEmail = user.email;
        const originalAge = user.age;

        // Act
        const result = await new UpdateUserUseCase({
          userRepository: new UserRepositoryDrizzle(),
        }).execute({
          id: user.id,
          data: {},
        });

        // Assert: Values should remain unchanged
        expect(result.id).toBe(user.id);
        expect(result.name).toBe(originalName);
        expect(result.email).toBe(originalEmail);
        expect(result.age).toBe(originalAge);
      });
    });
  }
}

// Run the test suite
new UpdateUserUseCaseIntegrationTest().run();
