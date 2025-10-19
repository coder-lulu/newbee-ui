<script setup lang="ts" name="TerminalSettingModal">
import { ref } from 'vue';

import { message } from 'ant-design-vue';

interface TerminalSettingModalProps {
  machineId?: number;
}

const props = defineProps<TerminalSettingModalProps>();

const visible = ref(false);

const openSetting = () => {
  visible.value = true;
};

const closeSetting = () => {
  visible.value = false;
};

const handleOk = () => {
  message.success('设置已保存');
  visible.value = false;
};

defineExpose({
  openSetting,
});
</script>

<template>
  <a-modal
    v-model="visible"
    title="终端设置"
    @ok="handleOk"
    @cancel="closeSetting"
  >
    <div class="setting-content">
      <p>终端设置功能正在开发中...</p>
    </div>
  </a-modal>
</template>

<style scoped>
.setting-content {
  padding: 20px;
  color: #666;
  text-align: center;
}
</style>
