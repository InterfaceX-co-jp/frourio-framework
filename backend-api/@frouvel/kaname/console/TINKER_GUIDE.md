# Tinker REPL Guide

The `tinker` command provides an interactive REPL (Read-Eval-Print Loop) for your frourio-framework application, similar to Laravel's tinker.

## Starting Tinker

```bash
npm run artisan tinker
```

## Available Context

The following objects are automatically available in the REPL:

- `app` - Application instance
- `prisma` - Prisma client for database queries
- `console` - Console object for logging

## Important Note

If you encounter errors like "incorrect binary data format" when creating records, this is a Prisma/database configuration issue, not a tinker issue. You may need to:
1. Regenerate Prisma client: `npm run generate:prisma`
2. Check your database connection
3. Verify your Prisma schema matches your database

For now, focus on **querying** existing data, which works perfectly in tinker.

## Examples

### Querying All Users (Main Use Case)

```javascript
// Get all users
await prisma.user.findMany()

// Store result in a variable
const users = await prisma.user.findMany()

// Display users
console.log(users)

// Get count
await prisma.user.count()
```

### Creating a User

**Note:** If you get database errors when creating users, this is a Prisma/DB setup issue. Create users through your API endpoints instead. Tinker is primarily for **querying and inspecting** data.

```javascript
// If your Prisma setup works correctly:
await prisma.user.create({
  data: {
    // Your user fields here (id is auto-generated)
  }
})
```

For now, focus on querying existing users:
```javascript
// List all users
const users = await prisma.user.findMany()

// Find specific user
const user = await prisma.user.findFirst()

// Count users
await prisma.user.count()
```

### Querying with Filters

```javascript
// Find user by ID
await prisma.user.findUnique({
  where: { id: 'some-uuid' }
})

// Find with conditions
await prisma.user.findMany({
  where: {
    createdAt: {
      gte: new Date('2024-01-01')
    }
  }
})

// Find first matching
await prisma.user.findFirst({
  where: {
    // your conditions
  }
})
```

### Updating Users

```javascript
// Update by ID
await prisma.user.update({
  where: { id: 'some-uuid' },
  data: {
    // fields to update
  }
})

// Update many
await prisma.user.updateMany({
  where: {
    // conditions
  },
  data: {
    // fields to update
  }
})
```

### Deleting Users

```javascript
// Delete by ID
await prisma.user.delete({
  where: { id: 'some-uuid' }
})

// Delete many
await prisma.user.deleteMany({
  where: {
    // conditions
  }
})
```

### Using the Application Container

```javascript
// Get services from the container
const kernel = app.make('ConsoleKernel')

// Check if service exists
app.has('someService')

// Get base path
app.basePath()
app.basePath('config')
```

### Working with Async/Await

All Prisma operations return Promises, so you need to use `await`:

```javascript
// ✅ Correct - using await
const users = await prisma.user.findMany()

// ❌ Wrong - without await (returns a Promise)
const users = prisma.user.findMany()

// Using .then() also works
prisma.user.findMany().then(users => console.log(users))
```

### Logging

```javascript
// Use console for output
console.log('Hello from tinker!')

// Log objects
console.log({ users: await prisma.user.findMany() })

// Log with formatting
console.table(await prisma.user.findMany())
```

### Multi-line Input

The REPL supports multi-line input for complex operations:

```javascript
const result = await prisma.user.findMany({
  where: {
    createdAt: {
      gte: new Date('2024-01-01')
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

## REPL Commands

- `.help` - Show available REPL commands
- `.break` - Exit multi-line mode
- `.clear` - Clear context
- `.exit` - Exit tinker (or press Ctrl+C twice)
- `.save <filename>` - Save session to a file
- `.load <filename>` - Load and execute a file

## Tips

1. **Use Variables**: Store query results in variables for reuse
   ```javascript
   const users = await prisma.user.findMany()
   const firstUser = users[0]
   ```

2. **Inspect Results**: Use `console.log()` or just type the variable name
   ```javascript
   users  // Displays the users array
   ```

3. **Error Handling**: Wrap risky operations in try-catch
   ```javascript
   try {
     await prisma.user.create({ data: {} })
   } catch (error) {
     console.error(error.message)
   }
   ```

4. **Quick Tests**: Perfect for testing Prisma queries before adding them to your code
   ```javascript
   // Test a complex query
   const result = await prisma.user.findMany({
     // your complex query here
   })
   ```

## Example Session

```javascript
> // Query all users
> const users = await prisma.user.findMany()
> console.log(`Found ${users.length} users`)
Found 5 users

> // Get first user
> const firstUser = users[0]
> console.log(firstUser.id)
abc-123-def

> // Create a new user (id auto-generated)
> const newUser = await prisma.user.create({ data: {} })
> console.log('Created user with ID:', newUser.id)
Created user with ID: 550e8400-e29b-41d4-a716-446655440000

> // Count users
> await prisma.user.count()
6

> .exit
```

## Common Patterns

### Pagination

```javascript
// Get page 1 (10 items per page)
await prisma.user.findMany({
  take: 10,
  skip: 0,
  orderBy: { createdAt: 'desc' }
})

// Get page 2
await prisma.user.findMany({
  take: 10,
  skip: 10,
  orderBy: { createdAt: 'desc' }
})
```

### Search

```javascript
// Case-insensitive search
await prisma.user.findMany({
  where: {
    email: {
      contains: 'example',
      mode: 'insensitive'
    }
  }
})
```

### Aggregations

```javascript
// Count by groups
await prisma.user.groupBy({
  by: ['createdAt'],
  _count: true
})

// Get min/max/avg
await prisma.user.aggregate({
  _count: true,
  _min: { createdAt: true },
  _max: { createdAt: true }
})
```

## Exit Tinker

- Type `.exit` and press Enter
- Or press `Ctrl+C` twice
- Or press `Ctrl+D`