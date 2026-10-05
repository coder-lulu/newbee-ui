<script lang="ts" setup>
import { EllipsisText } from '@vben/common-ui';

const text = `
Newbee Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。`;
</script>
<template>
  <EllipsisText :line="3" expand>{{ text }}</EllipsisText>
</template>
