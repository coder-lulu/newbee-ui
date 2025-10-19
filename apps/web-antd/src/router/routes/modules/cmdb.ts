import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:database',
      order: 1,
      title: 'CMDB',
    },
    name: 'CMDB',
    path: '/cmdb',
    children: [
      {
        name: 'CisManagement',
        path: '/cis',
        component: () => import('#/views/cmdb/cis/index.vue'),
        meta: {
          icon: 'lucide:server',
          title: 'CI实例管理',
        },
      },
      {
        name: 'CiRelationManagement',
        path: '/ci-relation-management',
        component: () => import('#/views/cmdb/cis/ci-relation-management.vue'),
        meta: {
          icon: 'lucide:git-fork',
          title: 'CI关系管理',
        },
      },
      {
        name: 'CiRelationGraph',
        path: '/ci-relation-graph',
        component: () => import('#/views/cmdb/cis/ci-relation-graph.vue'),
        meta: {
          icon: 'lucide:network',
          title: 'CI关系图',
        },
      },
      {
        name: 'CiRelationTest',
        path: '/ci-relation-test',
        component: () => import('#/views/cmdb/cis/ci-relation-test.vue'),
        meta: {
          icon: 'lucide:test-tube',
          title: 'CI关系图测试',
        },
      },
      {
        name: 'CiRelationFormTest',
        path: '/ci-relation-form-test',
        component: () => import('#/views/cmdb/cis/ci-relation-form-test.vue'),
        meta: {
          icon: 'lucide:form-input',
          title: 'CI关系表单测试',
        },
      },
      {
        name: 'CiRelationConstraints',
        path: '/ci-relation-constraints',
        component: () => import('#/views/cmdb/cis/ci-relation-constraints.vue'),
        meta: {
          icon: 'lucide:shield-check',
          title: 'CI关系约束',
        },
      },
      {
        name: 'CiRelationBatch',
        path: '/ci-relation-batch',
        component: () => import('#/views/cmdb/cis/ci-relation-batch.vue'),
        meta: {
          icon: 'lucide:layers-3',
          title: 'CI关系批量操作',
        },
      },
      {
        name: 'CiTypes',
        path: '/ci-types',
        component: () => import('#/views/cmdb/ci_types/index.vue'),
        meta: {
          icon: 'lucide:layers',
          title: 'CI类型管理',
        },
      },
    ],
  },
];

export default routes;