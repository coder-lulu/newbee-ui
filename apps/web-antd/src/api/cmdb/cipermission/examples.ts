/**
 * CI权限管理API使用示例
 * 根据后端CI权限前端对接文档创建的示例代码
 */

import type {
  CiPermissionListRequest,
  CreateCiPermissionRequest,
} from './model';

import {
  batchDeleteCiPermissions,
  checkUserPermission,
  createCiPermission,
  createDepartmentPermission,
  createRolePermission,
  createUserPermission,
  getCiPermissionList,
  getCiPermissionsByCiType,
  getUserMaxPermissionLevel,
  updateCiPermission,
} from './index';

// ==================== 使用示例 ====================

/**
 * 示例1: 创建用户权限
 */
export async function exampleCreateUserPermission() {
  try {
    const response = await createUserPermission('user_123', '张三', {
      scope_type: 'ci_type',
      ci_type_id: 1,
      permission_level: 'write',
      risk_level: 'medium',
      description: '用户CI类型读写权限',
    });
    console.log('权限创建成功:', response);
    return response;
  } catch (error) {
    console.error('创建用户权限失败:', error);
    throw error;
  }
}

/**
 * 示例2: 创建角色权限
 */
export async function exampleCreateRolePermission() {
  try {
    const response = await createRolePermission('role_admin', '管理员角色', {
      scope_type: 'global',
      permission_level: 'admin',
      risk_level: 'high',
      description: '管理员全局权限',
    });
    console.log('角色权限创建成功:', response);
    return response;
  } catch (error) {
    console.error('创建角色权限失败:', error);
    throw error;
  }
}

/**
 * 示例3: 创建部门权限
 */
export async function exampleCreateDepartmentPermission() {
  try {
    const response = await createDepartmentPermission(1001, '运维部', {
      scope_type: 'ci_type',
      ci_type_id: 1,
      permission_level: 'read',
      risk_level: 'low',
      description: '运维部CI类型只读权限',
    });
    console.log('部门权限创建成功:', response);
    return response;
  } catch (error) {
    console.error('创建部门权限失败:', error);
    throw error;
  }
}

/**
 * 示例4: 查询权限列表
 */
export async function exampleGetPermissionList() {
  try {
    const params: CiPermissionListRequest = {
      page: 1,
      pageSize: 10,
      subject_type: 'user',
      permission_level: 'write',
    };

    const response = await getCiPermissionList(params);
    console.log('权限列表查询成功:', response);
    return response;
  } catch (error) {
    console.error('查询权限列表失败:', error);
    throw error;
  }
}

/**
 * 示例5: 更新权限
 */
export async function exampleUpdatePermission(permissionId: number) {
  try {
    const response = await updateCiPermission({
      id: permissionId,
      permission_level: 'admin',
      effective_to: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天后过期
      updated_by: 'current_user',
    });
    console.log('权限更新成功:', response);
    return response;
  } catch (error) {
    console.error('更新权限失败:', error);
    throw error;
  }
}

/**
 * 示例6: 批量删除权限
 */
export async function exampleBatchDeletePermissions(permissionIds: number[]) {
  try {
    const response = await batchDeleteCiPermissions(permissionIds);
    console.log('批量删除权限成功:', response);
    return response;
  } catch (error) {
    console.error('批量删除权限失败:', error);
    throw error;
  }
}

/**
 * 示例7: 检查用户权限
 */
export async function exampleCheckUserPermission() {
  try {
    const hasPermission = await checkUserPermission(
      'user_123',
      'write',
      1, // ci_type_id
    );

    if (hasPermission) {
      console.log('用户有写权限');
    } else {
      console.log('用户没有写权限');
    }

    return hasPermission;
  } catch (error) {
    console.error('检查用户权限失败:', error);
    throw error;
  }
}

/**
 * 示例8: 获取用户最高权限级别
 */
export async function exampleGetUserMaxPermissionLevel() {
  try {
    const maxLevel = await getUserMaxPermissionLevel(
      'user_123',
      1, // ci_type_id
    );

    console.log('用户最高权限级别:', maxLevel);
    return maxLevel;
  } catch (error) {
    console.error('获取用户最高权限级别失败:', error);
    throw error;
  }
}

/**
 * 示例9: 根据CI类型查询权限
 */
export async function exampleGetPermissionsByCiType(ciTypeId: number) {
  try {
    const response = await getCiPermissionsByCiType(ciTypeId, {
      page: 1,
      pageSize: 20,
    });
    console.log('CI类型权限查询成功:', response);
    return response;
  } catch (error) {
    console.error('查询CI类型权限失败:', error);
    throw error;
  }
}

/**
 * 示例10: 复杂权限创建示例
 */
export async function exampleCreateComplexPermission() {
  try {
    const permissionData: CreateCiPermissionRequest = {
      permission_id: 'perm_complex_001',
      department_id: 1001,
      scope_type: 'ci_instance',
      ci_id: 12_345,
      subject_type: 'user',
      subject_id: 'user_456',
      subject_name: '李四',
      permission_type: 'allow',
      permission_level: 'write',
      operations: {
        operations: [
          { operation: 'read', description: '读取权限' },
          { operation: 'update', description: '更新权限' },
        ],
      },
      priority: 10,
      effective_from: Date.now(),
      effective_to: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90天后过期
      is_temporary: true,
      require_approval: true,
      risk_level: 'medium',
      require_mfa: false,
      description: '临时CI实例权限',
      comments: '项目需要临时访问权限',
    };

    const response = await createCiPermission(permissionData);
    console.log('复杂权限创建成功:', response);
    return response;
  } catch (error) {
    console.error('创建复杂权限失败:', error);
    throw error;
  }
}

// ==================== 实用工具函数 ====================

/**
 * 权限级别比较工具
 */
export const PermissionLevelUtils = {
  /**
   * 权限级别权重
   */
  levelWeights: {
    none: 0,
    read: 1,
    write: 2,
    admin: 3,
    super_admin: 4,
  },

  /**
   * 比较权限级别
   * @param level1 权限级别1
   * @param level2 权限级别2
   * @returns 比较结果 (-1: level1 < level2, 0: 相等, 1: level1 > level2)
   */
  compare(level1: string, level2: string): number {
    const weight1 =
      this.levelWeights[level1 as keyof typeof this.levelWeights] || 0;
    const weight2 =
      this.levelWeights[level2 as keyof typeof this.levelWeights] || 0;

    if (weight1 < weight2) return -1;
    if (weight1 > weight2) return 1;
    return 0;
  },

  /**
   * 检查是否有足够权限
   * @param userLevel 用户权限级别
   * @param requiredLevel 所需权限级别
   * @returns 是否有足够权限
   */
  hasEnoughPermission(userLevel: string, requiredLevel: string): boolean {
    return this.compare(userLevel, requiredLevel) >= 0;
  },
};

/**
 * 权限过期检查工具
 */
export const PermissionExpirationUtils = {
  /**
   * 检查权限是否过期
   * @param effectiveTo 权限结束时间戳
   * @returns 是否过期
   */
  isExpired(effectiveTo?: number): boolean {
    if (!effectiveTo) return false;
    return Date.now() > effectiveTo;
  },

  /**
   * 计算权限剩余天数
   * @param effectiveTo 权限结束时间戳
   * @returns 剩余天数
   */
  getDaysRemaining(effectiveTo?: number): number {
    if (!effectiveTo) return Infinity;
    const remaining = effectiveTo - Date.now();
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  },

  /**
   * 检查权限是否即将过期（7天内）
   * @param effectiveTo 权限结束时间戳
   * @returns 是否即将过期
   */
  isExpiringSoon(effectiveTo?: number): boolean {
    if (!effectiveTo) return false;
    const daysRemaining = this.getDaysRemaining(effectiveTo);
    return daysRemaining <= 7 && daysRemaining > 0;
  },
};
