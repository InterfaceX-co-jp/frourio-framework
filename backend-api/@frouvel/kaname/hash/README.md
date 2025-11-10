# Hash Module

Password hashing module inspired by Laravel's Hash facade.

## Features

- 🔒 Secure bcrypt-based password hashing
- 🎯 Clean, intuitive API
- ⚙️ Configurable bcrypt rounds
- 🔄 Backward compatible with legacy functions
- ✅ Fully tested

## Installation

The Hash module is part of `@frouvel/kaname` and uses `bcryptjs` internally.

## Usage

### Basic Usage

```ts
import { Hash } from '$/@frouvel/kaname/hash';

// Hash a password
const hashed = await Hash.make('myPassword123');

// Verify a password
const isValid = await Hash.check('myPassword123', hashed);
if (isValid) {
  // Password is correct
}
```

### Custom Bcrypt Rounds

```ts
import { Hash } from '$/@frouvel/kaname/hash';

// Use more rounds for higher security (slower but more secure)
const strongHash = await Hash.make('myPassword123', { rounds: 12 });

// Default is 10 rounds
const normalHash = await Hash.make('myPassword123'); // rounds: 10
```

### Using verify() Alias

```ts
import { Hash } from '$/@frouvel/kaname/hash';

const hashed = await Hash.make('myPassword123');

// check() and verify() are identical
const isValid1 = await Hash.check('myPassword123', hashed);
const isValid2 = await Hash.verify('myPassword123', hashed);
```

## Real-World Examples

### User Registration

```ts
import { Hash } from '$/@frouvel/kaname/hash';
import { UserRepository } from '$/domain/user/repository/User.repository';

export class RegisterUserUseCase {
  async handle(args: { email: string; password: string }) {
    // Hash the password before storing
    const hashedPassword = await Hash.make(args.password);

    const user = await this._userRepository.create({
      email: args.email,
      password: hashedPassword,
    });

    return user.toDto();
  }
}
```

### User Login

```ts
import { Hash } from '$/@frouvel/kaname/hash';
import { UnauthorizedError } from '$/@frouvel/kaname/error/CommonErrors';

export class LoginUserUseCase {
  async handle(args: { email: string; password: string }) {
    const user = await this._userRepository.findByEmail({
      email: args.email,
    });

    if (!user) {
      throw UnauthorizedError.create('Invalid credentials');
    }

    // Verify the password
    const isValid = await Hash.check(args.password, user.password);

    if (!isValid) {
      throw UnauthorizedError.create('Invalid credentials');
    }

    // Generate JWT or session token
    const token = await this._generateToken(user);

    return { token, user: user.toDto() };
  }
}
```

### Password Change

```ts
import { Hash } from '$/@frouvel/kaname/hash';
import { ValidationError } from '$/@frouvel/kaname/error/CommonErrors';

export class ChangePasswordUseCase {
  async handleById(args: {
    userId: number;
    currentPassword: string;
    newPassword: string;
  }) {
    const user = await this._userRepository.findById({ id: args.userId });

    // Verify current password
    const isCurrentValid = await Hash.check(
      args.currentPassword,
      user.password,
    );

    if (!isCurrentValid) {
      throw ValidationError.create('Current password is incorrect');
    }

    // Hash new password
    const newHashedPassword = await Hash.make(args.newPassword);

    // Update user
    const updated = await this._userRepository.updateById({
      id: args.userId,
      payload: { password: newHashedPassword },
    });

    return updated.toDto();
  }
}
```

## API Reference

### `Hash.make(password, options?)`

Hash a password using bcrypt.

**Parameters:**
- `password` (string): The password to hash
- `options` (object, optional):
  - `rounds` (number): Number of bcrypt rounds (default: 10)

**Returns:** `Promise<string>` - The hashed password

### `Hash.check(password, hash)`

Verify a password against its hash.

**Parameters:**
- `password` (string): The plain text password
- `hash` (string): The hashed password to compare against

**Returns:** `Promise<boolean>` - `true` if password matches, `false` otherwise

### `Hash.verify(password, hash)`

Alias for `check()`. Verify a password against its hash.

**Parameters:**
- `password` (string): The plain text password
- `hash` (string): The hashed password to compare against

**Returns:** `Promise<boolean>` - `true` if password matches, `false` otherwise

## Migration from Legacy Functions

### Before (Deprecated)

```ts
import { hashPassword, verifyPassword } from '$/@frouvel/kaname/hash';

// Hash
const hashed = await hashPassword({ password: 'secret' });

// Verify
const isValid = await verifyPassword({
  password: 'secret',
  passwordHash: hashed,
});
```

### After (Recommended)

```ts
import { Hash } from '$/@frouvel/kaname/hash';

// Hash
const hashed = await Hash.make('secret');

// Verify
const isValid = await Hash.check('secret', hashed);
```

The legacy functions are still available for backward compatibility but are deprecated and will be removed in a future version.

## Security Considerations

- ✅ Uses bcrypt algorithm (industry standard)
- ✅ Automatic salting (unique salt per hash)
- ✅ Configurable work factor (rounds)
- ✅ Resistant to rainbow table attacks
- ⚠️ Minimum 10 rounds recommended (default)
- ⚠️ Consider 12+ rounds for high-security applications
- ⚠️ Higher rounds = slower but more secure

## Performance

Bcrypt is intentionally slow to prevent brute-force attacks:

| Rounds | Time (approx) |
|--------|---------------|
| 10     | ~100ms        |
| 12     | ~400ms        |
| 14     | ~1.6s         |

Choose rounds based on your security requirements and acceptable latency.

## Testing

The Hash module includes comprehensive tests. Run them with:

```bash
npm test -- Hash.test.ts