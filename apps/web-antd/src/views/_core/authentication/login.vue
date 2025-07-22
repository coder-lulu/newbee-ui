<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import type { CaptchaLoginParams } from '#/api/core/auth';
import type { CaptchaResponse } from '#/api/core/captcha';

import { computed, onMounted, ref, useTemplateRef } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { omit } from 'lodash-es';

import { captchaImage } from '#/api/core/captcha';
import { useAuthStore } from '#/store';

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

onMounted(async () => {
  await loadCaptcha();
});

const formSchema = computed((): VbenFormSchema[] => {
  return [
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
    const requestParam: any = omit(values, ['code']);
    requestParam.captchaId = captchaInfo.value.captchaId;
    requestParam.grantType = 'password';
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
