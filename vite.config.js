import { defineConfig } from 'vite';

const outputOptions = {
  entryFileNames: 'app.[hash:10].js',
  chunkFileNames: 'app.[hash:10].js',
  assetFileNames: (assetInfo) => {
    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
      return 'css.[hash:10].css';
    }
    return '[name].[hash:10].[ext]';
  },
};

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '',
    rolldownOptions: {
      output: outputOptions,
    },
    rollupOptions: {
      output: outputOptions,
    },
  },
  test: {
    environment: 'happy-dom',
  },
});
