import type { DictData } from '#/api/system/dict/dict-data-model';

import { reactive } from 'vue';

import { defineStore } from 'pinia';

/**
 * antd使用 select和radio通用
 */
export interface Option {
  disabled?: boolean;
  label: string;
  value: number | string;
}

export function dictToOptions(data: DictData[]): Option[] {
  return data.map((item) => ({
    ...item,
    label: item.title as any,
    value: item.value as any,
  }));
}

export const useDictStore = defineStore('app-dict', () => {
  /**
   * 一般是dictTag使用
   */
  const dictMap = reactive(new Map<string, DictData[]>());
  /**
   * select radio radioButton使用 只能为固定格式(Option)
   */
  const dictOptionsMap = reactive(new Map<string, Option[]>());
  /**
   * 添加一个字典请求状态的缓存
   *
   * 主要解决多次请求重复api的问题(不能用abortController 会导致除了第一个其他的获取的全为空)
   * 比如在一个页面 index表单 modal drawer总共会请求三次 但是获取的都是一样的数据
   * 相当于加锁 保证只有第一次请求的结果能拿到
   */
  const dictRequestCache = reactive(
    new Map<string, Promise<DictData[] | void>>(),
  );

  function getDict(dictName: string): DictData[] {
    if (!dictName) return [];
    // 没有key 添加一个空数组
    if (!dictMap.has(dictName)) {
      dictMap.set(dictName, reactive([]));
    }
    // 这里拿到的就不可能为空了
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return dictMap.get(dictName)!;
  }

  function getDictOptions(dictName: string): Option[] {
    if (!dictName) return [];
    // 没有key 添加一个空数组
    if (!dictOptionsMap.has(dictName)) {
      dictOptionsMap.set(dictName, []);
    }
    // 这里拿到的就不可能为空了
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return dictOptionsMap.get(dictName)!;
  }

  function resetCache() {
    dictMap.clear();
    dictOptionsMap.clear();
    /**
     * 不需要清空dictRequestCache 每次请求成功/失败都清空key
     */
  }

  /**
   * 核心逻辑
   *
   * 不能直接粗暴使用set 会导致之前return的空数组跟现在的数组指向不是同一个地址  数据也就为空了
   *
   * 判断是否已经存在key 并且数组长度为0 说明该次要处理的数据是return的空数组 直接push(不修改指向)
   * 否则 直接set
   *
   */
  function setDictInfo(dictName: string, dictValue: DictData[]) {
    if (dictMap.has(dictName) && dictMap.get(dictName)?.length === 0) {
      dictMap.get(dictName)?.push(...dictValue);
    } else {
      dictMap.set(dictName, dictValue);
    }
    if (
      dictOptionsMap.has(dictName) &&
      dictOptionsMap.get(dictName)?.length === 0
    ) {
      dictOptionsMap.get(dictName)?.push(...dictToOptions(dictValue));
    } else {
      dictOptionsMap.set(dictName, dictToOptions(dictValue));
    }
  }

  function $reset() {
    /**
     * doNothing
     */
  }

  return {
    $reset,
    dictMap,
    dictOptionsMap,
    dictRequestCache,
    getDict,
    getDictOptions,
    resetCache,
    setDictInfo,
  };
});
