# @frouvel/kaname

- かつてfrourioで受託開発をしていた際のチーム名がkaname-devでした.
- 由来は「すずめの戸締まり」の要石で, 炎上したプロジェクトでも１人で鎮火するという意味が込められています.
- 転じて, 炎上とは無縁のモジュール群を提供したいという思いで作られています.
- Laravelで例えると, Illuminate相当のnamespaceです.

## Available Modules

### HTTP Response Module (`@frouvel/kaname/http`)

RFC9457-compliant error responses and response building utilities.

- **ApiResponse**: Unified API for creating HTTP responses
- **ResponseBuilder**: Fluent API for validation and response creation

### Hash Module (`@frouvel/kaname/hash`)

Password hashing operations inspired by Laravel's Hash facade.

```ts
import { Hash } from '$/@frouvel/kaname/hash/Hash';

// Hash a password
const hashed = await Hash.make('secret123');

// Verify a password
const isValid = await Hash.check('secret123', hashed);

// Custom bcrypt rounds
const strongHash = await Hash.make('secret123', { rounds: 12 });

// Alternative syntax
const isValid2 = await Hash.verify('secret123', hashed);
```

### Error Module (`@frouvel/kaname/error`)

Structured error classes that automatically convert to RFC9457 Problem Details.

### Validation Module (`@frouvel/kaname/validation`)

Zod-based validation utilities.

### Paginator Module (`@frouvel/kaname/paginator`)

Pagination utilities for creating consistent pagination responses.
