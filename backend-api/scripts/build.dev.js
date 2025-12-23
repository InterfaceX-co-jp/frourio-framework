import { context } from 'esbuild';
import config from './config.common.js';

context({
  ...config,
  define: { 'process.env.NODE_ENV': `"development"` },
  sourcemap: true,
}).then((ctx) => ctx.watch());
