<template>
  <div class="provider-info flex items-center gap-3">
    <div class="provider-icon">
      <img 
        v-if="provider.iconUrl" 
        :src="provider.iconUrl" 
        :alt="provider.displayName"
        class="w-8 h-8 rounded-full object-cover"
        @error="handleImageError"
      />
      <div 
        v-else 
        class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium"
      >
        {{ getProviderInitials(provider.displayName || provider.name) }}
      </div>
    </div>
    
    <div class="provider-details flex-1 min-w-0">
      <div class="provider-name font-medium text-gray-900 truncate">
        {{ provider.displayName || provider.name }}
      </div>
      <div class="provider-meta flex items-center gap-2 text-xs text-gray-500">
        <span class="provider-type">{{ provider.name }}</span>
        <a-tag 
          v-if="provider.supportPkce" 
          size="small" 
          color="blue"
        >
          PKCE
        </a-tag>
        <span v-if="provider.responseTime" class="response-time">
          {{ provider.responseTime }}ms
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OauthProviderInfo } from '#/api/system/oauth/model';

interface Props {
  provider: OauthProviderInfo;
}

defineProps<Props>();

function getProviderInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
}
</script>

<style scoped>
.provider-info {
  min-width: 0; /* 确保truncate正常工作 */
}

.provider-name {
  line-height: 1.2;
}

.provider-meta {
  line-height: 1;
  margin-top: 2px;
}

.response-time {
  color: #52c41a;
  font-weight: 500;
}
</style>