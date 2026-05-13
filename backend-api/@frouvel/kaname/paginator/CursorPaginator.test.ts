/* eslint-disable max-lines */
import { describe, it, expect } from 'vitest';
import { CursorPaginator } from './CursorPaginator';

describe('CursorPaginator', () => {
  const sampleData = [
    { id: 1, name: 'User 1', createdAt: new Date('2024-01-01') },
    { id: 2, name: 'User 2', createdAt: new Date('2024-01-02') },
    { id: 3, name: 'User 3', createdAt: new Date('2024-01-03') },
    { id: 4, name: 'User 4', createdAt: new Date('2024-01-04') },
    { id: 5, name: 'User 5', createdAt: new Date('2024-01-05') },
  ];

  describe('create', () => {
    it('should create a paginator with valid parameters', () => {
      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 10,
        cursorColumn: 'id',
      });

      expect(paginator).toBeDefined();
      expect(paginator.data).toEqual(sampleData);
      expect(paginator.perPage).toBe(10);
      expect(paginator.cursorColumn).toBe('id');
    });

    it('should throw error for invalid perPage', () => {
      expect(() =>
        CursorPaginator.create({
          data: sampleData,
          perPage: 0,
          cursorColumn: 'id',
        }),
      ).toThrow('Per page must be at least 1');
    });

    it('should throw error for missing cursor column', () => {
      expect(() =>
        CursorPaginator.create({
          data: sampleData,
          perPage: 10,
          cursorColumn: '' as any,
        }),
      ).toThrow('Cursor column is required');
    });
  });

  describe('pagination detection', () => {
    it('should detect when there are more pages (perPage + 1 items)', () => {
      // Simulate fetching perPage + 1 items
      const dataWithExtra = [
        ...sampleData,
        { id: 6, name: 'User 6', createdAt: new Date('2024-01-06') },
      ];

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 5,
        cursorColumn: 'id',
      });

      expect(paginator.hasMorePages()).toBe(true);
      expect(paginator.data.length).toBe(5); // Should trim to perPage
      expect(paginator.nextCursor).not.toBeNull();
    });

    it('should detect when there are no more pages', () => {
      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 10,
        cursorColumn: 'id',
      });

      expect(paginator.hasMorePages()).toBe(false);
      expect(paginator.data.length).toBe(5);
      expect(paginator.nextCursor).toBeNull();
    });

    it('should handle exact perPage count', () => {
      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 5,
        cursorColumn: 'id',
      });

      expect(paginator.hasMorePages()).toBe(false);
      expect(paginator.data.length).toBe(5);
      expect(paginator.nextCursor).toBeNull();
    });
  });

  describe('cursor encoding/decoding', () => {
    it('should encode and decode cursor for numeric ID', () => {
      const dataWithExtra = [
        ...sampleData,
        { id: 6, name: 'User 6', createdAt: new Date('2024-01-06') },
      ];

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 5,
        cursorColumn: 'id',
      });

      const nextCursor = paginator.nextCursor;
      expect(nextCursor).not.toBeNull();

      if (nextCursor) {
        const decoded = CursorPaginator.decodeCursor(nextCursor);
        expect(decoded).toBe('5'); // Last item's ID
      }
    });

    it('should encode and decode cursor for Date', () => {
      const dataWithExtra = [
        ...sampleData,
        { id: 6, name: 'User 6', createdAt: new Date('2024-01-06') },
      ];

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 5,
        cursorColumn: 'createdAt',
      });

      const nextCursor = paginator.nextCursor;
      expect(nextCursor).not.toBeNull();

      if (nextCursor) {
        const decoded = CursorPaginator.decodeCursor(nextCursor);
        expect(decoded).toContain('2024-01-05'); // Last item's date
      }
    });

    it('should handle string cursors', () => {
      const stringData = [
        { id: 'a', name: 'User A' },
        { id: 'b', name: 'User B' },
        { id: 'c', name: 'User C' },
      ];

      const dataWithExtra = [...stringData, { id: 'd', name: 'User D' }];

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 3,
        cursorColumn: 'id',
      });

      const nextCursor = paginator.nextCursor;
      expect(nextCursor).not.toBeNull();

      if (nextCursor) {
        const decoded = CursorPaginator.decodeCursor(nextCursor);
        expect(decoded).toBe('c');
      }
    });

    it('should throw error for invalid cursor format', () => {
      expect(() => CursorPaginator.decodeCursor('invalid!!!')).toThrow(
        'Invalid cursor format',
      );
    });
  });

  describe('prevCursor', () => {
    it('should store previous cursor when provided', () => {
      const previousCursor = Buffer.from('10').toString('base64');

      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 5,
        cursorColumn: 'id',
        prevCursor: previousCursor,
      });

      expect(paginator.prevCursor).toBe(previousCursor);
    });

    it('should be null when not provided', () => {
      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 5,
        cursorColumn: 'id',
      });

      expect(paginator.prevCursor).toBeNull();
    });
  });

  describe('count', () => {
    it('should return count of items on current page', () => {
      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 10,
        cursorColumn: 'id',
      });

      expect(paginator.count()).toBe(5);
    });

    it('should return 0 for empty page', () => {
      const paginator = CursorPaginator.create({
        data: [],
        perPage: 10,
        cursorColumn: 'id',
      });

      expect(paginator.count()).toBe(0);
    });

    it('should return perPage when trimmed', () => {
      const dataWithExtra = [
        ...sampleData,
        { id: 6, name: 'User 6', createdAt: new Date('2024-01-06') },
      ];

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 5,
        cursorColumn: 'id',
      });

      expect(paginator.count()).toBe(5);
    });
  });

  describe('isEmpty and isNotEmpty', () => {
    it('should return true for isEmpty when no items', () => {
      const paginator = CursorPaginator.create({
        data: [],
        perPage: 10,
        cursorColumn: 'id',
      });

      expect(paginator.isEmpty()).toBe(true);
      expect(paginator.isNotEmpty()).toBe(false);
    });

    it('should return false for isEmpty when has items', () => {
      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 10,
        cursorColumn: 'id',
      });

      expect(paginator.isEmpty()).toBe(false);
      expect(paginator.isNotEmpty()).toBe(true);
    });
  });

  describe('toResponse', () => {
    it('should convert to API response format without path', () => {
      const dataWithExtra = [
        ...sampleData,
        { id: 6, name: 'User 6', createdAt: new Date('2024-01-06') },
      ];

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 5,
        cursorColumn: 'id',
      });

      const response = paginator.toResponse();

      expect(response.data.length).toBe(5);
      expect(response.meta.perPage).toBe(5);
      expect(response.meta.nextCursor).not.toBeNull();
      expect(response.meta.prevCursor).toBeNull();
      expect(response.meta.path).toBeUndefined();
    });

    it('should convert to API response format with path', () => {
      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 5,
        cursorColumn: 'id',
        path: '/api/users',
      });

      const response = paginator.toResponse();

      expect(response.meta.path).toBe('/api/users');
    });
  });

  describe('map', () => {
    it('should transform items while preserving pagination metadata', () => {
      const dataWithExtra = [
        ...sampleData,
        { id: 6, name: 'User 6', createdAt: new Date('2024-01-06') },
      ];

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 5,
        cursorColumn: 'id',
      });

      const transformed = paginator.map((item) => ({
        userId: item.id,
        userName: item.name.toUpperCase(),
        createdAt: item.createdAt,
      }));

      expect(transformed.data).toEqual([
        { userId: 1, userName: 'USER 1', createdAt: sampleData[0].createdAt },
        { userId: 2, userName: 'USER 2', createdAt: sampleData[1].createdAt },
        { userId: 3, userName: 'USER 3', createdAt: sampleData[2].createdAt },
        { userId: 4, userName: 'USER 4', createdAt: sampleData[3].createdAt },
        { userId: 5, userName: 'USER 5', createdAt: sampleData[4].createdAt },
      ]);
      expect(transformed.hasMorePages()).toBe(true);
      expect(transformed.perPage).toBe(5);
    });

    it('should work with index parameter', () => {
      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 10,
        cursorColumn: 'id',
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
    it('should return correct links without path', () => {
      const dataWithExtra = [
        ...sampleData,
        { id: 6, name: 'User 6', createdAt: new Date('2024-01-06') },
      ];
      const prevCursor = Buffer.from('0').toString('base64');

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 5,
        cursorColumn: 'id',
        prevCursor,
      });

      const links = paginator.getLinks();

      expect(links.first).toBe('');
      expect(links.prev).toContain(`?cursor=${prevCursor}`);
      expect(links.next).toContain('?cursor=');
      expect(links.next).not.toBeNull();
    });

    it('should return correct links with path', () => {
      const dataWithExtra = [
        ...sampleData,
        { id: 6, name: 'User 6', createdAt: new Date('2024-01-06') },
      ];
      const prevCursor = Buffer.from('0').toString('base64');

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 5,
        cursorColumn: 'id',
        prevCursor,
        path: '/api/users',
      });

      const links = paginator.getLinks();

      expect(links.first).toBe('/api/users');
      expect(links.prev).toBe(`/api/users?cursor=${prevCursor}`);
      expect(links.next).toContain('/api/users?cursor=');
    });

    it('should return null prev when no previous cursor', () => {
      const paginator = CursorPaginator.create({
        data: sampleData,
        perPage: 10,
        cursorColumn: 'id',
      });

      const links = paginator.getLinks();

      expect(links.prev).toBeNull();
      expect(links.next).toBeNull();
    });
  });

  describe('toJSON', () => {
    it('should convert to full JSON representation', () => {
      const dataWithExtra = [
        ...sampleData,
        { id: 6, name: 'User 6', createdAt: new Date('2024-01-06') },
      ];
      const prevCursor = Buffer.from('0').toString('base64');

      const paginator = CursorPaginator.create({
        data: dataWithExtra,
        perPage: 5,
        cursorColumn: 'id',
        prevCursor,
        path: '/api/users',
      });

      const json = paginator.toJSON();

      expect(json.data.length).toBe(5);
      expect(json.perPage).toBe(5);
      expect(json.nextCursor).not.toBeNull();
      expect(json.prevCursor).toBe(prevCursor);
      expect(json.path).toBe('/api/users');
      expect(json.links).toBeDefined();
      expect(json.links.first).toBe('/api/users');
      expect(json.links.prev).toContain(prevCursor);
      expect(json.links.next).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle single item', () => {
      const singleItem = [
        { id: 1, name: 'User 1', createdAt: new Date('2024-01-01') },
      ];

      const paginator = CursorPaginator.create({
        data: singleItem,
        perPage: 10,
        cursorColumn: 'id',
      });

      expect(paginator.count()).toBe(1);
      expect(paginator.hasMorePages()).toBe(false);
      expect(paginator.nextCursor).toBeNull();
    });

    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 101 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        createdAt: new Date(`2024-01-${(i % 30) + 1}`),
      }));

      const paginator = CursorPaginator.create({
        data: largeData,
        perPage: 100,
        cursorColumn: 'id',
      });

      expect(paginator.count()).toBe(100);
      expect(paginator.hasMorePages()).toBe(true);
      expect(paginator.nextCursor).not.toBeNull();
    });
  });
});
