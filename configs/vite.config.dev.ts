import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import checker from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';
import dotenv from 'dotenv';

const env = dotenv.config();
// Вимикати перевірку типів в дев середовищі лише за критичні потреби
const TYPE_CHECKING = env?.parsed?.SKIP_TYPE_CHECKING !== 'true';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

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
      cssMinify: false,
      minify: false,
      sourcemap: true,
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
        treeshake: false, // Вимкнено для швидкості
      },
    },
    plugins: [
      checker({
        vueTsc: TYPE_CHECKING ?? true,
        overlay: true,
      }),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['apple-pay-button'].includes(tag),
          },
        },
        script: {
          defineModel: true,
          propsDestructure: true,
        },
      }),
      svgLoader({
        svgo: false, // Вимкнена оптимізація для швидкості
      }),
      tailwindcss(),
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
      devSourcemap: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@Click2Pay': fileURLToPath(new URL('./src/modules/Click2Pay', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-i18n', 'pinia', 'axios'],
    },
    esbuild: {
      legalComments: 'none',
    },
  };
});
