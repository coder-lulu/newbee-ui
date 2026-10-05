import type * as monaco from 'monaco-editor';

export interface MonacoEditorProps {
  modelValue: string;
  language?: string;
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  readonly?: boolean;
  height?: string | number;
  width?: string | number;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  enableCompletion?: boolean;
  completionProvider?: CompletionProvider;
  minimap?: boolean;
  lineNumbers?: 'on' | 'off' | 'relative';
}

export interface MonacoDiffProps {
  originalValue: string;
  modifiedValue: string;
  language?: string;
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  readonly?: boolean;
  height?: string | number;
  options?: monaco.editor.IStandaloneDiffEditorConstructionOptions;
}

export type CompletionProvider = monaco.languages.CompletionItemProvider;

/**
 * 异步数据源接口 - 用于从数据库或API获取建议
 */
export interface AsyncCompletionDataSource {
  /**
   * 获取建议项
   * @param query 当前输入的内容
   * @returns 建议项数组
   */
  fetchSuggestions: (query: string) => Promise<string[]>;

  /**
   * 缓存时间(毫秒),默认5分钟
   */
  cacheDuration?: number;
}
