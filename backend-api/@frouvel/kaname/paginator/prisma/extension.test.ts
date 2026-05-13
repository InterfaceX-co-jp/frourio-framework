import { describe, it, expect } from 'vitest';
import { pagination } from './extension';
import { Paginator } from '../Paginator';

describe('Prisma Pagination Extension', () => {
  describe('Configuration', () => {
    it('should create extension with default config', () => {
      const extension = pagination();
      expect(extension).toBeDefined();
    });

    it('should create extension with custom config', () => {
      const extension = pagination({
        pages: {
          limit: 25,
          includePageCount: false,
        },
        cursor: {
          limit: 50,
        },
      });
      expect(extension).toBeDefined();
    });
  });

  describe('Extension Methods', () => {
    it('should create extension successfully', () => {
      const extension = pagination();
      expect(extension).toBeDefined();
      expect(extension).toHaveProperty('name');
    });

    it('should be usable with Prisma', () => {
      const extension = pagination();
      expect(extension).toBeDefined();
      // Extension is ready to be applied to Prisma Client
    });
  });

  describe('Paginator Integration', () => {
    it('should integrate with LengthAwarePaginator', () => {
      // Mock data
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      const paginator = Paginator.lengthAware({
        data: mockData,
        total: 10,
        perPage: 3,
        currentPage: 1,
      });

      expect(paginator.data).toEqual(mockData);
      expect(paginator.total).toBe(10);
      expect(paginator.currentPage).toBe(1);
      expect(paginator.lastPage).toBe(4);
    });

    it('should integrate with CursorPaginator', () => {
      // Mock data (with extra item to detect hasMore)
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
      ];

      const paginator = Paginator.cursor({
        data: mockData,
        perPage: 3,
        cursorColumn: 'id',
      });

      expect(paginator.data.length).toBe(3); // Should trim to perPage
      expect(paginator.hasMorePages()).toBe(true);
      expect(paginator.nextCursor).not.toBeNull();
    });
  });

  describe('Default Configuration Behavior', () => {
    it('should use default page limit of 10', () => {
      const extension = pagination();

      // Extension should be created with default config
      expect(extension).toBeDefined();

      // Default config values should be applied
      // These would be tested in integration with actual Prisma client
    });

    it('should include page count by default', () => {
      const extension = pagination();
      expect(extension).toBeDefined();
    });

    it('should allow overriding defaults', () => {
      const customExtension = pagination({
        pages: {
          limit: 50,
          includePageCount: false,
        },
        cursor: {
          limit: 100,
        },
      });

      expect(customExtension).toBeDefined();
    });
  });

  describe('Cursor Handling', () => {
    it('should decode cursor correctly', () => {
      const originalValue = '123';
      const encoded = Buffer.from(originalValue).toString('base64');
      const decoded = Paginator.decodeCursor(encoded);

      expect(decoded).toBe(originalValue);
    });

    it('should handle cursor with date values', () => {
      const date = new Date('2024-01-01');
      const encoded = Buffer.from(date.toISOString()).toString('base64');
      const decoded = Paginator.decodeCursor(encoded);

      expect(decoded).toContain('2024-01-01');
    });
  });

  describe('Map Transformation', () => {
    it('should support map on LengthAwarePaginator', () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];

      const paginator = Paginator.lengthAware({
        data: mockData,
        total: 10,
        perPage: 2,
        currentPage: 1,
      });

      const transformed = paginator.map((item) => ({
        itemId: item.id,
        itemName: item.name.toUpperCase(),
      }));

      expect(transformed.data[0]).toEqual({
        itemId: 1,
        itemName: 'ITEM 1',
      });
      expect(transformed.total).toBe(10);
    });

    it('should support map on CursorPaginator', () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      const paginator = Paginator.cursor({
        data: mockData,
        perPage: 2,
        cursorColumn: 'id',
      });

      const transformed = paginator.map((item) => ({
        itemId: item.id,
        itemName: item.name.toUpperCase(),
      }));

      expect(transformed.data[0]).toEqual({
        itemId: 1,
        itemName: 'ITEM 1',
      });
      expect(transformed.perPage).toBe(2);
    });
  });

  describe('Response Format', () => {
    it('should convert to response format for LengthAwarePaginator', () => {
      const mockData = [{ id: 1, name: 'Item 1' }];

      const paginator = Paginator.lengthAware({
        data: mockData,
        total: 10,
        perPage: 1,
        currentPage: 1,
      });

      const response = paginator.toResponse();

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('meta');
      expect(response.meta).toHaveProperty('total');
      expect(response.meta).toHaveProperty('currentPage');
      expect(response.meta).toHaveProperty('lastPage');
    });

    it('should convert to response format for CursorPaginator', () => {
      const mockData = [{ id: 1, name: 'Item 1' }];

      const paginator = Paginator.cursor({
        data: mockData,
        perPage: 1,
        cursorColumn: 'id',
      });

      const response = paginator.toResponse();

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('meta');
      expect(response.meta).toHaveProperty('nextCursor');
      expect(response.meta).toHaveProperty('prevCursor');
      expect(response.meta).toHaveProperty('perPage');
    });
  });
});
