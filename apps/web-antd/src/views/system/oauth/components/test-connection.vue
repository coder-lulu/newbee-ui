<template>
  <Button
    :loading="testing"
    :type="buttonType"
    size="small"
    @click="handleTest"
  >
    <template #icon>
      <CheckCircleOutlined v-if="testResult?.connected" />
      <CloseCircleOutlined v-else-if="testResult && !testResult.connected" />
      <ApiOutlined v-else />
    </template>
    {{ buttonText }}
  </Button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button, message } from 'ant-design-vue';
import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
import type { OauthProviderTestResult } from '#/api/system/oauth/model';
import { testOauthProvider } from '#/api/system/oauth';

interface Props {
  providerId: number;
  disabled?: boolean;
}

interface Emits {
  (e: 'tested', result: OauthProviderTestResult): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const testing = ref(false);
const testResult = ref<OauthProviderTestResult | null>(null);

const buttonType = computed(() => {
  if (testResult.value?.connected) return 'primary';
  if (testResult.value && !testResult.value.connected) return 'danger';
  return 'default';
});

const buttonText = computed(() => {
  if (testing.value) return '测试中...';
  if (testResult.value?.connected) return '连接正常';
  if (testResult.value && !testResult.value.connected) return '连接失败';
  return '测试连接';
});

async function handleTest() {
  if (props.disabled || testing.value) return;

  testing.value = true;
  try {
    const result = await testOauthProvider(props.providerId);
    testResult.value = result;
    
    if (result.connected) {
      message.success(`连接测试成功 (${result.responseTime}ms)`);
    } else {
      message.error(`连接测试失败: ${result.errorMessage}`);
    }
    
    emit('tested', result);
  } catch (error) {
    console.error('Test connection failed:', error);
    message.error('连接测试异常');
    testResult.value = {
      connected: false,
      testUrl: '',
      errorMessage: '测试异常',
      responseTime: 0,
    };
  } finally {
    testing.value = false;
  }
}
</script>