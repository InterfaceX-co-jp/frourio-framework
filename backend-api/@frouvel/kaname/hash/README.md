# Hash Module

Password hashing module inspired by Laravel's Hash facade with Strategy Pattern support.

## Features

- 🔒 Secure bcrypt-based password hashing (default)
- 🎯 Clean, intuitive API
- 🔌 Strategy Pattern for multiple hashing algorithms
- ⚙️ Configurable hashing options per strategy
- 🔄 Backward compatible with legacy functions
- ✅ Fully tested (20 tests)

## Installation

The Hash module is part of `@frouvel/kaname` and uses `bcryptjs` by default.

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

### Strategy Pattern

The Hash module supports multiple hashing strategies via the Strategy Pattern.

```ts
import { Hash } from '$/@frouvel/kaname/hash';
import { BcryptHashStrategy } from '$/@frouvel/kaname/hash/strategies';

// Get current strategy name
console.log(Hash.getStrategyName()); // 'bcrypt'

// Set custom bcrypt rounds via constructor
Hash.setStrategy(new BcryptHashStrategy({ rounds: 12 }));

// Or use a different strategy (when available)
// import { Argon2HashStrategy } from '$/@frouvel/kaname/hash/strategies/Argon2HashStrategy';
// Hash.setStrategy(new Argon2HashStrategy());
```

### Creating Custom Strategies

You can create your own hashing strategy by implementing the `IHashStrategy` interface:

```ts
import type { IHashStrategy, HashStrategyOptions } from '$/@frouvel/kaname/hash/strategies';
import argon2 from 'argon2';

export class Argon2HashStrategy implements IHashStrategy {
  async make(password: string, options?: HashStrategyOptions): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      ...options,
    });
  }

  async check(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }

  getName(): string {
    return 'argon2';
  }
}

// Use it
import { Hash } from '$/@frouvel/kaname/hash';
Hash.setStrategy(new Argon2HashStrategy());
const hashed = await Hash.make('mypassword');
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

### Core Methods

#### `Hash.make(password, options?)`

Hash a password using the current strategy.

**Parameters:**
- `password` (string): The password to hash
- `options` (HashStrategyOptions, optional): Strategy-specific options
  - For BcryptHashStrategy: `{ rounds?: number }` (default: 10)

**Returns:** `Promise<string>` - The hashed password

#### `Hash.check(password, hash)`

Verify a password against its hash using the current strategy.

**Parameters:**
- `password` (string): The plain text password
- `hash` (string): The hashed password to compare against

**Returns:** `Promise<boolean>` - `true` if password matches, `false` otherwise

#### `Hash.verify(password, hash)`

Alias for `check()`. Verify a password against its hash.

**Parameters:**
- `password` (string): The plain text password
- `hash` (string): The hashed password to compare against

**Returns:** `Promise<boolean>` - `true` if password matches, `false` otherwise

### Strategy Management Methods

#### `Hash.setStrategy(strategy)`

Set the hashing strategy to use.

**Parameters:**
- `strategy` (IHashStrategy): The hash strategy instance

**Example:**
```ts
import { BcryptHashStrategy } from '$/@frouvel/kaname/hash/strategies';
Hash.setStrategy(new BcryptHashStrategy({ rounds: 12 }));
```

#### `Hash.getStrategy()`

Get the current hashing strategy instance.

**Returns:** `IHashStrategy` - The current strategy instance

#### `Hash.getStrategyName()`

Get the name of the current hashing strategy.

**Returns:** `string` - The strategy name (e.g., 'bcrypt', 'argon2')

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

## Available Strategies

### BcryptHashStrategy (Default)

Uses the bcrypt algorithm with configurable rounds.

**Options:**
- `rounds` (number): Number of bcrypt rounds (default: 10)

**Security:**
- ✅ Industry standard algorithm
- ✅ Automatic salting (unique salt per hash)
- ✅ Configurable work factor
- ✅ Resistant to rainbow table attacks
- ⚠️ Minimum 10 rounds recommended
- ⚠️ Consider 12+ rounds for high-security applications

### Creating Additional Strategies

To add support for other algorithms (Argon2, scrypt, PBKDF2, etc.):

1. Implement the `IHashStrategy` interface
2. Install the required npm package
3. Create the strategy class
4. Export from `strategies/index.ts`

Example strategies you could implement:
- **Argon2HashStrategy** - Winner of Password Hashing Competition
- **ScryptHashStrategy** - Memory-hard KDF
- **PBKDF2HashStrategy** - NIST recommended

## Performance Considerations

### Bcrypt Performance

Bcrypt is intentionally slow to prevent brute-force attacks:

| Rounds | Time (approx) |
|--------|---------------|
| 10     | ~100ms        |
| 12     | ~400ms        |
| 14     | ~1.6s         |

Choose rounds based on your security requirements and acceptable latency.

### Strategy Selection Guidelines

- **Bcrypt**: Best for general use, proven track record
- **Argon2**: Most secure, memory-hard, newer standard
- **Scrypt**: Memory-hard, good for cryptocurrency
- **PBKDF2**: NIST recommended, widely supported

## Testing

The Hash module includes comprehensive tests (20 tests) covering:
- Basic hashing and verification
- Custom rounds
- Legacy function compatibility
- Strategy pattern functionality
- Strategy switching
- End-to-end workflows

Run tests with:

```bash
npm test -- Hash.test.ts
```

## Architecture

```
hash/
├── Hash.ts                          # Main facade
├── Hash.test.ts                     # Comprehensive tests
├── index.ts                         # Module exports
├── README.md                        # This file
└── strategies/
    ├── HashStrategy.interface.ts    # Strategy interface
    ├── BcryptHashStrategy.ts        # Bcrypt implementation
    └── index.ts                     # Strategy exports
```

## Future Enhancements

Potential additions to the Hash module:

- [ ] Argon2HashStrategy implementation
- [ ] ScryptHashStrategy implementation
- [ ] PBKDF2HashStrategy implementation
- [ ] Strategy auto-detection from hash format
- [ ] Hash strength validation
- [ ] Benchmarking utilities