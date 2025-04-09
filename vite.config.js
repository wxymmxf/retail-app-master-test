// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'path';

export default ({ command, mode }) => {
  // mode: 区分生产环境还是开发环境, path.resolve(__dirname, ''), path.resolve(process.cwd())
  console.log('command, mode -> ', command, mode, path.resolve(__dirname, ''))
  const env = loadEnv(mode, path.resolve(__dirname, 'env'))
  const {
    VITE_SERVER_BASEURL,
    VITE_DELETE_CONSOLE,
    VITE_SHOW_SOURCEMAP,
    VITE_APP_PROXY,
    VITE_APP_PROXY_PREFIX,
  } = env
  console.log('环境变量 env -> ', env)
  return defineConfig({
    envDir: './env', // 自定义env目录
    plugins: [
      uni(), // 集成 UniApp 插件
    ],
    server: {
      // 仅 H5 端生效，其他端不生效（其他端走build，不走devServer)
      proxy: {
        // 代理规则示例：将以 /api 开头的请求转发到目标服务器
        [VITE_APP_PROXY_PREFIX]: {
          // target: 'http://retail-gateway-api-dev.192.168.2.39.nip.io', // 目标服务器地址
          target: VITE_SERVER_BASEURL, // 目标服务器地址
          changeOrigin: true, // 允许跨域
          rewrite: (path) => path.replace(new RegExp(`^${VITE_APP_PROXY_PREFIX}`), ''),
        }
      }
    },
    build: {
      // 方便非h5端调试
      sourcemap: VITE_SHOW_SOURCEMAP === 'true', // 默认是false
      target: 'es6',
      // 开发环境不用压缩
      minify: mode === 'development' ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: VITE_DELETE_CONSOLE === 'true',
          drop_debugger: true,
        },
      },
    },
  })
}
