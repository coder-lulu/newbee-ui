import { defineConfig } from '@vben/vite-config';

// 自行取消注释来启用按需导入功能
// import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
// import Components from 'unplugin-vue-components/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        // Components({
        //   dirs: [], // 默认会导入src/components目录下所有组件 不需要
        //   dts: './types/components.d.ts', // 输出类型文件
        //   resolvers: [
        //     AntDesignVueResolver({
        //       // 需要排除Button组件 全局已经默认导入了
        //       exclude: ['Button'],
        //       importStyle: false, // css in js
        //     }),
        //   ],
        // }),
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
            target: 'http://127.0.0.1:9200',
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
            target: 'http://127.0.0.1:9402',
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
