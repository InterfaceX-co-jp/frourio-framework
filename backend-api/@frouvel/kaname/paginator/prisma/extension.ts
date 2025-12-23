/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Prisma Pagination Extension
 *
 * Extends Prisma Client with pagination methods that integrate with our Paginator facade.
 *
 * @example
 * ```typescript
 * import { PrismaClient } from '@prisma/client';
 * import { pagination } from '$/@frouvel/kaname/paginator/prisma';
 *
 * const prisma = new PrismaClient().$extends(
 *   pagination({
 *     pages: {
 *       limit: 10,
 *       includePageCount: true,
 *     },
 *     cursor: {
 *       limit: 10,
 *     },
 *   })
 * );
 *
 * // Use with any model
 * const result = await prisma.user.withPages({
 *   page: 1,
 *   limit: 20,
 * });
 * ```
 */

import { Prisma } from '@prisma/client';
import { Paginator } from '../Paginator';
import type { PaginationConfig, WithPagesArgs, WithCursorArgs } from './types';

/**
 * Default configuration for pagination
 */
const DEFAULT_CONFIG: Required<PaginationConfig> = {
  pages: {
    limit: 10,
    includePageCount: true,
  },
  cursor: {
    limit: 10,
    getCursor: (record: any) => record.id,
    parseCursor: (cursor: string) => Paginator.decodeCursor(cursor),
  },
};

/**
 * Create a pagination extension with custom configuration
 *
 * @param config - Pagination configuration
 * @returns Prisma Client Extension
 */
export function pagination(config: PaginationConfig = {}) {
  const mergedConfig = {
    pages: { ...DEFAULT_CONFIG.pages, ...config.pages },
    cursor: { ...DEFAULT_CONFIG.cursor, ...config.cursor },
  };

  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: 'frouvel-pagination',
      model: {
        $allModels: {
          /**
           * Paginate using offset-based pagination (LengthAwarePaginator)
           *
           * @example
           * ```typescript
           * const result = await prisma.user.withPages({
           *   page: 1,
           *   limit: 20,
           *   where: { status: 'active' },
           *   orderBy: { createdAt: 'desc' },
           * });
           * ```
           */
          async withPages<T, A>(
            this: T,
            args: Prisma.Exact<
              A,
              Omit<Prisma.Args<T, 'findMany'>, 'cursor' | 'take' | 'skip'> &
                WithPagesArgs
            >,
          ) {
            const context = Prisma.getExtensionContext(this);

            // Type assertion for accessing pagination-specific properties
            const paginationArgs = args as any;
            const page = paginationArgs.page ?? 1;
            const limit = paginationArgs.limit ?? mergedConfig.pages.limit;
            const includePageCount =
              paginationArgs.includePageCount ??
              mergedConfig.pages.includePageCount;

            // Remove pagination-specific args from Prisma query
            const {
              page: _,
              limit: __,
              includePageCount: ___,
              ...prismaArgs
            } = paginationArgs;

            // Calculate skip and take
            const skip = (page - 1) * limit;

            // Execute queries
            const dataPromise = (context as any).findMany({
              ...prismaArgs,
              skip,
              take: limit,
            });

            const totalPromise = includePageCount
              ? (context as any).count({
                  where: prismaArgs.where,
                })
              : Promise.resolve(0);

            const [data, total] = await Promise.all([
              dataPromise,
              totalPromise,
            ]);

            // Return LengthAwarePaginator
            return Paginator.lengthAware({
              data,
              total,
              perPage: limit,
              currentPage: page,
            });
          },

          /**
           * Paginate using cursor-based pagination (CursorPaginator)
           *
           * @example
           * ```typescript
           * const result = await prisma.user.withCursor({
           *   cursor: encodedCursor,
           *   limit: 20,
           *   cursorColumn: 'id',
           *   where: { status: 'active' },
           *   orderBy: { id: 'desc' },
           * });
           * ```
           */
          async withCursor<T, A>(
            this: T,
            args: Prisma.Exact<
              A,
              Omit<Prisma.Args<T, 'findMany'>, 'cursor' | 'take' | 'skip'> &
                WithCursorArgs
            >,
          ) {
            const context = Prisma.getExtensionContext(this);

            // Type assertion for accessing pagination-specific properties
            const paginationArgs = args as any;
            const limit = paginationArgs.limit ?? mergedConfig.cursor.limit;
            const cursorColumn = paginationArgs.cursorColumn ?? 'id';
            const cursorValue = paginationArgs.cursor;
            const path = paginationArgs.path;

            // Remove pagination-specific args from Prisma query
            const {
              cursor: _cursor,
              limit: _limit,
              cursorColumn: _cursorColumn,
              path: _path,
              ...prismaArgs
            } = paginationArgs;

            // Build query with cursor
            const queryArgs: any = {
              ...prismaArgs,
              take: limit + 1, // Fetch one extra to detect if there are more pages
            };

            // Add cursor if provided
            if (cursorValue) {
              const parsedCursor =
                mergedConfig.cursor.parseCursor?.(cursorValue);
              queryArgs.cursor = { [cursorColumn]: parsedCursor };
              queryArgs.skip = 1; // Skip the cursor item itself
            }

            // Execute query
            const data = await (context as any).findMany(queryArgs);

            // Return CursorPaginator
            return Paginator.cursor({
              data,
              perPage: limit,
              cursorColumn: cursorColumn as any,
              prevCursor: cursorValue,
              path,
            });
          },
        },
      },
    });
  });
}

/**
 * Create a custom paginator with specific configuration
 *
 * This allows you to create multiple paginators with different settings.
 *
 * @example
 * ```typescript
 * import { createPaginator } from '$/@frouvel/kaname/paginator/prisma';
 *
 * const paginate = createPaginator({
 *   pages: { limit: 25 },
 *   cursor: { limit: 50 },
 * });
 *
 * const prisma = new PrismaClient().$extends({
 *   model: {
 *     user: { paginate },
 *     post: { paginate },
 *   },
 * });
 * ```
 */
export function createPaginator(config: PaginationConfig = {}) {
  return pagination(config);
}
