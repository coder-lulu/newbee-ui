import type { DictData } from '#/api/system/dict/dict-data-model';
import type { Option } from '#/store/dict';

import { dictDataInfo } from '#/api/system/dict/dict-data';
import { useDictStore } from '#/store/dict';

// todo 重复代码的封装
export function getDict(dictName: string): DictData[] {
  const { dictRequestCache, getDict, setDictInfo } = useDictStore();
  // 这里拿到
  const dictList = getDict(dictName);
  // 检查请求状态缓存
  if (dictList.length === 0 && !dictRequestCache.has(dictName)) {
    dictRequestCache.set(
      dictName,
      dictDataInfo(dictName)
        .then((resp) => {
          // 缓存到store 这样就不用重复获取了
          // 内部处理了push的逻辑 这里不用push
          setDictInfo(dictName, resp.data);
        })
        .catch(() => {
          // 401时 移除字典缓存 下次登录重新获取
          dictRequestCache.delete(dictName);
        })
        .finally(() => {
          // 移除请求状态缓存
          /**
           * 这里主要判断字典item为空的情况(无奈兼容 不给字典item本来就是错误用法)
           * 会导致if一直进入逻辑导致接口无限刷新
           * 在这里dictList为空时 不删除缓存
           */
          if (dictList.length > 0) {
            dictRequestCache.delete(dictName);
          }
        }),
    );
  }
  return dictList;
}

export function getDictOptions(dictName: string): Option[] {
  const { dictRequestCache, getDictOptions, setDictInfo } = useDictStore();
  const dictOptionList = getDictOptions(dictName);
  // 检查请求状态缓存
  if (dictOptionList.length === 0 && !dictRequestCache.has(dictName)) {
    dictRequestCache.set(
      dictName,
      dictDataInfo(dictName)
        .then((resp) => {
          // 缓存到store 这样就不用重复获取了
          // 内部处理了push的逻辑 这里不用push
          setDictInfo(dictName, resp.data);
        })
        .finally(() => {
          // 移除请求状态缓存
          /**
           * 这里主要判断字典item为空的情况(无奈兼容 不给字典item本来就是错误用法)
           * 会导致if一直进入逻辑导致接口五线刷新
           * 在这里dictList为空时 不删除缓存
           */
          if (dictOptionList.length > 0) {
            dictRequestCache.delete(dictName);
          }
        }),
    );
  }
  return dictOptionList;
}
