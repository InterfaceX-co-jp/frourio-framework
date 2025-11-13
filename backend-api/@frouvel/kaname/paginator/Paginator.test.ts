import { describe, it, expect } from 'vitest';
import {
  Paginator,
  isLengthAwarePaginatorResponse,
  isCursorPaginatorResponse,
} from './Paginator';

describe('Paginator Facade', () => {
  const sampleData = [
    { id: 1, name: 'User 1', createdAt: new Date('2024-01-01') },
    { id: 2, name: 'User 2', createdAt: new Date('2024-01-02') },
    { id: 3, name: 'User 3', createdAt: new Date('2024-01-03') },
  ];

  describe('lengthAware', () => {
    it('should create LengthAwarePaginator', () => {
      const paginator = Paginator.lengthAware({
        data: sampleData,
        total: 100,
        perPage: 10,
        currentPage: 1,
      });

      expect(paginator.data).toEqual(sampleData);
      expect(paginator.total).toBe(100);
      expect(paginator.currentPage).toBe(1);
      expect(paginator.lastPage).toBe(10);
    });

    it('should return response with meta containing total', () => {
      const paginator = Paginator.lengthAware({
        data: sampleData,
        total: 100,
        perPage: 10,
        currentPage: 1,
      });

      const response = paginator.toResponse();

      expect(response.meta).toHaveProperty('total');
      expect(response.meta).toHaveProperty('currentPage');
      expect(response.meta).toHaveProperty('lastPage');
    });
  });

  describe('cursor', () => {
    it('should create CursorPaginator', () => {
      const paginator = Paginator.cursor({
        data: sampleData,
        perPage: 10,
        cursorColumn: 'id',
      });

      expect(paginator.data).toEqual(sampleData);
      expect(paginator.perPage).toBe(10);
      expect(paginator.cursorColumn).toBe('id');
    });

    it('should return response with meta containing cursors', () => {
      const dataWithExtra = [...sampleData, { id: 4, name: 'User 4', createdAt: new Date('2024-01-04') }];

      const paginator = Paginator.cursor({
        data: dataWithExtra,
        perPage: 3,
        cursorColumn: 'id',
      });

      const response = paginator.toResponse();

      expect(response.meta).toHaveProperty('nextCursor');
      expect(response.meta).toHaveProperty('prevCursor');
      expect(response.meta).not.toHaveProperty('total');
    });
  });

  describe('decodeCursor', () => {
    it('should decode a cursor', () => {
      const original = '123';
      const encoded = Buffer.from(original).toString('base64');
      const decoded = Paginator.decodeCursor(encoded);

      expect(decoded).toBe(original);
    });

    it('should throw error for invalid cursor', () => {
      expect(() => Paginator.decodeCursor('invalid!!!')).toThrow('Invalid cursor format');
    });
  });

  describe('isLengthAwarePaginatorResponse', () => {
    it('should return true for LengthAwarePaginator response', () => {
      const response = Paginator.lengthAware({
        data: sampleData,
        total: 100,
        perPage: 10,
        currentPage: 1,
      }).toResponse();

      expect(isLengthAwarePaginatorResponse(response)).toBe(true);
    });

    it('should return false for CursorPaginator response', () => {
      const response = Paginator.cursor({
        data: sampleData,
        perPage: 10,
        cursorColumn: 'id',
      }).toResponse();

      expect(isLengthAwarePaginatorResponse(response)).toBe(false);
    });

    it('should return false for non-paginator objects', () => {
      expect(isLengthAwarePaginatorResponse({})).toBe(false);
      expect(isLengthAwarePaginatorResponse(null)).toBe(false);
      expect(isLengthAwarePaginatorResponse(undefined)).toBe(false);
      expect(isLengthAwarePaginatorResponse({ data: [] })).toBe(false);
    });
  });

  describe('isCursorPaginatorResponse', () => {
    it('should return true for CursorPaginator response', () => {
      const response = Paginator.cursor({
        data: sampleData,
        perPage: 10,
        cursorColumn: 'id',
      }).toResponse();

      expect(isCursorPaginatorResponse(response)).toBe(true);
    });

    it('should return false for LengthAwarePaginator response', () => {
      const response = Paginator.lengthAware({
        data: sampleData,
        total: 100,
        perPage: 10,
        currentPage: 1,
      }).toResponse();

      expect(isCursorPaginatorResponse(response)).toBe(false);
    });

    it('should return false for non-paginator objects', () => {
      expect(isCursorPaginatorResponse({})).toBe(false);
      expect(isCursorPaginatorResponse(null)).toBe(false);
      expect(isCursorPaginatorResponse(undefined)).toBe(false);
      expect(isCursorPaginatorResponse({ data: [] })).toBe(false);
    });
  });

  describe('integration', () => {
    it('should work with transformation', () => {
      const lengthAware = Paginator.lengthAware({
        data: sampleData,
        total: 100,
        perPage: 10,
        currentPage: 1,
      });

      const transformed = lengthAware.map((item) => ({
        userId: item.id,
        userName: item.name,
      }));

      expect(transformed.data[0]).toEqual({
        userId: 1,
        userName: 'User 1',
      });
      expect(transformed.total).toBe(100);
    });

    it('should handle cursor with transformation', () => {
      const cursor = Paginator.cursor({
        data: [...sampleData, { id: 4, name: 'User 4', createdAt: new Date('2024-01-04') }],
        perPage: 3,
        cursorColumn: 'id',
      });

      const transformed = cursor.map((item) => ({
        userId: item.id,
        userName: item.name.toUpperCase(),
        createdAt: item.createdAt,
      }));

      expect(transformed.data[0].userName).toBe('USER 1');
      expect(transformed.hasMorePages()).toBe(true);
    });
  });
});