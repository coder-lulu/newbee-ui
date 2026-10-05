import { defineConfig } from '@vben/vite-config';

// 启用按需导入 Ant Design Vue 组件，自动解析 a-* 标签（a-modal、a-timeline 等）
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        Components({
          dirs: [], // 不扫描本地组件目录，仅做库组件解析
          dts: './types/components.d.ts', // 生成自动导入的类型提示
          resolvers: [
            AntDesignVueResolver({
              // 可按需排除已全局引入的组件
              exclude: ['Button'],
              importStyle: false, // 使用 css-in-js（VBen 默认样式策略）
            }),
          ],
        }),
      ],
      server: {
        proxy: {
          '/io-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/io-api/, ''),
            target: 'http://127.0.0.1:9501',
            ws: true,
          },
          '/cmdb-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/cmdb-api/, ''),
            target: 'http://127.0.0.1:9207',
            ws: true,
          },
          '/fms-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/fms-api/, ''),
            target: 'http://127.0.0.1:9102',
            ws: true,
          },
          '/ipam-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ipam-api/, ''),
            target: 'http://127.0.0.1:9302',
            ws: true,
          },
          '/mms-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/mms-api/, ''),
            target: 'http://127.0.0.1:9104',
            ws: true,
          },
          '/ops-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ops-api/, ''),
            target: 'http://127.0.0.1:9601',
            ws: true,
          },
          '/ops-center-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ops-center-api/, ''),
            target: 'http://127.0.0.1:9601',
            ws: true,
          },
          '/sys-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/sys-api/, ''),
            target: 'http://127.0.0.1:9101',
            ws: true,
          },
        },
      },
    },
  };
});
