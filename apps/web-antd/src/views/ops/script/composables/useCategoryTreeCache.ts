import { ref } from 'vue';

import type { ScriptCategory } from '#/api/ops/script/script-category-model';
import { scriptCategoryList } from '#/api/ops/script/script-category';
import { listToTree, treeToList } from '@vben/utils';

// 分类树缓存
const categoryTreeCache = ref<ScriptCategory[]>([]);
const cacheTimestamp = ref<number>(0);
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 使用分类树缓存
 * 减少重复请求，提升性能
 */
export function useCategoryTreeCache() {
  const loading = ref(false);

  /**
   * 获取分类树数据（带缓存）
   */
  async function getCategoryTree(forceRefresh = false): Promise<ScriptCategory[]> {
    const now = Date.now();
    const isCacheValid = !forceRefresh && categoryTreeCache.value.length > 0 &&
                         (now - cacheTimestamp.value) < CACHE_DURATION;

    if (isCacheValid) {
      return categoryTreeCache.value;
    }

    loading.value = true;
    try {
      // 取足够大的 pageSize；兼容后端返回“已嵌套的 children 结构”或“扁平列表”两种形态
      const raw = (await scriptCategoryList({ page: 1, pageSize: 10_000 } as any)) || [];
      const hasChildrenKey = Array.isArray(raw) && raw.some((n: any) => 'children' in (n || {}));
      const flat = hasChildrenKey ? (treeToList(raw as any) as any[]) : (raw as any[]);
      // 去重：确保同一个 id 只出现一次，避免 TreeSelect 提示 Same `value` exist in the tree
      const seen = new Set<number | string>();
      const flatUnique = flat.filter((item: any) => {
        const key = item?.id;
        if (key == null) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const tree = listToTree(flatUnique || [], { id: 'id', pid: 'parentId' }) as ScriptCategory[];
      // 规范 children：null -> []，并去重整个树中重复 id
      const ensureChildrenArray = (nodes?: any[]): any[] => {
        if (!Array.isArray(nodes)) return [] as any[];
        return nodes.map((node) => ({
          ...node,
          children: ensureChildrenArray(node.children),
        }));
      };
      const dedupeTreeById = (nodes: any[]): any[] => {
        const seen = new Set<number | string>();
        const walk = (arr: any[]): any[] => {
          const result: any[] = [];
          for (const n of arr) {
            const key = n?.id;
            if (key == null) continue;
            if (seen.has(key)) {
              continue;
            }
            seen.add(key);
            const next = { ...n };
            next.children = Array.isArray(n.children) ? walk(n.children) : [];
            result.push(next);
          }
          return result;
        };
        return walk(nodes);
      };
      categoryTreeCache.value = dedupeTreeById(ensureChildrenArray(tree));
      cacheTimestamp.value = now;
      return categoryTreeCache.value;
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * 清除缓存
   */
  function clearCache() {
    categoryTreeCache.value = [];
    cacheTimestamp.value = 0;
  }

  /**
   * 刷新缓存
   */
  async function refreshCache(): Promise<ScriptCategory[]> {
    return getCategoryTree(true);
  }

  return {
    categoryTreeCache,
    clearCache,
    getCategoryTree,
    loading,
    refreshCache,
  };
}
