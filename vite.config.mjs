import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODULE_ID = 'antiquario-braganca';

function foundryStatic() {
  // `writeBundle` roda depois do Rollup escrever o bundle (e depois de qualquer
  // limpeza de emptyOutDir) — por isso os arquivos estáticos sobrevivem. Também é o
  // hook certo pra `vite build --watch`, já que `handleHotUpdate` só existe no dev
  // server (`vite`/`vite dev`), não no modo build-watch usado pelo script "dev".
  const copy = () => {
    mkdirSync('dist', { recursive: true });
    cpSync('static', 'dist', { recursive: true });
  };
  return {
    name: 'foundry-static',
    writeBundle: copy,
  };
}

export default defineConfig(({ mode }) => ({
  root: 'src',
  base: `/modules/${MODULE_ID}/`,
  publicDir: false,
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: mode === 'development' ? 'inline' : true,
    minify: mode === 'production',
    lib: {
      entry: resolve(__dirname, 'src/module.ts'),
      name: MODULE_ID,
      fileName: () => 'main.mjs',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (asset) => {
          // Lib mode sempre nomeia o CSS combinado como "style.css" internamente,
          // independente do nome do arquivo fonte — força o nome fixo que o
          // module.json declara em vez de usar [name].
          if (asset.name?.endsWith('.css')) return 'styles/module.css';
          return 'assets/[name][extname]';
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      [`^(?!/modules/${MODULE_ID}/).*`]: {
        target: 'http://localhost:30000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  plugins: [foundryStatic()],
}));
