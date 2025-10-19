import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

import { Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

// Import API functions for real data
import { userList } from '#/api/system/user';
import { roleList } from '#/api/system/role';
import { deptList } from '#/api/system/dept';
import { getCiTypeList } from '#/api/cmdb/ciType';
import { getCisList } from '#/api/cmdb/cis';

// 查询表单Schema - 与后端API保持一致
export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'permissionId',
    label: '权限ID',
    componentProps: {
      placeholder: '请输入权限ID',
    },
  },
  {
    component: 'Input',
    fieldName: 'subjectName',
    label: '权限主体',
    componentProps: {
      placeholder: '请输入主体名称',
    },
  },
  {
    component: 'Select',
    fieldName: 'subjectType',
    label: '主体类型',
    componentProps: {
      placeholder: '请选择主体类型',
      getPopupContainer,
      options: [
        { label: '用户', value: 'user' },
        { label: '角色', value: 'role' },
        { label: '部门', value: 'department' },
        { label: '用户组', value: 'group' },
        { label: '系统', value: 'system' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'permissionLevel',
    label: '权限级别',
    componentProps: {
      placeholder: '请选择权限级别',
      getPopupContainer,
      options: [
        { label: '无权限', value: 'none' },
        { label: '只读', value: 'read' },
        { label: '读写', value: 'write' },
        { label: '管理员', value: 'admin' },
        { label: '超级管理员', value: 'super_admin' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'scopeType',
    label: '权限范围',
    componentProps: {
      placeholder: '请选择权限范围',
      getPopupContainer,
      options: [
        { label: '全局权限', value: 'global' },
        { label: 'CI类型权限', value: 'ci_type' },
        { label: 'CI实例权限', value: 'ci_instance' },
        { label: '属性权限', value: 'attribute' },
        { label: '字段权限', value: 'field' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'permissionType',
    label: '权限类型',
    componentProps: {
      placeholder: '请选择权限类型',
      getPopupContainer,
      options: [
        { label: '允许', value: 'allow' },
        { label: '拒绝', value: 'deny' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'riskLevel',
    label: '风险等级',
    componentProps: {
      placeholder: '请选择风险等级',
      getPopupContainer,
      options: [
        { label: '低风险', value: 'low' },
        { label: '中风险', value: 'medium' },
        { label: '高风险', value: 'high' },
        { label: '极高风险', value: 'critical' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'status',
    label: '状态',
    componentProps: {
      placeholder: '请选择状态',
      getPopupContainer,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
        { label: '暂停', value: 2 },
        { label: '撤销', value: 3 },
        { label: '过期', value: 4 },
      ],
    },
  },
];

// 表格列配置 - 增强功能显示
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '权限ID',
    field: 'permissionId',
    width: 180,
  },
  {
    title: '权限主体',
    field: 'subjectName',
    width: 120,
  },
  {
    title: '主体类型',
    field: 'subjectType',
    width: 100,
    slots: {
      default: ({ row }) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          user: { color: 'blue', text: '用户' },
          role: { color: 'green', text: '角色' },
          department: { color: 'orange', text: '部门' },
          group: { color: 'purple', text: '用户组' },
          system: { color: 'red', text: '系统' },
        };
        const config = typeMap[row.subjectType] || {
          color: 'default',
          text: row.subjectType,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  },
  {
    title: '权限类型',
    field: 'permissionType',
    width: 100,
    slots: {
      default: ({ row }) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          allow: { color: 'green', text: '允许' },
          deny: { color: 'red', text: '拒绝' },
        };
        const config = typeMap[row.permissionType] || {
          color: 'default',
          text: row.permissionType,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  },
  {
    title: '权限级别',
    field: 'permissionLevel',
    width: 120,
    slots: {
      default: ({ row }) => {
        const levelMap: Record<string, { color: string; text: string }> = {
          none: { color: 'default', text: '无权限' },
          read: { color: 'blue', text: '只读' },
          write: { color: 'green', text: '读写' },
          admin: { color: 'orange', text: '管理员' },
          super_admin: { color: 'red', text: '超级管理员' },
        };
        const config = levelMap[row.permissionLevel] || {
          color: 'default',
          text: row.permissionLevel,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  },
  {
    title: '权限范围',
    field: 'scopeType',
    width: 140,
    slots: {
      default: ({ row }) => {
        const scopeMap: Record<string, { color: string; text: string }> = {
          global: { color: 'red', text: '全局权限' },
          ci_type: { color: 'blue', text: 'CI类型权限' },
          ci_instance: { color: 'green', text: 'CI实例权限' },
          attribute: { color: 'orange', text: '属性权限' },
          field: { color: 'purple', text: '字段权限' },
        };
        const config = scopeMap[row.scopeType] || {
          color: 'default',
          text: row.scopeType,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  },
  {
    title: '优先级',
    field: 'priority',
    width: 80,
    slots: {
      default: ({ row }) => {
        const priority = row.priority || 0;
        const color = priority >= 5 ? 'red' : priority >= 3 ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
  },
  {
    title: '风险等级',
    field: 'riskLevel',
    width: 100,
    slots: {
      default: ({ row }) => {
        const riskMap: Record<string, { color: string; text: string }> = {
          low: { color: 'green', text: '低风险' },
          medium: { color: 'orange', text: '中风险' },
          high: { color: 'red', text: '高风险' },
          critical: { color: 'magenta', text: '极高风险' },
        };
        const config = riskMap[row.riskLevel] || {
          color: 'default',
          text: row.riskLevel,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  },
  {
    title: '状态',
    field: 'status',
    width: 80,
    slots: {
      default: ({ row }) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          1: { color: 'green', text: '启用' },
          0: { color: 'red', text: '禁用' },
          2: { color: 'orange', text: '暂停' },
          3: { color: 'volcano', text: '撤销' },
          4: { color: 'default', text: '过期' },
        };
        const config = statusMap[row.status] || {
          color: 'default',
          text: String(row.status),
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  },
  {
    title: '描述',
    field: 'description',
    width: 200,
    showOverflow: 'tooltip',
  },
  {
    title: '创建时间',
    field: 'createdAt',
    width: 160,
    formatter: ({ cellValue }) => {
      return cellValue
        ? dayjs(cellValue * 1000).format('YYYY-MM-DD HH:mm')
        : '';
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];

// 编辑表单Schema - 与后端API字段完全对应
export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: 'ID',
  },
  {
    component: 'Input',
    fieldName: 'permissionId',
    label: '权限ID',
    help: '权限的唯一标识符。建议使用语义化命名：perm_[主体类型]_[权限级别]_[序号]，如 perm_user_read_001',
    componentProps: {
      placeholder: '留空自动生成，或手动输入如: perm_user_read_001',
    },
  },
  {
    component: 'Select',
    fieldName: 'status',
    label: '状态',
    rules: 'required',
    defaultValue: 1,
    help: '权限生效状态：启用=立即生效，禁用=暂时停用，暂停=临时冻结，撤销=永久取消，过期=时间到期失效',
    componentProps: {
      placeholder: '请选择权限状态',
      getPopupContainer,
      options: [
        { label: '启用 - 立即生效', value: 1 },
        { label: '禁用 - 暂时停用', value: 0 },
        { label: '暂停 - 临时冻结', value: 2 },
        { label: '撤销 - 永久取消', value: 3 },
        { label: '过期 - 时间到期失效', value: 4 },
      ],
    },
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    label: '描述',
    formItemClass: 'col-span-2',
    help: '权限用途和适用场景的详细说明，便于管理员理解和维护',
    componentProps: {
      placeholder: '例如：为开发团队提供生产环境只读权限，用于问题排查和监控',
      rows: 3,
    },
  },

  // 权限主体信息
  {
    component: 'Select',
    fieldName: 'subjectType',
    label: '主体类型',
    rules: 'required',
    help: '权限授予对象类型：用户=个人账号，角色=职能角色，部门=组织架构，用户组=临时团队，系统=应用程序',
    componentProps: {
      placeholder: '请选择要授权的对象类型',
      getPopupContainer,
      options: [
        { label: '用户 - 个人账号权限', value: 'user' },
        { label: '角色 - 职能角色权限', value: 'role' },
        { label: '部门 - 组织架构权限', value: 'department' },
        { label: '用户组 - 临时团队权限', value: 'group' },
        { label: '系统 - 应用程序权限', value: 'system' },
      ],
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'subjectName',
    label: '选择用户',
    rules: 'required',
    help: '选择要授权的具体用户账号，建议按最小权限原则分配',
    dependencies: {
      show: (values) => values.subjectType === 'user',
      triggerFields: ['subjectType'],
      resetValue: (values, oldValues) => {
        // 当主体类型切换时清空当前值
        if (values.subjectType !== oldValues.subjectType) {
          return undefined;
        }
      },
    },
    componentProps: {
      placeholder: '搜索并选择用户',
      getPopupContainer,
      showSearch: true,
      api: async () => {
        try {
          const result = await userList({ page: 1, pageSize: 1000 });
          return result.data.map((user: any) => ({
            label: `${user.username} (${user.nickname || user.username})`,
            value: user.username,
          }));
        } catch (error) {
          console.error('Failed to load users:', error);
          return [];
        }
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'subjectName',
    label: '选择角色',
    rules: 'required',
    help: '角色是一组权限的集合，用户通过角色继承相应权限，便于批量管理',
    dependencies: {
      show: (values) => values.subjectType === 'role',
      triggerFields: ['subjectType'],
      resetValue: (values, oldValues) => {
        // 当主体类型切换时清空当前值
        if (values.subjectType !== oldValues.subjectType) {
          return undefined;
        }
      },
    },
    componentProps: {
      placeholder: '选择职能角色',
      getPopupContainer,
      api: async () => {
        try {
          const result = await roleList({ page: 1, pageSize: 1000 });
          return result.data.map((role: any) => ({
            label: `${role.code} - ${role.name}`,
            value: role.code,
          }));
        } catch (error) {
          console.error('Failed to load roles:', error);
          return [];
        }
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'subjectName',
    label: '选择部门',
    rules: 'required',
    dependencies: {
      show: (values) => values.subjectType === 'department',
      triggerFields: ['subjectType'],
      resetValue: (values, oldValues) => {
        // 当主体类型切换时清空当前值
        if (values.subjectType !== oldValues.subjectType) {
          return undefined;
        }
      },
    },
    componentProps: {
      placeholder: '请选择部门',
      getPopupContainer,
      api: async () => {
        try {
          const result = await deptList({ page: 1, pageSize: 1000 });
          return result.data.map((dept: any) => ({
            label: dept.name,
            value: dept.name,
          }));
        } catch (error) {
          console.error('Failed to load departments:', error);
          return [];
        }
      },
    },
  },
  {
    component: 'Select',
    fieldName: 'subjectName',
    label: '选择用户组',
    rules: 'required',
    dependencies: {
      show: (values) => values.subjectType === 'group',
      triggerFields: ['subjectType'],
      resetValue: (values, oldValues) => {
        // 当主体类型切换时清空当前值
        if (values.subjectType !== oldValues.subjectType) {
          return undefined;
        }
      },
    },
    componentProps: {
      placeholder: '请选择用户组',
      getPopupContainer,
      // TODO: Replace with real API when user group API is available
      options: [
        { label: '高级开发组', value: '高级开发组' },
        { label: '运维监控组', value: '运维监控组' },
        { label: '安全审计组', value: '安全审计组' },
        { label: '数据分析组', value: '数据分析组' },
      ],
    },
  },
  {
    component: 'Input',
    fieldName: 'subjectName',
    label: '系统名称',
    rules: 'required',
    dependencies: {
      show: (values) => values.subjectType === 'system',
      triggerFields: ['subjectType'],
      resetValue: (values, oldValues) => {
        // 当主体类型切换时清空当前值
        if (values.subjectType !== oldValues.subjectType) {
          return undefined;
        }
      },
    },
    componentProps: {
      placeholder: '请输入系统名称，如: CMDB系统',
    },
  },

  // 权限类型和级别
  {
    component: 'Select',
    fieldName: 'permissionType',
    label: '权限类型',
    rules: 'required',
    defaultValue: 'allow',
    help: '权限控制方式：允许=授予访问权限，拒绝=明确禁止访问（拒绝优先级更高）',
    componentProps: {
      placeholder: '选择权限控制方式',
      getPopupContainer,
      options: [
        { label: '允许 - 授予访问权限', value: 'allow' },
        { label: '拒绝 - 明确禁止访问', value: 'deny' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'permissionLevel',
    label: '权限级别',
    rules: 'required',
    help: '权限等级由低到高：无权限<只读<读写<管理员<超级管理员。建议遵循最小权限原则',
    componentProps: {
      placeholder: '选择权限等级',
      getPopupContainer,
      options: [
        { label: '无权限 - 无任何访问权限', value: 'none' },
        { label: '只读 - 仅查看不可修改', value: 'read' },
        { label: '读写 - 可查看和修改', value: 'write' },
        { label: '管理员 - 完整管理权限', value: 'admin' },
        { label: '超级管理员 - 所有权限', value: 'super_admin' },
      ],
    },
  },

  // 权限范围配置
  {
    component: 'Select',
    fieldName: 'scopeType',
    label: '权限范围',
    rules: 'required',
    help: '权限作用范围：全局=所有资源，CI类型=某类资源，CI实例=特定资源，属性=资源属性，字段=特定字段',
    componentProps: {
      placeholder: '选择权限作用范围',
      getPopupContainer,
      options: [
        { label: '全局权限 - 作用于所有资源', value: 'global' },
        { label: 'CI类型权限 - 作用于某类资源', value: 'ci_type' },
        { label: 'CI实例权限 - 作用于特定资源', value: 'ci_instance' },
        { label: '属性权限 - 作用于资源属性', value: 'attribute' },
        { label: '字段权限 - 作用于特定字段', value: 'field' },
      ],
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'ciTypeId',
    label: '选择CI类型',
    help: 'CI类型定义了资源的分类，权限将作用于该类型下的所有资源实例',
    dependencies: {
      show: (values) => ['ci_instance', 'ci_type'].includes(values.scopeType),
      triggerFields: ['scopeType'],
    },
    componentProps: {
      placeholder: '选择要管理的CI资源类型',
      getPopupContainer,
      showSearch: true,
      api: async () => {
        try {
          const result = await getCiTypeList({ page: 1, pageSize: 1000 });
          return result.data.map((ciType: any) => ({
            label: `${ciType.name} - ${ciType.description || ciType.name}`,
            value: ciType.id,
          }));
        } catch (error) {
          console.error('Failed to load CI types:', error);
          return [];
        }
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'ciId',
    label: '选择CI实例',
    help: '选择具体的CI资源实例，权限将精确作用于该实例，实现细粒度权限控制',
    dependencies: {
      show: (values) => values.scopeType === 'ci_instance' && values.ciTypeId,
      triggerFields: ['scopeType', 'ciTypeId'],
      resetValue: (values, oldValues) => {
        // 当范围类型切换或CI类型变化时清空当前值
        if (values.scopeType !== oldValues.scopeType || values.ciTypeId !== oldValues.ciTypeId) {
          return undefined;
        }
      },
    },
    componentProps: (model) => {
      return {
        placeholder: '选择具体的CI资源实例',
        getPopupContainer,
        showSearch: true,
        api: async () => {
          try {
            if (!model?.ciTypeId) {
              return [];
            }
            const result = await getCisList({ 
              page: 1, 
              pageSize: 1000,
              typeId: model.ciTypeId
            });
            return result.data.data.map((ci: any) => ({
              label: `CI-${ci.id} (类型ID: ${ci.typeId})`,
              value: ci.id,
            }));
          } catch (error) {
            console.error('Failed to load CI instances:', error);
            return [];
          }
        },
        params: {
          typeId: model?.ciTypeId,
        },
      };
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'attributeId',
    label: '属性ID',
    dependencies: {
      show: (values) => values.scopeType === 'attribute',
      triggerFields: ['scopeType'],
    },
    componentProps: {
      placeholder: '请输入属性ID',
      min: 1,
    },
  },
  {
    component: 'Input',
    fieldName: 'fieldName',
    label: '字段名称',
    dependencies: {
      show: (values) => values.scopeType === 'field',
      triggerFields: ['scopeType'],
    },
    componentProps: {
      placeholder: '请输入字段名称',
    },
  },

  // 时间设置
  {
    component: 'DatePicker',
    fieldName: 'effectiveFrom',
    label: '生效时间',
    componentProps: {
      placeholder: '请选择生效时间',
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      getPopupContainer,
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'effectiveTo',
    label: '失效时间',
    componentProps: {
      placeholder: '请选择失效时间',
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      getPopupContainer,
    },
  },
  {
    component: 'Switch',
    fieldName: 'isTemporary',
    label: '临时权限',
    defaultValue: false,
    componentProps: {
      style: { width: 'auto' },
    },
  },

  // 权限继承设置
  {
    component: 'Switch',
    fieldName: 'inheritable',
    label: '可继承',
    defaultValue: false,
    componentProps: {
      style: { width: 'auto' },
    },
  },
  {
    component: 'Input',
    fieldName: 'parentPermissionId',
    label: '父权限ID',
    dependencies: {
      show: (values) => values.inheritable,
      triggerFields: ['inheritable'],
    },
    componentProps: {
      placeholder: '请输入父权限ID，如: perm_parent_001',
    },
  },

  // 授权和状态信息
  {
    component: 'Textarea',
    fieldName: 'grantReason',
    label: '授权原因',
    formItemClass: 'col-span-2',
    help: '说明授予此权限的业务原因和必要性，便于后续审计和管理',
    componentProps: {
      placeholder: '例如：因业务需要，临时授权用户访问生产环境进行故障排查',
      rows: 2,
    },
  },
  {
    component: 'Input',
    fieldName: 'statusReason',
    label: '状态变更原因',
    formItemClass: 'col-span-2',
    help: '记录权限状态变更的原因，如禁用、撤销等操作的说明',
    componentProps: {
      placeholder: '例如：项目结束，收回临时权限',
    },
  },

  // 权限条件配置
  {
    component: 'Textarea',
    fieldName: 'conditions',
    label: '权限条件',
    formItemClass: 'col-span-2',
    help: '设置权限生效的条件，支持时间、地点、设备等复杂条件配置',
    componentProps: {
      placeholder: '例如：工作时间内且从公司IP访问时生效',
      rows: 3,
    },
  },

  // 高级设置
  {
    component: 'InputNumber',
    fieldName: 'priority',
    label: '优先级',
    defaultValue: 1,
    componentProps: {
      placeholder: '请输入优先级',
      min: 0,
      max: 999,
    },
  },
  {
    component: 'Select',
    fieldName: 'riskLevel',
    label: '风险等级',
    defaultValue: 'low',
    help: '评估权限的安全风险：低风险=日常操作，中风险=重要操作，高风险=关键操作，极高风险=核心系统操作',
    componentProps: {
      placeholder: '评估该权限的安全风险等级',
      getPopupContainer,
      options: [
        { label: '低风险 - 日常操作无重大影响', value: 'low' },
        { label: '中风险 - 重要操作需要注意', value: 'medium' },
        { label: '高风险 - 关键操作影响较大', value: 'high' },
        { label: '极高风险 - 核心系统操作', value: 'critical' },
      ],
    },
  },
  {
    component: 'Switch',
    fieldName: 'requireMfa',
    label: '需要MFA',
    defaultValue: false,
    help: '启用多因子认证，增强安全性。建议高风险权限启用MFA验证',
    componentProps: {
      style: { width: 'auto' },
    },
  },
  {
    component: 'Switch',
    fieldName: 'requireApproval',
    label: '需要审批',
    defaultValue: false,
    help: '权限使用前需要审批流程。建议关键操作权限启用审批控制',
    componentProps: {
      style: { width: 'auto' },
    },
  },

  // 操作权限管理 - 使用简化的多选框实现
  {
    component: 'Select',
    fieldName: 'operations',
    label: '操作权限',
    formItemClass: 'col-span-2',
    help: '详细定义允许的操作类型。可多选，权限级别自动包含对应操作，此处可进一步细化控制',
    dependencies: {
      show: (values) => values.permissionLevel !== 'none',
      triggerFields: ['permissionLevel'],
    },
    componentProps: {
      mode: 'multiple',
      placeholder: '选择允许的具体操作（可多选）',
      getPopupContainer,
      options: [
        { label: '读取 - 查看和获取数据', value: 'read' },
        { label: '写入 - 创建和修改数据', value: 'write' },
        { label: '删除 - 移除数据', value: 'delete' },
        { label: '审批 - 流程审批操作', value: 'approve' },
        { label: '导出 - 数据导出功能', value: 'export' },
      ],
    },
  },

  // 数据过滤规则 - 使用文本域暂时实现
  {
    component: 'Textarea',
    fieldName: 'dataFiltersText',
    label: '数据过滤规则',
    formItemClass: 'col-span-2',
    help: '使用SQL WHERE语法限制数据访问范围。例如：department_id = 1 限制只能访问部门1的数据',
    dependencies: {
      show: (values) => ['read', 'write', 'admin'].includes(values.permissionLevel),
      triggerFields: ['permissionLevel'],
    },
    componentProps: {
      placeholder: '例如: department_id = 1 AND user_id > 0\n支持条件: =, !=, >, <, >=, <=, LIKE, IN\n逻辑连接: AND, OR',
      rows: 3,
    },
  },

  // 字段掩码 - 使用多选框实现
  {
    component: 'Select',
    fieldName: 'fieldMasks',
    label: '字段掩码',
    formItemClass: 'col-span-2',
    help: '指定需要脱敏处理的敏感字段，查询结果中这些字段将被掩码显示，如138****1234',
    dependencies: {
      show: (values) => ['read', 'write', 'admin'].includes(values.permissionLevel),
      triggerFields: ['permissionLevel'],
    },
    componentProps: {
      mode: 'tags',
      placeholder: '选择预设敏感字段或输入自定义字段名',
      getPopupContainer,
      options: [
        { label: 'password - 密码字段', value: 'password' },
        { label: 'phone - 手机号码', value: 'phone' },
        { label: 'email - 邮箱地址', value: 'email' },
        { label: 'id_card - 身份证号', value: 'id_card' },
        { label: 'salary - 薪资信息', value: 'salary' },
        { label: 'bank_account - 银行账号', value: 'bank_account' },
      ],
    },
  },

  // 备注信息
  {
    component: 'Textarea',
    fieldName: 'comments',
    label: '备注',
    formItemClass: 'col-span-2',
    help: '权限配置的补充说明、使用注意事项、业务背景等重要信息',
    componentProps: {
      placeholder: '例如：临时权限，用于紧急运维操作，有效期至项目结束',
      rows: 3,
    },
  },
];
