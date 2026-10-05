import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:workflow',
      order: 2,
      title: 'Unified-IO',
    },
    name: 'UnifiedIO',
    path: '/io',
    children: [
      // 配置管理
      {
        name: 'ConfigList',
        path: '/config',
        component: () => import('#/views/io/config/list.vue'),
        meta: {
          icon: 'lucide:settings',
          title: '配置管理',
        },
      },

      // 字段映射
      {
        name: 'FieldMappingList',
        path: '/field-mapping',
        component: () => import('#/views/io/field-mapping/list.vue'),
        meta: {
          icon: 'lucide:columns',
          title: '字段映射',
        },
      },

      // 发现池
      {
        name: 'DiscoveryPoolList',
        path: '/discovery-pool',
        component: () => import('#/views/io/discovery-pool/list.vue'),
        meta: {
          icon: 'lucide:radar',
          title: '发现池',
        },
      },

      // 输入任务
      {
        name: 'InputTaskList',
        path: '/input-task',
        component: () => import('#/views/io/input-task/list.vue'),
        meta: {
          icon: 'lucide:download',
          title: '输入任务',
        },
      },

      // 输出任务
      {
        name: 'OutputTaskList',
        path: '/output-task',
        component: () => import('#/views/io/output-task/list.vue'),
        meta: {
          icon: 'lucide:upload',
          title: '输出任务',
        },
      },

      // CI变更历史
      {
        name: 'ChangeHistoryList',
        path: '/change-history',
        component: () => import('#/views/io/change-history/list.vue'),
        meta: {
          icon: 'lucide:history',
          title: 'CI变更历史',
        },
      },
      {
        name: 'ChangeHistoryDetail',
        path: '/change-history/:id',
        component: () => import('#/views/io/change-history/detail.vue'),
        meta: {
          hideInMenu: true,
          title: '变更详情',
        },
      },
      {
        name: 'ChangeHistoryTimeline',
        path: '/change-history/timeline/:ciId',
        component: () => import('#/views/io/change-history/timeline.vue'),
        meta: {
          hideInMenu: true,
          title: '变更时间线',
        },
      },

      // CI生命周期状态
      {
        name: 'LifecycleStateList',
        path: '/lifecycle-state',
        component: () => import('#/views/io/lifecycle-state/list.vue'),
        meta: {
          icon: 'lucide:git-branch',
          title: 'CI生命周期',
        },
      },
      {
        name: 'LifecycleStateDetail',
        path: '/lifecycle-state/:id',
        component: () => import('#/views/io/lifecycle-state/detail.vue'),
        meta: {
          hideInMenu: true,
          title: '生命周期详情',
        },
      },
      {
        name: 'LifecycleStateTimeline',
        path: '/lifecycle-state/timeline/:ciId',
        component: () => import('#/views/io/lifecycle-state/timeline.vue'),
        meta: {
          hideInMenu: true,
          title: '生命周期时间线',
        },
      },

      // 监控和日志
      {
        name: 'IOMonitor',
        path: '/monitor',
        component: () => import('#/views/io/monitor/index.vue'),
        meta: {
          icon: 'lucide:activity',
          title: '监控面板',
        },
      },
      {
        name: 'IOLogs',
        path: '/logs',
        component: () => import('#/views/io/logs/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: '日志查看',
        },
      },
    ],
  },
];

export default routes;
