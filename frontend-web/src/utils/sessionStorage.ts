import { SESSION_STORAGE_PREFIX } from '@/config/app'

type SessionStorageKey = `${typeof SESSION_STORAGE_PREFIX}${string}`

const getItem = (args: { key: SessionStorageKey }) => sessionStorage.getItem(args.key)
const setItem = (args: { key: SessionStorageKey; value: string }) => sessionStorage.setItem(args.key, args.value)
const removeItem = (args: { key: SessionStorageKey }) => sessionStorage.removeItem(args.key)

const defineStorage = <T>(args: { get: () => T; set: (arg: T) => void; remove: () => void }) => args

const ADMIN_AUTH_STATE_KEY: SessionStorageKey = `${SESSION_STORAGE_PREFIX}admin_AuthState`
const USER_COOKIE_AUTH_STATE_KEY: SessionStorageKey = `${SESSION_STORAGE_PREFIX}user_AuthState`

export const adminAuthStateInSessionStorage = defineStorage<{ token: string }>({
  get: () => {
    const item = getItem({ key: ADMIN_AUTH_STATE_KEY })

    return item !== null ? (JSON.parse(item) as { token: string }) : { token: '' }
  },
  set: (value) => setItem({ key: ADMIN_AUTH_STATE_KEY, value: JSON.stringify(value) }),
  remove: () => removeItem({ key: ADMIN_AUTH_STATE_KEY }),
})

export const userAuthStateInSessionStorage = defineStorage<{ token: string }>({
  get: () => {
    const item = getItem({ key: USER_COOKIE_AUTH_STATE_KEY })

    return item !== null ? (JSON.parse(item) as { token: string }) : { token: '' }
  },
  set: (value) => setItem({ key: USER_COOKIE_AUTH_STATE_KEY, value: JSON.stringify(value) }),
  remove: () => removeItem({ key: USER_COOKIE_AUTH_STATE_KEY }),
})
