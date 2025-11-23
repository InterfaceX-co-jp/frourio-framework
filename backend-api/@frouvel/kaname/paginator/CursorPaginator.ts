/* eslint-disable max-lines */
/**
 * CursorPaginator - Laravel-like cursor-based pagination
 *
 * Provides efficient pagination for large datasets using cursor-based navigation
 * instead of offset-based. This avoids performance issues with OFFSET queries
 * on large tables and prevents skipped/duplicate items when data changes.
 *
 * @example
 * ```typescript
 * // Using ID as cursor
 * const users = await prisma.user.findMany({
 *   take: 11, // perPage + 1 to check if there's a next page
 *   ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
 *   orderBy: { id: 'desc' },
 * });
 *
 * const paginator = CursorPaginator.create({
 *   data: users,
 *   perPage: 10,
 *   cursorColumn: 'id',
 * });
 *
 * // Access pagination info
 * console.log(paginator.hasMorePages()); // Boolean
 * console.log(paginator.nextCursor);     // Cursor for next page
 * console.log(paginator.prevCursor);     // Cursor for previous page
 *
 * // Transform to API response
 * return paginator.toResponse();
 * ```
 */
export class CursorPaginator<T extends Record<string, any>> {
  private readonly _data: T[];
  private readonly _perPage: number;
  private readonly _cursorColumn: keyof T;
  private readonly _hasMore: boolean;
  private readonly _nextCursor: string | null;
  private readonly _prevCursor: string | null;
  private readonly _path?: string;

  private constructor(args: {
    data: T[];
    perPage: number;
    cursorColumn: keyof T;
    prevCursor?: string | null;
    path?: string;
    hasMore?: boolean;
    nextCursor?: string | null;
  }) {
    // Use provided hasMore if available, otherwise check data length
    this._hasMore = args.hasMore ?? args.data.length > args.perPage;

    // Trim data to perPage if we have more
    this._data = this._hasMore ? args.data.slice(0, args.perPage) : args.data;

    this._perPage = args.perPage;
    this._cursorColumn = args.cursorColumn;
    this._prevCursor = args.prevCursor ?? null;
    this._path = args.path;

    // Use provided nextCursor if available
    if (args.nextCursor !== undefined) {
      this._nextCursor = args.nextCursor;
    } else if (this._hasMore && this._data.length > 0) {
      // Calculate next cursor from the last item
      const lastItem = this._data[this._data.length - 1];
      const cursorValue = lastItem[this._cursorColumn];
      this._nextCursor = this.encodeCursor(cursorValue);
    } else {
      this._nextCursor = null;
    }
  }

  /**
   * Create a new CursorPaginator instance
   *
   * @param args - Configuration object
   * @param args.data - Array of items (should include perPage + 1 items to detect next page)
   * @param args.perPage - Number of items per page
   * @param args.cursorColumn - Column name used for cursor (e.g., 'id', 'createdAt')
   * @param args.prevCursor - Cursor for the previous page (optional)
   * @param args.path - Base path for pagination links (optional)
   */
  static create<T extends Record<string, any>>(args: {
    data: T[];
    perPage: number;
    cursorColumn: keyof T;
    prevCursor?: string | null;
    path?: string;
  }): CursorPaginator<T> {
    if (args.perPage < 1) {
      throw new Error('Per page must be at least 1');
    }

    if (!args.cursorColumn) {
      throw new Error('Cursor column is required');
    }

    return new CursorPaginator(args);
  }

  /**
   * Encode a cursor value to a string
   */
  private encodeCursor(value: any): string {
    if (value === null || value === undefined) {
      throw new Error('Cursor value cannot be null or undefined');
    }

    // Handle Date objects
    if (value instanceof Date) {
      return Buffer.from(value.toISOString()).toString('base64');
    }

    // Handle other types
    return Buffer.from(String(value)).toString('base64');
  }

  /**
   * Decode a cursor string to its original value
   */
  static decodeCursor(cursor: string): string {
    if (!cursor || typeof cursor !== 'string') {
      throw new Error('Invalid cursor format');
    }

    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');

      // Verify it's valid base64 by re-encoding and comparing
      const reencoded = Buffer.from(decoded).toString('base64');
      if (reencoded !== cursor) {
        throw new Error('Invalid cursor format');
      }

      return decoded;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Invalid cursor format');
    }
  }

  /**
   * Get the paginated items
   */
  get data(): T[] {
    return this._data;
  }

  /**
   * Get the number of items per page
   */
  get perPage(): number {
    return this._perPage;
  }

  /**
   * Get the cursor column name
   */
  get cursorColumn(): keyof T {
    return this._cursorColumn;
  }

  /**
   * Get the next page cursor
   * Returns null if there are no more pages
   */
  get nextCursor(): string | null {
    return this._nextCursor;
  }

  /**
   * Get the previous page cursor
   */
  get prevCursor(): string | null {
    return this._prevCursor;
  }

  /**
   * Get the base path for pagination links
   */
  get path(): string | undefined {
    return this._path;
  }

  /**
   * Check if there are more pages available
   */
  hasMorePages(): boolean {
    return this._hasMore;
  }

  /**
   * Get the count of items on the current page
   */
  count(): number {
    return this._data.length;
  }

  /**
   * Check if the paginator is empty
   */
  isEmpty(): boolean {
    return this._data.length === 0;
  }

  /**
   * Check if the paginator is not empty
   */
  isNotEmpty(): boolean {
    return this._data.length > 0;
  }

  /**
   * Transform to API response format
   */
  toResponse(): CursorPaginatorResponse<T> {
    return {
      data: this._data,
      meta: {
        perPage: this._perPage,
        nextCursor: this._nextCursor,
        prevCursor: this._prevCursor,
        path: this._path,
      },
    };
  }

  /**
   * Transform items using a callback function
   *
   * @example
   * ```typescript
   * const userPaginator = CursorPaginator.create({ ... });
   * const dtosPaginator = userPaginator.map(user => user.toDto());
   * ```
   */
  map<U extends Record<string, any>>(
    callback: (item: T, index: number) => U,
  ): CursorPaginator<U> {
    const transformedData = this._data.map(callback);

    return new CursorPaginator({
      data: transformedData,
      perPage: this._perPage,
      cursorColumn: this._cursorColumn as keyof U,
      prevCursor: this._prevCursor,
      path: this._path,
      hasMore: this._hasMore,
      nextCursor: this._nextCursor,
    });
  }

  /**
   * Get pagination links
   */
  getLinks(): CursorPaginationLinks {
    const baseUrl = this._path || '';

    return {
      first: baseUrl,
      prev: this._prevCursor ? `${baseUrl}?cursor=${this._prevCursor}` : null,
      next: this._nextCursor ? `${baseUrl}?cursor=${this._nextCursor}` : null,
    };
  }

  /**
   * Convert to a plain object (useful for JSON serialization)
   */
  toJSON(): CursorPaginatorJSON<T> {
    return {
      data: this._data,
      perPage: this._perPage,
      nextCursor: this._nextCursor,
      prevCursor: this._prevCursor,
      path: this._path,
      links: this.getLinks(),
    };
  }
}

/**
 * Standard API response format for cursor-paginated data
 */
export interface CursorPaginatorResponse<T> {
  data: T[];
  meta: {
    perPage: number;
    nextCursor: string | null;
    prevCursor: string | null;
    path?: string;
  };
}

/**
 * Pagination links for cursor-based pagination
 */
export interface CursorPaginationLinks {
  first: string;
  prev: string | null;
  next: string | null;
}

/**
 * Full JSON representation of cursor paginator
 */
export interface CursorPaginatorJSON<T> {
  data: T[];
  perPage: number;
  nextCursor: string | null;
  prevCursor: string | null;
  path?: string;
  links: CursorPaginationLinks;
}
