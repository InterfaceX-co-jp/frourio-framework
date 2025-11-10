/**
 * Prisma Pagination Extension
 *
 * Provides seamless integration between Prisma and our Paginator facade.
 */

export { pagination, createPaginator } from './extension';
export type {
  PaginationConfig,
  PagesConfig,
  CursorConfig,
  WithPagesArgs,
  WithCursorArgs,
} from './types';