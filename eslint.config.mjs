// @ts-check

import { defineConfig } from '@vben/eslint-config';

export default defineConfig([
  {
    files: ['**/*.vue'],
    rules: {
      // 允许 v-model 使用参数形式（如 v-model:value），符合项目开发规范
      'vue/no-v-model-argument': 'off',
    },
  },
]);
