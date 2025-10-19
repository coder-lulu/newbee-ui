import type { TenantOption } from '#/api/core/auth';

import { ref } from 'vue';

import { defineStore } from 'pinia';

import { tenantList as tenantListApi } from '#/api/core/auth';
import { getCurrentTenant } from '#/api/system/tenant';

interface CurrentTenantResp {
  originalTenantId?: string;
  activeTenantId?: string;
  isSwitched?: boolean;
  activeTenantInfo?: Record<string, any> | null;
}

/**
 * 用于超级管理员切换租户
 */
export const useTenantStore = defineStore('app-tenant', () => {
  // 是否已经选中租户
  const checked = ref(false);
  // 是否开启租户功能
  const tenantEnable = ref(true);
  const tenantList = ref<TenantOption[]>([]);
  const activeTenantId = ref<string | null>(null);
  const originalTenantId = ref<string | null>(null);

  // 初始化 获取租户信息
  async function initTenant() {
    const [tenantListResult, currentTenantResult] = await Promise.allSettled([
      tenantListApi(),
      getCurrentTenant(),
    ]);

    if (tenantListResult.status === 'fulfilled') {
      tenantEnable.value = tenantListResult.value.tenantEnabled;
      tenantList.value = tenantListResult.value.voList;
    }

    if (currentTenantResult.status === 'fulfilled') {
      applyCurrentTenant(currentTenantResult.value as CurrentTenantResp);
    }
  }

  function applyCurrentTenant(resp?: CurrentTenantResp | { data?: CurrentTenantResp }) {
    const payload = (resp as { data?: CurrentTenantResp })?.data ?? resp;
    activeTenantId.value = payload?.activeTenantId ?? null;
    originalTenantId.value = payload?.originalTenantId ?? null;
  }

  async function refreshCurrentTenant() {
    try {
      const resp = await getCurrentTenant();
      applyCurrentTenant(resp as CurrentTenantResp);
    } catch (error) {
      console.warn('Failed to refresh current tenant info', error);
      applyCurrentTenant();
    }
  }

  async function setChecked(_checked: boolean) {
    checked.value = _checked;
  }

  function $reset() {
    checked.value = false;
    tenantEnable.value = true;
    tenantList.value = [];
    activeTenantId.value = null;
    originalTenantId.value = null;
  }

  return {
    $reset,
    activeTenantId,
    applyCurrentTenant,
    checked,
    initTenant,
    originalTenantId,
    refreshCurrentTenant,
    setChecked,
    tenantEnable,
    tenantList,
  };
});
