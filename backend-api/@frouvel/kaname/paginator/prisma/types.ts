/**
 * Prisma Pagination Extension Types
 */

/**
 * Configuration for length-aware (offset-based) pagination
 */
export interface PagesConfig {
  /**
   * Default number of items per page
   * @default 10
   */
  limit?: number;

  /**
   * Whether to include page count in response by default
   * @default true
   */
  includePageCount?: boolean;
}

/**
 * Configuration for cursor-based pagination
 */
export interface CursorConfig<T = any> {
  /**
   * Default number of items per page
   * @default 10
   */
  limit?: number;

  /**
   * Function to extract cursor value from a record
   */
  getCursor?: (record: T) => any;

  /**
   * Function to parse cursor string back to value
   */
  parseCursor?: (cursor: string) => any;
}

/**
 * Overall pagination extension configuration
 */
export interface PaginationConfig<T = any> {
  /**
   * Configuration for page-based pagination
   */
  pages?: PagesConfig;

  /**
   * Configuration for cursor-based pagination
   */
  cursor?: CursorConfig<T>;
}

/**
 * Arguments for page-based pagination
 */
export interface WithPagesArgs {
  /**
   * Page number (1-based)
   */
  page?: number;

  /**
   * Number of items per page
   */
  limit?: number;

  /**
   * Whether to include total count
   * @default true
   */
  includePageCount?: boolean;
}

/**
 * Arguments for cursor-based pagination
 */
export interface WithCursorArgs {
  /**
   * Cursor for pagination
   */
  cursor?: string | null;

  /**
   * Number of items per page
   */
  limit?: number;

  /**
   * Column to use as cursor
   * @default 'id'
   */
  cursorColumn?: string;

  /**
   * Base path for pagination links
   */
  path?: string;
}