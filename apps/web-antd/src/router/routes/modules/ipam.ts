import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:network',
      order: 1000,
      title: 'IPAM管理',
    },
    name: 'IPAM',
    path: '/ipam',
    children: [
      {
        name: 'IPAMDashboard',
        path: '/ipam/dashboard',
        component: () => import('#/views/ipam/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:layout-dashboard',
          title: 'IPAM概览',
        },
      },
      {
        name: 'IPAMDomain',
        path: '/ipam/domain',
        component: () => import('#/views/ipam/domain/index.vue'),
        meta: {
          icon: 'lucide:globe',
          title: '网域管理',
        },
      },
      {
        name: 'IPAMSubnet',
        path: '/ipam/subnet',
        component: () => import('#/views/ipam/subnet/index.vue'),
        meta: {
          icon: 'lucide:network',
          title: '网段管理',
        },
      },
      {
        name: 'IPAMAddress',
        path: '/ipam/ip',
        component: () => import('#/views/ipam/ip/index.vue'),
        meta: {
          icon: 'lucide:map-pin',
          title: 'IP地址管理',
        },
      },
      {
        name: 'IPAMVLAN',
        path: '/ipam/vlan',
        component: () => import('#/views/ipam/vlan/index.vue'),
        meta: {
          icon: 'lucide:layers',
          title: 'VLAN管理',
        },
      },
      {
        name: 'IPAMRecord',
        path: '/ipam/record',
        component: () => import('#/views/ipam/record/index.vue'),
        meta: {
          icon: 'lucide:history',
          title: '操作记录',
        },
      },
    ],
  },
];

export default routes;
