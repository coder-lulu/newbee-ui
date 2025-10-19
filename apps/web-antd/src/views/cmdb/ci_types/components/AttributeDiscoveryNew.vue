<script lang="ts" setup>
import DiscoveryPoolList from './discovery/DiscoveryPoolList.vue';

interface Props {
  typeId: number;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="attribute-discovery-new">
    <DiscoveryPoolList :type-id="props.typeId" />
  </div>
</template>

<style scoped lang="less">
.attribute-discovery-new {
  padding: 0;
}
</style>
