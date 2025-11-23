export { createPaginationMeta } from './createPaginationMeta';
export {
  LengthAwarePaginator,
  type LengthAwarePaginatorResponse,
  type PaginationLinks,
  type LengthAwarePaginatorJSON,
} from './LengthAwarePaginator';
export {
  CursorPaginator,
  type CursorPaginatorResponse,
  type CursorPaginationLinks,
  type CursorPaginatorJSON,
} from './CursorPaginator';
export {
  Paginator,
  isLengthAwarePaginatorResponse,
  isCursorPaginatorResponse,
} from './Paginator';
export type { PaginationMeta } from './types';

// Prisma Extension
export { pagination, createPaginator } from './prisma';
export type {
  PaginationConfig,
  PagesConfig,
  CursorConfig,
  WithPagesArgs,
  WithCursorArgs,
} from './prisma';