import { build } from 'esbuild';
import config from './config.common.mjs';
// const { sentryEsbuildPlugin } = require('@sentry/esbuild-plugin');

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
    //   project: process.env.SENTRY_PROJECT_NAME,
    // }),
  ],
}).catch(() => process.exit(1));
