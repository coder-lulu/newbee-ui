<script setup lang="ts" name="TerminalSearch">
import { nextTick, ref } from 'vue';

import { Icon } from '@iconify/vue';
import { message } from 'ant-design-vue';

interface SearchOptions {
  regex: boolean;
  wholeWord: boolean;
  caseSensitive: boolean;
  incremental: boolean;
}

interface SearchPlugin {
  findNext: (term: string, options: SearchOptions) => boolean;
  findPrevious: (term: string, options: SearchOptions) => boolean;
}

interface TerminalSearchProps {
  searchPlugin?: SearchPlugin;
}

const props = defineProps<TerminalSearchProps>();

const emit = defineEmits<{
  close: [];
}>();

const searchInput = ref();
const search = ref({
  visible: false,
  value: '',
  regex: false,
  words: false,
  matchCase: false,
  incremental: false,
});

const open = async () => {
  const visible = search.value.visible;
  search.value.visible = !visible;
  if (!visible) {
    await nextTick();
    searchInput.value?.focus();
  }
};

const closeSearch = () => {
  search.value.visible = false;
  search.value.value = '';
  emit('close');
};

const searchKeywords = (direction: boolean, searchPlugin?: SearchPlugin) => {
  if (!search.value.value || !searchPlugin) {
    return;
  }
  const option: SearchOptions = {
    regex: search.value.regex,
    wholeWord: search.value.words,
    caseSensitive: search.value.matchCase,
    incremental: search.value.incremental,
  };
  let res: boolean;
  res = direction
    ? searchPlugin.findNext(search.value.value, option)
    : searchPlugin.findPrevious(search.value.value, option);
  if (!res) {
    message.info('未查询到匹配项', 0.3);
  }
};

defineExpose({
  open,
});
</script>

<template>
  <div id="search-card" v-show="search.visible" @keydown.esc="closeSearch">
    <a-card title="搜索" size="small">
      <template #extra>
        <Icon
          icon="ant-design:close-outlined"
          class="span-blue pointer"
          title="关闭"
          @click="closeSearch"
        />
      </template>
      <!-- 搜索框 -->
      <a-input
        ref="searchInput"
        v-model="search.value"
        class="search-input"
        placeholder="请输入查找内容"
        allow-clear
        @keyup.enter="searchKeywords(true)"
      />
      <!-- 选项 -->
      <div class="search-options">
        <a-row>
          <a-col :span="12">
            <a-checkbox v-model="search.regex" class="usn">
              正则匹配
            </a-checkbox>
          </a-col>
          <a-col :span="12">
            <a-checkbox v-model="search.words" class="usn">
              单词全匹配
            </a-checkbox>
          </a-col>
          <a-col :span="12">
            <a-checkbox v-model="search.matchCase" class="usn">
              区分大小写
            </a-checkbox>
          </a-col>
          <a-col :span="12">
            <a-checkbox v-model="search.incremental" class="usn">
              增量查找
            </a-checkbox>
          </a-col>
        </a-row>
      </div>
      <!-- 按钮 -->
      <div class="search-buttons">
        <a-button
          class="terminal-search-button search-button-prev"
          type="primary"
          size="small"
          @click="searchKeywords(false)"
        >
          上一个
        </a-button>
        <a-button
          class="terminal-search-button search-button-next"
          type="primary"
          size="small"
          @click="searchKeywords(true)"
        >
          下一个
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<style lang="less" scoped>
#search-card {
  position: fixed;
  top: 94px;
  right: 20px;
  z-index: 200;
  width: 270px;

  .search-input {
    width: 240px;
  }

  .search-options {
    margin: 12px 0;
  }

  .search-buttons {
    margin-top: 5px;
    display: flex;
    justify-content: flex-end;
  }

  .terminal-search-button {
    margin-left: 10px;
  }

  .pointer {
    cursor: pointer;
  }

  .span-blue {
    color: #1890ff;
  }

  .usn {
    user-select: none;
  }
}
</style>
