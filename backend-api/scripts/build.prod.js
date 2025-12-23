import { build } from 'esbuild';
import config from './config.common.js';

build({
  ...config,
  minify: true,
  sourcemap: true,
  define: { 'process.env.NODE_ENV': `"production"` },
  loader: {
    // ensures .node binaries are copied to ./dist
    '.node': 'copy',
  },
  plugins: [
    // sentryEsbuildPlugin({
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    //   org: 'interfacex',
    //   project: 'PROJECT NAME',
    // }),
  ],
}).catch(() => process.exit(1));
