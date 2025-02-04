import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/tts': {
        target: 'http://localhost:9966',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/tts/, '')  // 如果需要重写路径，取消注释此行
      }
    }
  }
})
