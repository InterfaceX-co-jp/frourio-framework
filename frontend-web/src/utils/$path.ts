export const pagesPath = {
  'admin': {
    'auth': {
      'login': {
        $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/admin/auth/login' as const, hash: url?.hash })
      }
    },
    $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/admin' as const, hash: url?.hash })
  },
  $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/' as const, hash: url?.hash })
};

export type PagesPath = typeof pagesPath;

export const staticPath = {
  favicon_ico: '/favicon.ico'
} as const;

export type StaticPath = typeof staticPath;
