/* eslint-disable max-lines */
/**
 * In-Memory Redis Client Mock
 *
 * A simple in-memory implementation of Redis client for development/testing
 * when the actual Redis package is not installed or Redis server is not available.
 *
 * This is NOT suitable for production use and provides basic functionality only.
 */

export interface InMemoryRedisClient {
  isOpen: boolean;
  connect(): Promise<void>;
  quit(): Promise<void>;
  ping(): Promise<string>;
  set(
    key: string,
    value: string,
    options?: { EX?: number },
  ): Promise<string | null>;
  get(key: string): Promise<string | null>;
  del(key: string | string[]): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  flushDb(): Promise<string>;
  flushAll(): Promise<string>;
  mGet(keys: string[]): Promise<(string | null)[]>;
  mSet(values: Record<string, string>): Promise<string>;
  incrBy(key: string, increment: number): Promise<number>;
  decrBy(key: string, decrement: number): Promise<number>;
  // Hash operations
  hSet(
    key: string,
    field: string | Record<string, string>,
    value?: string,
  ): Promise<number>;
  hGet(key: string, field: string): Promise<string | null>;
  hGetAll(key: string): Promise<Record<string, string>>;
  hExists(key: string, field: string): Promise<boolean>;
  hDel(key: string, field: string | string[]): Promise<number>;
  // List operations
  rPush(key: string, values: string | string[]): Promise<number>;
  lPush(key: string, values: string | string[]): Promise<number>;
  lRange(key: string, start: number, stop: number): Promise<string[]>;
  rPop(key: string): Promise<string | null>;
  lPop(key: string): Promise<string | null>;
  lLen(key: string): Promise<number>;
  // Set operations
  sAdd(key: string, members: string | string[]): Promise<number>;
  sIsMember(key: string, member: string): Promise<boolean>;
  sMembers(key: string): Promise<string[]>;
  sRem(key: string, members: string | string[]): Promise<number>;
  // Sorted set operations
  zAdd(
    key: string,
    members: { score: number; value: string }[],
  ): Promise<number>;
  zRange(
    key: string,
    start: number,
    stop: number,
    options?: { REV?: boolean },
  ): Promise<string[]>;
  zRangeWithScores(
    key: string,
    start: number,
    stop: number,
    options?: { REV?: boolean },
  ): Promise<{ value: string; score: number }[]>;
  zScore(key: string, member: string): Promise<number | null>;
  zIncrBy(key: string, increment: number, member: string): Promise<number>;
  zRevRank(key: string, member: string): Promise<number | null>;
  // Transaction support
  multi(): any;
}

interface StoredValue {
  value: any;
  expiresAt?: number;
}

export function createInMemoryRedisClient(): InMemoryRedisClient {
  const store = new Map<string, StoredValue>();

  const checkExpired = (key: string): boolean => {
    const item = store.get(key);
    if (item && item.expiresAt && Date.now() > item.expiresAt) {
      store.delete(key);
      return true;
    }
    return false;
  };

  const client: InMemoryRedisClient = {
    isOpen: false,

    async connect() {
      client.isOpen = true;
    },

    async quit() {
      client.isOpen = false;
      store.clear();
    },

    async ping() {
      return 'PONG';
    },

    async set(key: string, value: string, options?: { EX?: number }) {
      const item: StoredValue = { value };
      if (options?.EX) {
        item.expiresAt = Date.now() + options.EX * 1000;
      }
      store.set(key, item);
      return 'OK';
    },

    async get(key: string) {
      if (checkExpired(key)) return null;
      const item = store.get(key);
      return item?.value ?? null;
    },

    async del(key: string | string[]) {
      const keys = Array.isArray(key) ? key : [key];
      let count = 0;
      for (const k of keys) {
        if (store.delete(k)) count++;
      }
      return count;
    },

    async exists(key: string) {
      if (checkExpired(key)) return 0;
      return store.has(key) ? 1 : 0;
    },

    async expire(key: string, seconds: number) {
      const item = store.get(key);
      if (!item) return false;
      item.expiresAt = Date.now() + seconds * 1000;
      return true;
    },

    async ttl(key: string) {
      const item = store.get(key);
      if (!item) return -2;
      if (!item.expiresAt) return -1;
      const ttl = Math.ceil((item.expiresAt - Date.now()) / 1000);
      return ttl > 0 ? ttl : -2;
    },

    async keys(pattern: string) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
      return Array.from(store.keys()).filter(
        (key) => !checkExpired(key) && regex.test(key),
      );
    },

    async flushDb() {
      store.clear();
      return 'OK';
    },

    async flushAll() {
      store.clear();
      return 'OK';
    },

    async mGet(keys: string[]) {
      return await Promise.all(keys.map((key) => client.get(key)));
    },

    async mSet(values: Record<string, string>) {
      Object.entries(values).forEach(([key, value]) => {
        store.set(key, { value });
      });
      return 'OK';
    },

    async incrBy(key: string, increment: number) {
      const item = store.get(key);
      const current = parseInt(item?.value ?? '0', 10) || 0;
      const next = current + increment;

      const expiresAt = item?.expiresAt;
      store.set(key, { value: String(next), expiresAt });
      return next;
    },

    async decrBy(key: string, decrement: number) {
      return await client.incrBy(key, -decrement);
    },

    // Hash operations
    async hSet(
      key: string,
      field: string | Record<string, string>,
      value?: string,
    ) {
      let item = store.get(key);
      if (!item) {
        item = { value: {} };
        store.set(key, item);
      }
      if (typeof field === 'object') {
        Object.assign(item.value, field);
        return Object.keys(field).length;
      } else {
        item.value[field] = value;
        return 1;
      }
    },

    async hGet(key: string, field: string) {
      if (checkExpired(key)) return null;
      const item = store.get(key);
      return item?.value?.[field] ?? null;
    },

    async hGetAll(key: string) {
      if (checkExpired(key)) return {};
      const item = store.get(key);
      return item?.value ?? {};
    },

    async hExists(key: string, field: string) {
      if (checkExpired(key)) return false;
      const item = store.get(key);
      return item?.value?.[field] !== undefined;
    },

    async hDel(key: string, field: string | string[]) {
      const item = store.get(key);
      if (!item) return 0;
      const fields = Array.isArray(field) ? field : [field];
      let count = 0;
      for (const f of fields) {
        if (delete item.value[f]) count++;
      }
      return count;
    },

    // List operations
    async rPush(key: string, values: string | string[]) {
      let item = store.get(key);
      if (!item) {
        item = { value: [] };
        store.set(key, item);
      }
      const vals = Array.isArray(values) ? values : [values];
      item.value.push(...vals);
      return item.value.length;
    },

    async lPush(key: string, values: string | string[]) {
      let item = store.get(key);
      if (!item) {
        item = { value: [] };
        store.set(key, item);
      }
      const vals = Array.isArray(values) ? values : [values];
      item.value.unshift(...vals);
      return item.value.length;
    },

    async lRange(key: string, start: number, stop: number) {
      if (checkExpired(key)) return [];
      const item = store.get(key);
      if (!item) return [];
      const list = item.value;
      const end = stop === -1 ? list.length : stop + 1;
      return list.slice(start, end);
    },

    async rPop(key: string) {
      const item = store.get(key);
      return item?.value?.pop() ?? null;
    },

    async lPop(key: string) {
      const item = store.get(key);
      return item?.value?.shift() ?? null;
    },

    async lLen(key: string) {
      if (checkExpired(key)) return 0;
      const item = store.get(key);
      return item?.value?.length ?? 0;
    },

    // Set operations
    async sAdd(key: string, members: string | string[]) {
      let item = store.get(key);
      if (!item) {
        item = { value: new Set() };
        store.set(key, item);
      }
      const mems = Array.isArray(members) ? members : [members];
      let count = 0;
      for (const m of mems) {
        const sizeBefore = item.value.size;
        item.value.add(m);
        if (item.value.size > sizeBefore) count++;
      }
      return count;
    },

    async sIsMember(key: string, member: string) {
      if (checkExpired(key)) return false;
      const item = store.get(key);
      return item?.value?.has(member) ?? false;
    },

    async sMembers(key: string) {
      if (checkExpired(key)) return [];
      const item = store.get(key);
      return item?.value ? Array.from(item.value) : [];
    },

    async sRem(key: string, members: string | string[]) {
      const item = store.get(key);
      if (!item) return 0;
      const mems = Array.isArray(members) ? members : [members];
      let count = 0;
      for (const m of mems) {
        if (item.value.delete(m)) count++;
      }
      return count;
    },

    // Sorted set operations
    async zAdd(key: string, members: { score: number; value: string }[]) {
      let item = store.get(key);
      if (!item) {
        item = { value: [] };
        store.set(key, item);
      }
      members.forEach((m) => {
        const index = item.value.findIndex((v: any) => v.value === m.value);
        if (index >= 0) {
          item.value[index] = m;
        } else {
          item.value.push(m);
        }
      });
      item.value.sort((a: any, b: any) => a.score - b.score);
      return members.length;
    },

    async zRange(
      key: string,
      start: number,
      stop: number,
      options?: { REV?: boolean },
    ) {
      if (checkExpired(key)) return [];
      const item = store.get(key);
      if (!item) return [];
      const list = [...item.value];
      if (options?.REV) list.reverse();
      const end = stop === -1 ? list.length : stop + 1;
      return list.slice(start, end).map((v: any) => v.value);
    },

    async zRangeWithScores(
      key: string,
      start: number,
      stop: number,
      options?: { REV?: boolean },
    ) {
      if (checkExpired(key)) return [];
      const item = store.get(key);
      if (!item) return [];
      const list = [...item.value];
      if (options?.REV) list.reverse();
      const end = stop === -1 ? list.length : stop + 1;
      return list.slice(start, end);
    },

    async zScore(key: string, member: string) {
      if (checkExpired(key)) return null;
      const item = store.get(key);
      const found = item?.value?.find((v: any) => v.value === member);
      return found?.score ?? null;
    },

    async zIncrBy(key: string, increment: number, member: string) {
      let item = store.get(key);
      if (!item) {
        item = { value: [] };
        store.set(key, item);
      }
      const found = item.value.find((v: any) => v.value === member);
      if (found) {
        found.score += increment;
        item.value.sort((a: any, b: any) => a.score - b.score);
        return found.score;
      } else {
        item.value.push({ score: increment, value: member });
        item.value.sort((a: any, b: any) => a.score - b.score);
        return increment;
      }
    },

    async zRevRank(key: string, member: string) {
      if (checkExpired(key)) return null;
      const item = store.get(key);
      if (!item) return null;
      const sorted = [...item.value].sort(
        (a: any, b: any) => b.score - a.score,
      );
      const index = sorted.findIndex((v: any) => v.value === member);
      return index >= 0 ? index : null;
    },

    multi() {
      const commands: Array<() => Promise<any>> = [];

      const chain = {
        set: (key: string, value: string, options?: { EX?: number }) => {
          commands.push(() => client.set(key, value, options));
          return chain;
        },
        get: (key: string) => {
          commands.push(() => client.get(key));
          return chain;
        },
        incr: (key: string) => {
          commands.push(async () => {
            const val = await client.get(key);
            const newVal = (parseInt(val || '0', 10) + 1).toString();
            await client.set(key, newVal);
            return newVal;
          });
          return chain;
        },
        exec: async () => {
          const results: any[] = [];
          for (const cmd of commands) {
            results.push(await cmd());
          }
          return results;
        },
      };

      return chain;
    },
  };

  return client;
}
