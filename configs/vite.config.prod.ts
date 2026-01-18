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
  const isProduction = mode === 'production';

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
    build: {
      assetsInlineLimit: 0,
      outDir: process.env.VITE_OUT_DIR,
      cssMinify: isProduction ? 'lightningcss' : false, // Швидша мініфікація CSS
      minify: isProduction ? 'terser' : false,
      // Оптимізації для production
      sourcemap: !isProduction, // Вимкнути sourcemap для production
      reportCompressedSize: false, // Прискорити збірку
      chunkSizeWarningLimit: 1000,
      terserOptions:
        isProduction ?
          {
            compress: {
              drop_console: true, // Видалити console.log
              drop_debugger: true, // Видалити debugger
              pure_funcs: ['console.log', 'console.info', 'console.debug'], // Видалити специфічні функції
            },
            format: {
              comments: false, // Видалити коментарі
            },
          }
        : undefined,
      rollupOptions: {
        input: {
          index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          manualChunks: (id) => {
            if (!id.includes('node_modules')) {
              return undefined;
            }
            const parts = id.split('node_modules/');
            if (parts.length < 2) {
              return undefined;
            }
            const name = parts[1].split('/')[0].replace(/@/g, '');
            return `vendor-${name}`;
          },
        },
        external: (id) => {
          return id.includes('${payment.templateName}');
        },
        // Оптимізація tree-shaking потрібно вивчити, якщо вмикати перестає працювати перемикання мови
        treeshake: false,
      },
    },
    plugins: [
      checker({
        vueTsc: false,
        overlay: false,
      }),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['apple-pay-button'].includes(tag),
          },
        },
        script: {
          defineModel: true,
          propsDestructure: true, // Експериментальна оптимізація
        },
      }),
      svgLoader({
        svgo: true, // SVGO оптимізація тільки для production
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
          ],
        },
      }),
      tailwindcss(),
      legacy({
        targets: [
          'Firefox > 52',
          'Chrome > 55',
          'Safari > 10',
          'Edge > 15',
          'not IE 11',
          'defaults',
        ],
        modernPolyfills: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: [],
        },
      },
      postcss: {
        plugins: [autoprefixer],
      },
      devSourcemap: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@Click2Pay': fileURLToPath(new URL('./src/modules/Click2Pay', import.meta.url)),
      },
    },
    // Оптимізація dependency pre-bundling
    optimizeDeps: {
      include: ['vue', 'vue-i18n', 'pinia', 'axios'], // Pre-bundle основні залежності
      exclude: [], // Виключити якщо потрібно
    },
    // Покращити performance
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none',
    },
  };
});
