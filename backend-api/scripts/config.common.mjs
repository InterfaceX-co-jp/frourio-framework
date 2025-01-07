import { nodeExternalsPlugin } from 'esbuild-node-externals';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default {
  entryPoints: [path.resolve(dirname, '../entrypoints/index.ts')],
  outdir: path.resolve(dirname, '../'),
  platform: 'node',
  target: 'node22',
  format: 'esm',
  banner: {
    // commonjs用ライブラリをESMプロジェクトでbundleする際に生じることのある問題への対策
    js: 'import { createRequire } from "module"; import url from "url"; const require = createRequire(import.meta.url); const __filename = url.fileURLToPath(import.meta.url); const __dirname = url.fileURLToPath(new URL(".", import.meta.url));',
  },
  bundle: true,
  plugins: [nodeExternalsPlugin()],
  logLevel: 'info',
};
