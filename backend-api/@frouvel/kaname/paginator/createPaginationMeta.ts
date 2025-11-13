import type { PaginationMeta } from './types';

export const createPaginationMeta = (args: {
  totalCount: number;
  perPage: number;
}): PaginationMeta => {
  return {
    totalPages: Math.ceil(args.totalCount / args.perPage),
    perPage: args.perPage,
  };
};
