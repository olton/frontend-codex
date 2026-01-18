import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import legacy from '@vitejs/plugin-legacy';
import { loadEnv } from 'vite';
import { URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import checker from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const isDev = mode === 'development';

  return {
    experimental: {
      renderBuiltUrl(filename: string, { hostType }) {
        if (hostType === 'js') {
          return {
            runtime: `window.__resolveAssetUrl(${JSON.stringify(filename)})`,
          };
        }
        return { relative: false };
      },
    },
    // Оптимізації для dev режиму
    optimizeDeps: {
      include: ['vue'], // Додайте інші часто використовувані залежності
    },
    server:
      isDev ?
        {
          warmup: {
            clientFiles: ['./src/**/*.vue', './src/**/*.ts'],
          },
        }
      : undefined,
    build: {
      assetsInlineLimit: 0,
      outDir: process.env.VITE_OUT_DIR,
      cssMinify: !isDev,
      minify: !isDev,
      target: isDev ? 'esnext' : 'es5',
      // Відключити source maps в dev для швидкості (або 'cheap-module-source-map')
      sourcemap: isDev ? false : false,
      rollupOptions: {
        input: {
          index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          manualChunks:
            isDev ? undefined : (
              (id) => {
                if (!id.includes('node_modules')) {
                  return undefined;
                }
                const parts = id.split('node_modules/');
                if (parts.length < 2) {
                  return undefined;
                }
                const name = parts[1].split('/')[0].replace(/@/g, '');
                return `vendor-${name}`;
              }
            ),
        },
        external: (id) => {
          return id.includes('${payment.templateName}');
        },
      },
    },
    plugins: [
      // Відключити type checking в dev для швидкості
      isDev ? undefined : (
        checker({
          vueTsc: true,
        })
      ),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['apple-pay-button'].includes(tag),
          },
        },
      }),
      svgLoader(),
      tailwindcss(),
      !isDev ? legacy() : undefined,
    ].filter(Boolean),
    css: {
      postcss: {
        plugins: [autoprefixer],
      },
      // Використовувати lightningcss в dev
      devSourcemap: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Відключити pre-bundling для швидшого старту
    cacheDir: 'node_modules/.vite',
  };
});
