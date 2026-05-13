/**
 * Paginator Facade - Unified interface for pagination
 *
 * Provides a Laravel-like facade for creating different types of paginators.
 * This facade simplifies pagination by offering convenient factory methods.
 *
 * @example
 * ```typescript
 * import { Paginator } from '$/@frouvel/kaname/paginator';
 *
 * // Length-aware pagination (offset-based)
 * const lengthAware = Paginator.lengthAware({
 *   data: users,
 *   total: 1000,
 *   perPage: 10,
 *   currentPage: 1,
 * });
 *
 * // Cursor pagination (for large datasets)
 * const cursor = Paginator.cursor({
 *   data: users,
 *   perPage: 10,
 *   cursorColumn: 'id',
 * });
 * ```
 */

import {
  LengthAwarePaginator,
  type LengthAwarePaginatorResponse,
} from './LengthAwarePaginator';
import {
  CursorPaginator,
  type CursorPaginatorResponse,
} from './CursorPaginator';

export class Paginator {
  /**
   * Create a length-aware paginator (offset-based pagination)
   *
   * Best for:
   * - Small to medium datasets
   * - When you need to know total pages/items
   * - When users need to jump to specific pages
   * - When data doesn't change frequently
   *
   * @param args - Configuration for length-aware pagination
   * @returns LengthAwarePaginator instance
   *
   * @example
   * ```typescript
   * const paginator = Paginator.lengthAware({
   *   data: users.map(u => u.toDto()),
   *   total: 1000,
   *   perPage: 10,
   *   currentPage: 1,
   * });
   *
   * return paginator.toResponse();
   * ```
   */
  static lengthAware<T>(args: {
    data: T[];
    total: number;
    perPage: number;
    currentPage: number;
  }): LengthAwarePaginator<T> {
    return LengthAwarePaginator.create(args);
  }

  /**
   * Create a cursor-based paginator
   *
   * Best for:
   * - Large datasets (thousands to millions of records)
   * - Real-time feeds (social media, activity logs)
   * - When data changes frequently
   * - When you need consistent performance
   * - Infinite scroll interfaces
   *
   * @param args - Configuration for cursor pagination
   * @returns CursorPaginator instance
   *
   * @example
   * ```typescript
   * // Fetch data with cursor
   * const users = await prisma.user.findMany({
   *   take: 11, // perPage + 1
   *   ...(cursor ? { cursor: { id: parseInt(CursorPaginator.decodeCursor(cursor)) }, skip: 1 } : {}),
   *   orderBy: { id: 'desc' },
   * });
   *
   * const paginator = Paginator.cursor({
   *   data: users,
   *   perPage: 10,
   *   cursorColumn: 'id',
   *   prevCursor: cursor,
   * });
   *
   * return paginator.map(u => u.toDto()).toResponse();
   * ```
   */
  static cursor<T extends Record<string, any>>(args: {
    data: T[];
    perPage: number;
    cursorColumn: keyof T;
    prevCursor?: string | null;
    path?: string;
  }): CursorPaginator<T> {
    return CursorPaginator.create(args);
  }

  /**
   * Decode a cursor string to its original value
   *
   * @param cursor - Base64 encoded cursor
   * @returns Decoded cursor value
   *
   * @example
   * ```typescript
   * const decodedId = Paginator.decodeCursor(query.cursor);
   * // Use in database query
   * ```
   */
  static decodeCursor(cursor: string): string {
    return CursorPaginator.decodeCursor(cursor);
  }
}

/**
 * Type guard to check if a response is from LengthAwarePaginator
 */
export function isLengthAwarePaginatorResponse<T>(
  response: any,
): response is LengthAwarePaginatorResponse<T> {
  return !!(
    response &&
    typeof response === 'object' &&
    'data' in response &&
    'meta' in response &&
    'total' in response.meta &&
    'currentPage' in response.meta &&
    'lastPage' in response.meta
  );
}

/**
 * Type guard to check if a response is from CursorPaginator
 */
export function isCursorPaginatorResponse<T>(
  response: any,
): response is CursorPaginatorResponse<T> {
  return !!(
    response &&
    typeof response === 'object' &&
    'data' in response &&
    'meta' in response &&
    'nextCursor' in response.meta &&
    !('total' in response.meta)
  );
}