# Backend API

A modern TypeScript backend API built with Fastify, Frourio, and Prisma.

## 🚀 Tech Stack

- **[Fastify](https://fastify.dev/)** - Fast and low overhead web framework for Node.js
- **[Frourio](https://frourio.com/docs)** - Type-safe API framework with automatic type generation
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for database management and migrations
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[npm-run-all](https://www.npmjs.com/package/npm-run-all)** - Managing multiple npm scripts

## 📋 Prerequisites

- **Node.js** >= 20.0.0
- **PostgreSQL** database
- **npm** or **yarn**

## 🛠️ Setup

1. **Clone and navigate to the project:**

   ```bash
   cd backend-api
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment configuration:**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   TZ=Asia/Tokyo
   API_SERVER_PORT=31577
   API_BASE_PATH=/api
   API_JWT_SECRET=your-secret-key
   API_ORIGIN=http://localhost:31577
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   TEST_DATABASE_URL=postgresql://username:password@localhost:5432/test_database_name
   WEB_FRONTEND_URL=http://localhost:3000
   ```

4. **Database setup:**

   ```bash
   # Run migrations and seed data
   npm run migrate:dev
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## 📝 Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Generate types (Aspida, Frourio, Prisma)
npm run generate

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

### Database Management

```bash
# Run development migrations with seeding
npm run migrate:dev

# Create migration only (without applying)
npm run migrate:dev:createonly

# Deploy migrations to production
npm run migrate:deploy

# Reset database (⚠️ destructive)
npm run migrate:reset

# Run development seeder
npm run seed:dev

# Run production seeder
npm run seed:production
```

### Testing

```bash
# Run tests
npm run test
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### CLI Commands

```bash
# Run custom CLI commands
npm run cli
```

## 🏗️ Project Structure

```
backend-api/
├── api/                    # API route definitions (Frourio)
│   ├── health/            # Health check endpoint
│   └── index.ts           # Root API endpoint
├── app/                   # Application utilities
│   ├── hash/              # Password hashing utilities
│   ├── http/              # HTTP response utilities
│   └── paginator/         # Pagination utilities
├── commonConstantsWithClient/  # Shared constants
├── commonTypesWithClient/      # Shared TypeScript types
├── config/                # Configuration files
├── consoleCommands/       # CLI commands
├── entrypoints/           # Application entry points
├── middleware/            # Fastify middleware
├── prisma/                # Database schema and migrations
│   ├── migrations/        # Database migrations
│   ├── seeders/          # Database seeders
│   └── schema.prisma     # Prisma schema
├── scripts/               # Build scripts
├── service/               # Core services
└── tests/                 # Test files
```

## 🔌 API Endpoints

- **GET** `/` - Root endpoint
- **GET** `/health` - Health check endpoint

## 🗄️ Database

The project uses PostgreSQL with Prisma ORM. The database schema is defined in [`prisma/schema.prisma`](prisma/schema.prisma).

### Models

- **User** - Basic user model with timestamps

## 🧪 Testing

Tests are written using Vitest and can be found in the [`tests/`](tests/) directory.

```bash
npm run test
```

## 🔧 Configuration

### Environment Variables

| Variable            | Description                     | Default                  |
| ------------------- | ------------------------------- | ------------------------ |
| `TZ`                | Timezone                        | `Asia/Tokyo`             |
| `API_SERVER_PORT`   | Server port                     | `31577`                  |
| `API_BASE_PATH`     | API base path                   | `/api`                   |
| `API_JWT_SECRET`    | JWT secret key                  | -                        |
| `API_ORIGIN`        | API origin URL                  | `http://localhost:31577` |
| `DATABASE_URL`      | PostgreSQL connection string    | -                        |
| `TEST_DATABASE_URL` | Test database connection string | -                        |
| `WEB_FRONTEND_URL`  | Frontend URL for CORS           | `http://localhost:3000`  |

### JWT Authentication

The API supports JWT-based authentication with middleware for both user and admin authentication:

- [`authUserMiddleware.ts`](middleware/authUserMiddleware.ts)
- [`authAdminMiddleware.ts`](middleware/authAdminMiddleware.ts)

## 🚀 Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Run database migrations:**

   ```bash
   npm run migrate:deploy
   ```

4. **Start the production server:**
   ```bash
   npm run start
   ```

## 📚 Development Notes

- The project uses ES modules (`"type": "module"`)
- TypeScript configuration is in [`tsconfig.json`](tsconfig.json)
- ESLint configuration is in [`eslint.config.js`](eslint.config.js)
- Prettier configuration is in [`.prettierrc`](.prettierrc)
- The API automatically generates types using Frourio and Aspida
- Database models are auto-generated using Prisma

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Run tests before submitting changes: `npm run test`
3. Ensure type checking passes: `npm run typecheck`
4. Fix any linting issues: `npm run lint:fix`
