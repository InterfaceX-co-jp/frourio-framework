/* eslint-disable max-lines */
import { describe, it, expect } from 'vitest';
import { LengthAwarePaginator } from './LengthAwarePaginator';

describe('LengthAwarePaginator', () => {
  const sampleData = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    { id: 3, name: 'User 3' },
    { id: 4, name: 'User 4' },
    { id: 5, name: 'User 5' },
  ];

  describe('create', () => {
    it('should create a paginator with valid parameters', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator).toBeDefined();
      expect(paginator.data).toEqual(sampleData);
      expect(paginator.total).toBe(50);
      expect(paginator.perPage).toBe(10);
      expect(paginator.currentPage).toBe(1);
    });

    it('should throw error for invalid currentPage', () => {
      expect(() =>
        LengthAwarePaginator.create({
          data: sampleData,
          total: 50,
          perPage: 10,
          currentPage: 0,
        }),
      ).toThrow('Current page must be at least 1');
    });

    it('should throw error for invalid perPage', () => {
      expect(() =>
        LengthAwarePaginator.create({
          data: sampleData,
          total: 50,
          perPage: 0,
          currentPage: 1,
        }),
      ).toThrow('Per page must be at least 1');
    });

    it('should throw error for negative total', () => {
      expect(() =>
        LengthAwarePaginator.create({
          data: sampleData,
          total: -1,
          perPage: 10,
          currentPage: 1,
        }),
      ).toThrow('Total must be non-negative');
    });
  });

  describe('pagination metadata', () => {
    it('should calculate lastPage correctly', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 47,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.lastPage).toBe(5); // ceil(47/10) = 5
    });

    it('should calculate from and to for first page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.from).toBe(1);
      expect(paginator.to).toBe(5);
    });

    it('should calculate from and to for middle page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 3,
      });

      expect(paginator.from).toBe(21); // (3-1)*10 + 1
      expect(paginator.to).toBe(25); // 21 + 5 - 1
    });

    it('should calculate from and to for last page with partial data', () => {
      const partialData = [
        { id: 46, name: 'User 46' },
        { id: 47, name: 'User 47' },
      ];

      const paginator = LengthAwarePaginator.create({
        data: partialData,
        total: 47,
        perPage: 10,
        currentPage: 5,
      });

      expect(paginator.from).toBe(41); // (5-1)*10 + 1
      expect(paginator.to).toBe(42); // 41 + 2 - 1 (we only have 2 items)
    });

    it('should return null for from and to when empty', () => {
      const paginator = LengthAwarePaginator.create({
        data: [],
        total: 0,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.from).toBeNull();
      expect(paginator.to).toBeNull();
    });
  });

  describe('hasMorePages', () => {
    it('should return true when not on last page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.hasMorePages()).toBe(true);
    });

    it('should return false when on last page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 5,
      });

      expect(paginator.hasMorePages()).toBe(false);
    });

    it('should return false when no items', () => {
      const paginator = LengthAwarePaginator.create({
        data: [],
        total: 0,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.hasMorePages()).toBe(false);
    });
  });

  describe('onFirstPage', () => {
    it('should return true on first page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.onFirstPage()).toBe(true);
    });

    it('should return false on other pages', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 2,
      });

      expect(paginator.onFirstPage()).toBe(false);
    });
  });

  describe('onLastPage', () => {
    it('should return true on last page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 5,
      });

      expect(paginator.onLastPage()).toBe(true);
    });

    it('should return false on other pages', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 3,
      });

      expect(paginator.onLastPage()).toBe(false);
    });
  });

  describe('count', () => {
    it('should return count of items on current page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.count()).toBe(5);
    });

    it('should return 0 for empty page', () => {
      const paginator = LengthAwarePaginator.create({
        data: [],
        total: 0,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.count()).toBe(0);
    });
  });

  describe('isEmpty and isNotEmpty', () => {
    it('should return true for isEmpty when no items', () => {
      const paginator = LengthAwarePaginator.create({
        data: [],
        total: 0,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.isEmpty()).toBe(true);
      expect(paginator.isNotEmpty()).toBe(false);
    });

    it('should return false for isEmpty when has items', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.isEmpty()).toBe(false);
      expect(paginator.isNotEmpty()).toBe(true);
    });
  });

  describe('toResponse', () => {
    it('should convert to API response format', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 2,
      });

      const response = paginator.toResponse();

      expect(response).toEqual({
        data: sampleData,
        meta: {
          total: 50,
          perPage: 10,
          currentPage: 2,
          lastPage: 5,
          from: 11,
          to: 15,
        },
      });
    });
  });

  describe('map', () => {
    it('should transform items while preserving pagination metadata', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 1,
      });

      const transformed = paginator.map((item) => ({
        userId: item.id,
        userName: item.name.toUpperCase(),
      }));

      expect(transformed.data).toEqual([
        { userId: 1, userName: 'USER 1' },
        { userId: 2, userName: 'USER 2' },
        { userId: 3, userName: 'USER 3' },
        { userId: 4, userName: 'USER 4' },
        { userId: 5, userName: 'USER 5' },
      ]);
      expect(transformed.total).toBe(50);
      expect(transformed.currentPage).toBe(1);
      expect(transformed.perPage).toBe(10);
    });

    it('should work with index parameter', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 1,
      });

      const transformed = paginator.map((item, index) => ({
        ...item,
        index,
      }));

      expect(transformed.data[0].index).toBe(0);
      expect(transformed.data[4].index).toBe(4);
    });
  });

  describe('getLinks', () => {
    it('should return correct links for first page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.getLinks()).toEqual({
        first: 1,
        last: 5,
        prev: null,
        next: 2,
      });
    });

    it('should return correct links for middle page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 3,
      });

      expect(paginator.getLinks()).toEqual({
        first: 1,
        last: 5,
        prev: 2,
        next: 4,
      });
    });

    it('should return correct links for last page', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 5,
      });

      expect(paginator.getLinks()).toEqual({
        first: 1,
        last: 5,
        prev: 4,
        next: null,
      });
    });
  });

  describe('toJSON', () => {
    it('should convert to full JSON representation', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 2,
      });

      const json = paginator.toJSON();

      expect(json).toEqual({
        data: sampleData,
        total: 50,
        perPage: 10,
        currentPage: 2,
        lastPage: 5,
        from: 11,
        to: 15,
        links: {
          first: 1,
          last: 5,
          prev: 1,
          next: 3,
        },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle single page scenario', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 5,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.lastPage).toBe(1);
      expect(paginator.onFirstPage()).toBe(true);
      expect(paginator.onLastPage()).toBe(true);
      expect(paginator.hasMorePages()).toBe(false);
      expect(paginator.getLinks()).toEqual({
        first: 1,
        last: 1,
        prev: null,
        next: null,
      });
    });

    it('should handle exact division', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 100,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.lastPage).toBe(10);
    });

    it('should handle large datasets', () => {
      const paginator = LengthAwarePaginator.create({
        data: sampleData,
        total: 10000,
        perPage: 10,
        currentPage: 500,
      });

      expect(paginator.lastPage).toBe(1000);
      expect(paginator.from).toBe(4991);
      expect(paginator.to).toBe(4995);
      expect(paginator.hasMorePages()).toBe(true);
    });
  });
});
