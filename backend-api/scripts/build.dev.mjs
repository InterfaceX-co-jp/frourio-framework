import { context } from 'esbuild';
import config from './config.common.mjs';

context({
  ...config,
  define: { 'process.env.NODE_ENV': `"development"` },
}).then((ctx) => ctx.watch());
