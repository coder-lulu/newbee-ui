<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import type { CaptchaLoginParams } from '#/api/core/auth';
import type { CaptchaResponse } from '#/api/core/captcha';

import { computed, onMounted, ref, useTemplateRef } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { omit } from 'lodash-es';

import { captchaImage } from '#/api/core/captcha';
import { tenantList } from '#/api/core/auth';
import type { TenantResp } from '#/api/core/auth';
import { useAuthStore } from '#/store';
import { DEFAULT_TENANT_ID } from '@vben/constants';

import { useLoginTenantId } from '../oauth-common';
import OAuthLogin from './oauth-login.vue';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const loginFormRef = useTemplateRef('loginFormRef');

const captchaInfo = ref<CaptchaResponse>({
  captchaId: '',
  imgPath: '',
});
// 验证码loading
const captchaLoading = ref(false);

async function loadCaptcha() {
  const resp = await captchaImage();
  captchaInfo.value = resp;
}

const tenantInfo = ref<TenantResp>({
  tenantEnabled: false,
  voList: [],
});

async function loadTenant() {
  const resp = await tenantList();
  tenantInfo.value = resp;
  
  // 如果租户功能被关闭，使用默认租户ID 1
  if (!resp.tenantEnabled) {
    const defaultTenantId = '1'; // 使用默认租户ID 1
    loginFormRef.value?.getFormApi().setFieldValue('tenantId', defaultTenantId);
    // 更新oauth登录使用的租户ID
    loginTenantId.value = defaultTenantId;
  } else if (resp.voList.length > 0) {
    // 选中第一个租户
    const firstTenantId = resp.voList[0]!.tenantId;
    loginFormRef.value?.getFormApi().setFieldValue('tenantId', firstTenantId);
    // 更新oauth登录使用的租户ID
    loginTenantId.value = firstTenantId;
  }
}

onMounted(async () => {
  await Promise.all([loadCaptcha(), loadTenant()]);
});

const { loginTenantId } = useLoginTenantId();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenSelect',
      componentProps: {
        class: 'bg-background h-[40px] focus:border-primary',
        contentClass: 'max-h-[256px] overflow-y-auto',
        options: tenantInfo.value.voList?.map((item) => ({
          label: item.companyName,
          value: item.tenantId,
        })),
        placeholder: $t('authentication.selectAccount'),
      },
      defaultValue: tenantInfo.value.tenantEnabled ? DEFAULT_TENANT_ID : '1',
      dependencies: {
        if: () => tenantInfo.value.tenantEnabled,
        // 可以把这里当做watch
        trigger: (model) => {
          // 给oauth登录使用
          loginTenantId.value = model?.tenantId ?? (tenantInfo.value.tenantEnabled ? DEFAULT_TENANT_ID : 1);
        },
        triggerFields: ['', 'tenantId'],
      },
      fieldName: 'tenantId',
      label: $t('authentication.selectAccount'),
      rules: z.string().min(1, { message: $t('authentication.selectAccount') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        class: 'focus:border-primary',
        placeholder: $t('authentication.usernameTip'),
      },
      defaultValue: 'admin',
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        class: 'focus:border-primary',
        placeholder: $t('authentication.password'),
      },
      defaultValue: '123456',
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(5, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInputCaptcha',
      componentProps: {
        captcha: captchaInfo.value.imgPath,
        class: 'focus:border-primary',
        onCaptchaClick: loadCaptcha,
        placeholder: $t('authentication.code'),
        loading: captchaLoading.value,
      },
      fieldName: 'captcha',
      label: $t('authentication.code'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.verifyRequiredTip') }),
    },
  ];
});

async function handleAccountLogin(values: CaptchaLoginParams) {
  try {
    const requestParam: any = omit(values, ['captcha']);
    requestParam.captcha = values.captcha;
    requestParam.captchaId = captchaInfo.value.captchaId;
    requestParam.grantType = 'password';
    // 确保包含租户ID，如果表单中没有则使用默认值
    if (!requestParam.tenantId) {
      requestParam.tenantId = tenantInfo.value.tenantEnabled ? DEFAULT_TENANT_ID : 1;
    } 
    // 登录
    await authStore.authLogin(requestParam);
  } catch (error) {
    console.error(error);
    // 处理验证码错误
    if (error instanceof Error) {
      // 刷新验证码
      loginFormRef.value?.getFormApi().setFieldValue('captcha', '');
      await loadCaptcha();
    }
  }
}
</script>

<template>
  <AuthenticationLogin
    ref="loginFormRef"
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :show-register="false"
    :show-third-party-login="true"
    @submit="handleAccountLogin"
  >
    <!-- 可通过show-third-party-login控制是否显示第三方登录 -->
    <template #third-party-login>
      <OAuthLogin />
    </template>
  </AuthenticationLogin>
</template>
