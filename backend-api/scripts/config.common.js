import { nodeExternalsPlugin } from 'esbuild-node-externals';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  entryPoints: [
    path.resolve(__dirname, '../entrypoints/index.ts'),
    // path.resolve(__dirname, '../service/sentryInit.ts'),
  ],
  outdir: path.resolve(__dirname, '../'),
  platform: 'node',
  target: 'node22',
  format: 'esm',
  banner: {
    // commonjs用ライブラリをESMプロジェクトでbundleする際に生じることのある問題への対策
    js: [
      `import { createRequire } from "module";`,
      `import url from "url";`,
      `const require = createRequire(import.meta.url);`,
      `const __filename = url.fileURLToPath(import.meta.url);`,
      `const __dirname = url.fileURLToPath(new URL(".", import.meta.url));`,
    ].join('\n'),
  },
  bundle: true,
  plugins: [nodeExternalsPlugin()],
  logLevel: 'info',
};

export default config;
