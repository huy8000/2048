import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '',
    rolldownOptions: {
      output: {
        entryFileNames: 'app.[hash:10].js',
        chunkFileNames: 'app.[hash:10].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css.[hash:10].css';
          }
          return '[name].[hash:10].[ext]';
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
  },
});
