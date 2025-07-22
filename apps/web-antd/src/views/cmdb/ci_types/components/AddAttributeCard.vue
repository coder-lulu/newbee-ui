<script lang="ts">
import { defineComponent } from 'vue';

import { PlusOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  name: 'AddAttributeCard',
  components: {
    PlusOutlined,
  },
  emits: ['click'],
});
</script>

<template>
  <div class="add-attribute-card" @click="$emit('click')">
    <div class="add-icon">
      <PlusOutlined />
    </div>
    <div class="add-text">添加属性</div>
  </div>
</template>

<style scoped>
.add-attribute-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 200px;
  max-width: 200px;
  height: auto;
  min-height: 80px;
  padding: 6px 8px;
  margin: 0 0 10px;
  cursor: pointer;
  background-color: #fff;
  border: 1px dashed #d9d9d9;
  border-radius: 1px;
  transition: all 0.3s;
}

.add-attribute-card:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.add-icon {
  margin-bottom: 6px;
  font-size: 20px;
  color: #8c8c8c;
}

.add-attribute-card:hover .add-icon {
  color: #1890ff;
}

.add-text {
  font-size: 12px;
  color: #8c8c8c;
}

.add-attribute-card:hover .add-text {
  color: #1890ff;
}
</style>
