import type * as Monaco from 'monaco-editor';
import type { CompletionProvider } from './types';

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

export function configureLanguageSupport(
  language: string,
  editor: Monaco.editor.IStandaloneCodeEditor,
  customProvider?: CompletionProvider
): Monaco.IDisposable | undefined {
  if (!window.monaco) {
    console.error('[Monaco] Monaco Editor not loaded');
    return undefined;
  }

  if (customProvider) {
    return window.monaco.languages.registerCompletionItemProvider(language, customProvider);
  }

  const provider = getBuiltinCompletionProvider(language);
  if (provider) {
    return window.monaco.languages.registerCompletionItemProvider(language, provider);
  }

  return undefined;
}

/**
 * 创建支持数据库数据源的补全提供者
 * @param language 语言ID
 * @param dataSource 异步数据源(如数据库API)
 * @returns 补全提供者
 */
export function createAsyncCompletionProvider(
  language: string,
  dataSource: AsyncCompletionDataSource
): Monaco.languages.CompletionItemProvider {
  // 缓存机制
  let cachedSuggestions: string[] = [];
  let lastFetchTime = 0;
  const cacheDuration = dataSource.cacheDuration || 5 * 60 * 1000; // 默认5分钟

  return {
    triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-', '$', '.'],

    provideCompletionItems: async (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      // 检查缓存是否有效
      const now = Date.now();
      if (now - lastFetchTime > cacheDuration) {
        try {
          // 从数据库获取新数据
          const query = word.word || '';
          cachedSuggestions = await dataSource.fetchSuggestions(query);
          lastFetchTime = now;
        } catch (error) {
          console.error('[Monaco] Failed to fetch suggestions from data source:', error);
        }
      }

      if (!window.monaco) return { suggestions: [] };

      // 获取内置建议
      const builtinProvider = getBuiltinCompletionProvider(language);
      const builtinSuggestions = builtinProvider
        ? (builtinProvider.provideCompletionItems(model, position, {} as any, {} as any) as any)?.suggestions || []
        : [];

      // 合并数据库建议和内置建议
      const dbSuggestions = cachedSuggestions.map(cmd => ({
        label: cmd,
        kind: window.monaco.languages.CompletionItemKind.Value,
        insertText: cmd,
        range,
        documentation: `历史命令: ${cmd}`,
        sortText: `0_${cmd}`, // 优先显示(0开头)
      }));

      return {
        suggestions: [
          ...dbSuggestions,      // 数据库建议排在前面
          ...builtinSuggestions, // 内置建议排在后面
        ],
      };
    },
  };
}

function getBuiltinCompletionProvider(language: string): Monaco.languages.CompletionItemProvider | null {
  // Monaco Editor的语言ID映射
  const normalizedLanguage = normalizeLanguageId(language);

  switch (normalizedLanguage) {
    case 'shell':  // Monaco 使用 'shell' 作为语言 ID
      return createShellCompletionProvider();
    case 'python':
      return createPythonCompletionProvider();
    case 'sql':
      return createSQLCompletionProvider();
    case 'yaml':
      return createYAMLCompletionProvider();
    case 'javascript':
    case 'typescript':
      return createJavaScriptCompletionProvider();
    case 'go':
      return createGoCompletionProvider();
    case 'ruby':
      return createRubyCompletionProvider();
    case 'dockerfile':
      return createDockerfileCompletionProvider();
    // 以下语言 Monaco 已内置完善的语法高亮和补全，无需自定义
    // json, html, css, xml, markdown, ini, powershell, perl
    default:
      return null;
  }
}

// 标准化语言ID为Monaco Editor识别的ID
export function normalizeLanguageId(language: string): string {
  const languageMap: Record<string, string> = {
    'sh': 'shell',        // Monaco 使用 'shell'，不是 'sh'
    'bash': 'shell',      // bash 映射到 'shell'
    'yml': 'yaml',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'json': 'json',
    'python': 'python',
    'sql': 'sql',
    'yaml': 'yaml',
    'markdown': 'markdown',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
  };
  return languageMap[language.toLowerCase()] || language.toLowerCase();
}

function createShellCompletionProvider(): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-', '$'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: [
          // 内置命令和常用命令
          ...createCommandSuggestions(['echo', 'cd', 'ls', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'touch', 'cat', 'more', 'less', 'head', 'tail'], range),
          // 系统命令
          ...createCommandSuggestions(['systemctl', 'service', 'ps', 'kill', 'killall', 'top', 'htop', 'df', 'du', 'free', 'uname', 'hostname'], range),
          // 网络命令
          ...createCommandSuggestions(['curl', 'wget', 'ping', 'ssh', 'scp', 'rsync', 'netstat', 'ifconfig', 'ip'], range),
          // 文本处理
          ...createCommandSuggestions(['grep', 'awk', 'sed', 'sort', 'uniq', 'wc', 'cut', 'tr'], range),
          // 压缩解压
          ...createCommandSuggestions(['tar', 'gzip', 'gunzip', 'zip', 'unzip'], range),
          // 权限管理
          ...createCommandSuggestions(['chmod', 'chown', 'chgrp', 'sudo', 'su'], range),
        ],
      };
    },
  };
}

function createPythonCompletionProvider(): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '.'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: [
          // 关键字
          ...createKeywordSuggestions(['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'import', 'from', 'return', 'yield', 'break', 'continue', 'pass', 'with', 'as', 'lambda'], range),
          // 内置函数
          ...createFunctionSuggestions(['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'tuple', 'set', 'open', 'input', 'sorted', 'map', 'filter', 'zip', 'enumerate'], range),
        ],
      };
    },
  };
}

function createSQLCompletionProvider(): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '.'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: [
          // DML命令
          ...createKeywordSuggestions(['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET'], range),
          // DDL命令
          ...createKeywordSuggestions(['CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'CREATE INDEX', 'DROP INDEX', 'TRUNCATE'], range),
          // DML操作
          ...createKeywordSuggestions(['INSERT INTO', 'UPDATE', 'DELETE FROM', 'VALUES'], range),
          // 聚合函数
          ...createFunctionSuggestions(['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'GROUP_CONCAT'], range),
          // 字符串函数
          ...createFunctionSuggestions(['CONCAT', 'SUBSTRING', 'LENGTH', 'UPPER', 'LOWER', 'TRIM'], range),
          // 日期函数
          ...createFunctionSuggestions(['NOW', 'DATE', 'TIMESTAMP', 'DATE_FORMAT', 'YEAR', 'MONTH', 'DAY'], range),
        ],
      };
    },
  };
}

function createYAMLCompletionProvider(): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-', ':'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      if (!window.monaco) return { suggestions: [] };

      return {
        suggestions: [
          {
            label: 'key-value',
            kind: window.monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:key}: ${2:value}',
            insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            documentation: '键值对',
          },
          {
            label: 'list-item',
            kind: window.monaco.languages.CompletionItemKind.Snippet,
            insertText: '- ${1:item}',
            insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            documentation: '列表项',
          },
        ],
      };
    },
  };
}

function createCommandSuggestions(commands: string[], range: Monaco.IRange): Monaco.languages.CompletionItem[] {
  if (!window.monaco) return [];

  return commands.map(cmd => ({
    label: cmd,
    kind: window.monaco.languages.CompletionItemKind.Function,
    insertText: cmd,
    range,
    documentation: `命令: ${cmd}`,
  }));
}

function createKeywordSuggestions(keywords: string[], range: Monaco.IRange): Monaco.languages.CompletionItem[] {
  if (!window.monaco) return [];

  return keywords.map(kw => ({
    label: kw,
    kind: window.monaco.languages.CompletionItemKind.Keyword,
    insertText: kw,
    range,
    documentation: `关键字: ${kw}`,
  }));
}

function createFunctionSuggestions(functions: string[], range: Monaco.IRange): Monaco.languages.CompletionItem[] {
  if (!window.monaco) return [];

  return functions.map(fn => ({
    label: fn,
    kind: window.monaco.languages.CompletionItemKind.Function,
    insertText: `${fn}()`,
    range,
    documentation: `函数: ${fn}`,
  }));
}

// JavaScript/TypeScript 补全提供者
function createJavaScriptCompletionProvider(): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['.', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: [
          // 关键字
          ...createKeywordSuggestions(['const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'return', 'async', 'await', 'import', 'export', 'class', 'extends', 'try', 'catch', 'finally'], range),
          // 内置对象
          ...createFunctionSuggestions(['console.log', 'console.error', 'console.warn', 'setTimeout', 'setInterval', 'Promise', 'Array', 'Object', 'JSON.parse', 'JSON.stringify'], range),
        ],
      };
    },
  };
}

// Go 补全提供者
function createGoCompletionProvider(): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '.'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: [
          // 关键字
          ...createKeywordSuggestions(['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'return', 'defer', 'go', 'chan', 'select'], range),
          // 常用函数
          ...createFunctionSuggestions(['fmt.Println', 'fmt.Printf', 'make', 'append', 'len', 'cap', 'copy', 'delete', 'panic', 'recover'], range),
        ],
      };
    },
  };
}

// Ruby 补全提供者
function createRubyCompletionProvider(): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '.'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: [
          // 关键字
          ...createKeywordSuggestions(['def', 'end', 'class', 'module', 'if', 'elsif', 'else', 'unless', 'case', 'when', 'for', 'while', 'until', 'do', 'break', 'next', 'return', 'yield', 'begin', 'rescue', 'ensure', 'raise'], range),
          // 常用方法
          ...createFunctionSuggestions(['puts', 'print', 'p', 'gets', 'require', 'include', 'attr_accessor', 'attr_reader', 'attr_writer'], range),
        ],
      };
    },
  };
}

// Dockerfile 补全提供者
function createDockerfileCompletionProvider(): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: [
          // Dockerfile 指令
          ...createKeywordSuggestions(['FROM', 'RUN', 'CMD', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL', 'LABEL', 'MAINTAINER'], range),
        ],
      };
    },
  };
}
