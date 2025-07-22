import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:terminal',
      order: 1000,
      title: $t('page.terminal.title'),
    },
    name: 'Terminal',
    path: '/terminal',
    children: [
      {
        name: 'TerminalDemo',
        path: '/terminal/demo',
        component: () => import('#/views/demos/terminal/index.vue'),
        meta: {
          title: $t('page.terminal.demo'),
        },
      },
    ],
  },
];

export default routes;
