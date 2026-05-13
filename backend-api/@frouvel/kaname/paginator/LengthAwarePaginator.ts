/**
 * LengthAwarePaginator - Laravel-like pagination with full metadata
 *
 * Provides comprehensive pagination information including current page,
 * total items, page ranges, and navigation helpers.
 *
 * @example
 * ```typescript
 * const users = await userRepository.findMany({ skip: 0, take: 10 });
 * const total = await userRepository.count();
 *
 * const paginator = LengthAwarePaginator.create({
 *   data: users.map(u => u.toDto()),
 *   total,
 *   perPage: 10,
 *   currentPage: 1,
 * });
 *
 * // Access pagination info
 * console.log(paginator.total);        // Total items
 * console.log(paginator.lastPage);     // Total pages
 * console.log(paginator.from);         // First item number on page
 * console.log(paginator.to);           // Last item number on page
 * console.log(paginator.hasMorePages()); // Boolean
 *
 * // Transform to API response
 * return paginator.toResponse();
 * ```
 */
export class LengthAwarePaginator<T> {
  private readonly _data: T[];
  private readonly _total: number;
  private readonly _perPage: number;
  private readonly _currentPage: number;
  private readonly _lastPage: number;
  private readonly _from: number | null;
  private readonly _to: number | null;

  private constructor(args: {
    data: T[];
    total: number;
    perPage: number;
    currentPage: number;
  }) {
    this._data = args.data;
    this._total = args.total;
    this._perPage = args.perPage;
    this._currentPage = args.currentPage;
    this._lastPage = Math.ceil(args.total / args.perPage);

    // Calculate from and to
    if (args.data.length === 0) {
      this._from = null;
      this._to = null;
    } else {
      this._from = (args.currentPage - 1) * args.perPage + 1;
      this._to = Math.min(this._from + args.data.length - 1, args.total);
    }
  }

  /**
   * Create a new LengthAwarePaginator instance
   *
   * @param args - Configuration object
   * @param args.data - Array of items for current page
   * @param args.total - Total number of items across all pages
   * @param args.perPage - Number of items per page
   * @param args.currentPage - Current page number (1-based)
   */
  static create<T>(args: {
    data: T[];
    total: number;
    perPage: number;
    currentPage: number;
  }): LengthAwarePaginator<T> {
    if (args.currentPage < 1) {
      throw new Error('Current page must be at least 1');
    }

    if (args.perPage < 1) {
      throw new Error('Per page must be at least 1');
    }

    if (args.total < 0) {
      throw new Error('Total must be non-negative');
    }

    return new LengthAwarePaginator(args);
  }

  /**
   * Get the paginated items
   */
  get data(): T[] {
    return this._data;
  }

  /**
   * Get the total number of items
   */
  get total(): number {
    return this._total;
  }

  /**
   * Get the number of items per page
   */
  get perPage(): number {
    return this._perPage;
  }

  /**
   * Get the current page number
   */
  get currentPage(): number {
    return this._currentPage;
  }

  /**
   * Get the last page number (total pages)
   */
  get lastPage(): number {
    return this._lastPage;
  }

  /**
   * Get the number of the first item on the current page (1-based)
   * Returns null if there are no items
   */
  get from(): number | null {
    return this._from;
  }

  /**
   * Get the number of the last item on the current page (1-based)
   * Returns null if there are no items
   */
  get to(): number | null {
    return this._to;
  }

  /**
   * Check if there are more pages available
   */
  hasMorePages(): boolean {
    return this._currentPage < this._lastPage;
  }

  /**
   * Check if this is the first page
   */
  onFirstPage(): boolean {
    return this._currentPage === 1;
  }

  /**
   * Check if this is the last page
   */
  onLastPage(): boolean {
    return this._currentPage === this._lastPage;
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
   * Commonly used structure for pagination responses
   */
  toResponse(): LengthAwarePaginatorResponse<T> {
    return {
      data: this._data,
      meta: {
        total: this._total,
        perPage: this._perPage,
        currentPage: this._currentPage,
        lastPage: this._lastPage,
        from: this._from,
        to: this._to,
      },
    };
  }

  /**
   * Transform items using a callback function
   *
   * @example
   * ```typescript
   * const userPaginator = LengthAwarePaginator.create({ ... });
   * const dtosPaginator = userPaginator.map(user => user.toDto());
   * ```
   */
  map<U>(callback: (item: T, index: number) => U): LengthAwarePaginator<U> {
    return LengthAwarePaginator.create({
      data: this._data.map(callback),
      total: this._total,
      perPage: this._perPage,
      currentPage: this._currentPage,
    });
  }

  /**
   * Get Laravel-style pagination links metadata
   */
  getLinks(): PaginationLinks {
    return {
      first: 1,
      last: this._lastPage,
      prev: this._currentPage > 1 ? this._currentPage - 1 : null,
      next: this.hasMorePages() ? this._currentPage + 1 : null,
    };
  }

  /**
   * Convert to a plain object (useful for JSON serialization)
   */
  toJSON(): LengthAwarePaginatorJSON<T> {
    return {
      data: this._data,
      total: this._total,
      perPage: this._perPage,
      currentPage: this._currentPage,
      lastPage: this._lastPage,
      from: this._from,
      to: this._to,
      links: this.getLinks(),
    };
  }
}

/**
 * Standard API response format for paginated data
 */
export interface LengthAwarePaginatorResponse<T> {
  data: T[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
  };
}

/**
 * Pagination links metadata
 */
export interface PaginationLinks {
  first: number;
  last: number;
  prev: number | null;
  next: number | null;
}

/**
 * Full JSON representation of paginator
 */
export interface LengthAwarePaginatorJSON<T> {
  data: T[];
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  from: number | null;
  to: number | null;
  links: PaginationLinks;
}