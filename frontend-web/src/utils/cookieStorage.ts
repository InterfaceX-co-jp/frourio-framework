import { COOKIE_STORAGE_PREFIX } from '@/config/app'
import Cookies from 'js-cookie'

type CookieStorageKey = `${typeof COOKIE_STORAGE_PREFIX}${string}`

const defineStorage = <T>(args: { get: () => T; set: (arg: T) => void; remove: () => void }) => args

export const ADMIN_COOKIE_AUTH_STATE_KEY: CookieStorageKey = `${COOKIE_STORAGE_PREFIX}admin_AuthState`
export const USER_COOKIE_AUTH_STATE_KEY: CookieStorageKey = `${COOKIE_STORAGE_PREFIX}user_AuthState`

export const adminAuthStateInCookieStorage = defineStorage<{ token: string }>({
  get: () => ({ token: Cookies.get(ADMIN_COOKIE_AUTH_STATE_KEY) ?? '' }),
  set: (args) => Cookies.set(ADMIN_COOKIE_AUTH_STATE_KEY, args.token),
  remove: () => Cookies.remove(ADMIN_COOKIE_AUTH_STATE_KEY),
})

export const userAuthStateInCookieStorage = defineStorage<{ token: string }>({
  get: () => ({ token: Cookies.get(USER_COOKIE_AUTH_STATE_KEY) ?? '' }),
  set: (args) => Cookies.set(USER_COOKIE_AUTH_STATE_KEY, args.token),
  remove: () => Cookies.remove(USER_COOKIE_AUTH_STATE_KEY),
})
