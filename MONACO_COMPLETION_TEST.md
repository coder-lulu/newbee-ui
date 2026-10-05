# Monaco Editor 代码补全测试指南

## 📅 更新日期
2026-01-01

## 🔍 关于 "message port closed" 错误

### 错误信息
```
Unchecked runtime.lastError: The message port closed before a response was received.
```

### 可能原因

**最常见原因**: 这个错误通常是**浏览器扩展**导致的，不是 Monaco Editor 的问题！

常见导致该错误的扩展：
- Chrome扩展（广告拦截、翻译、开发工具等）
- React DevTools
- Vue DevTools
- 任何注入内容脚本的扩展

### 验证方法

**1. 在无痕模式测试**
```
Chrome: Ctrl + Shift + N
Edge: Ctrl + Shift + P
```
- 无痕模式下默认禁用所有扩展
- 如果错误消失 → 确认是扩展导致
- 如果错误仍在 → 可能是 Monaco 配置问题

**2. 逐个禁用扩展**
```
Chrome:
1. 进入 chrome://extensions/
2. 逐个禁用扩展
3. 刷新页面测试
4. 找到导致问题的扩展
```

**3. 检查控制台完整错误信息**
```
F12 → Console → 点击错误查看详细堆栈
```
- 如果错误来自 `chrome-extension://...` → 确认是扩展问题
- 如果错误来自应用代码 → Monaco 配置问题

---

## ✅ 代码补全功能测试

### 前提条件

1. ✅ 开发服务器已重启
   ```bash
   cd /opt/code/newbee/ui
   pnpm dev
   ```

2. ✅ 浏览器已硬刷新
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

### 测试步骤

#### 测试1: Shell 代码补全

1. 打开脚本编辑器
2. 切换到"脚本内容"标签
3. 确保主题选择器显示正常
4. 在编辑器中输入以下内容：

```bash
ec
```

**预期结果**：
- ✅ 输入 `ec` 后自动显示补全菜单
- ✅ 菜单中包含 `echo` 命令
- ✅ 使用方向键可以选择
- ✅ 按 Tab 或 Enter 插入

**如果没有自动显示**：
- 手动按 `Ctrl + Space`
- 应该显示补全菜单

#### 测试2: 更多Shell命令

继续输入：
```bash
cd
ls
gr
mk
```

**预期结果**：
- `cd` → 自动补全
- `ls` → 自动补全
- `gr` → 显示 `grep`
- `mk` → 显示 `mkdir`

#### 测试3: 完整脚本

输入完整脚本：
```bash
#!/bin/bash
echo "Hello World"
cd /tmp
ls -la
```

**检查项**：
- ✅ 每个命令输入时都有补全提示
- ✅ 语法高亮正常（echo蓝色，字符串绿色，注释灰色）
- ✅ 无控制台错误

#### 测试4: Python 代码补全

1. 新建脚本，脚本类型选择 "Python"
2. 输入：

```python
pr
de
im
```

**预期结果**：
- `pr` → 显示 `print()`
- `de` → 显示 `def`
- `im` → 显示 `import`

#### 测试5: SQL 代码补全

1. 新建脚本，脚本类型选择 "SQL"
2. 输入：

```sql
SEL
FRO
WHE
```

**预期结果**：
- `SEL` → 显示 `SELECT`
- `FRO` → 显示 `FROM`
- `WHE` → 显示 `WHERE`

---

## 🐛 问题排查

### 问题1: 完全没有代码补全

**检查项**：

1. **检查 window.monaco**
   ```javascript
   // 在浏览器Console中执行
   console.log(window.monaco);
   // 应输出Monaco对象
   ```

2. **检查语言ID**
   ```javascript
   // Console中检查编辑器语言
   // 应该是 'sh' 而不是 'shell'
   ```

3. **检查控制台错误**
   ```
   F12 → Console
   查找Monaco或Completion相关错误
   ```

4. **确认 enableCompletion**
   ```vue
   <!-- 应该是 true -->
   <MonacoEditor :enable-completion="true" />
   ```

### 问题2: 有些命令没有补全

**原因**: 我们只提供了常用命令的补全

**已支持的命令**（共45+个）：
- 文件操作: `echo`, `cd`, `ls`, `pwd`, `mkdir`, `rm`, `cp`, `mv`, `touch`, `cat`, `more`, `less`, `head`, `tail`
- 系统命令: `systemctl`, `service`, `ps`, `kill`, `killall`, `top`, `htop`, `df`, `du`, `free`, `uname`, `hostname`
- 网络命令: `curl`, `wget`, `ping`, `ssh`, `scp`, `rsync`, `netstat`, `ifconfig`, `ip`
- 文本处理: `grep`, `awk`, `sed`, `sort`, `uniq`, `wc`, `cut`, `tr`
- 压缩解压: `tar`, `gzip`, `gunzip`, `zip`, `unzip`
- 权限管理: `chmod`, `chown`, `chgrp`, `sudo`, `su`

**如需添加更多命令**：
编辑 `language-config.ts` 的 `createShellCompletionProvider` 函数。

### 问题3: Ctrl+Space 无反应

**检查项**：

1. **triggerCharacters 已配置**
   - 查看 `language-config.ts` 第68行
   - 应该有 `triggerCharacters: ['a', 'b', ..., 'z', '-', '$']`

2. **Completion Provider 已注册**
   ```javascript
   // Console中执行
   console.log(window.monaco.languages.getLanguages());
   // 应该包含 'sh' 语言
   ```

3. **编辑器选项正确**
   - `quickSuggestions: true`
   - `suggestOnTriggerCharacters: true`
   - `suggest.showIcons: true`

### 问题4: 补全菜单显示但内容为空

**可能原因**：
- Completion Provider 的 `provideCompletionItems` 函数返回空数组
- window.monaco 未加载导致 CompletionItemKind 未定义

**修复**：
检查 `language-config.ts` 中的安全检查：
```typescript
if (!window.monaco) return { suggestions: [] };
```

---

## 📊 性能检查

### Monaco加载时间

在Console中检查：
```javascript
// 检查Monaco是否加载
console.time('monaco-check');
console.log(window.monaco ? 'Monaco已加载' : 'Monaco未加载');
console.timeEnd('monaco-check');
```

### Worker加载状态

```
F12 → Network → 过滤 "worker"
```

**预期**：
- ✅ 应该看到 `editor.worker.js` 等文件加载（如果使用TS/JS编辑器）
- ✅ 状态码: 200
- ✅ 类型: script

**如果看不到 Worker 文件**：
- 这是**正常的**！
- @guolao/vue-monaco-editor 会按需加载 Worker
- 只有在需要语言服务时才会加载对应的 Worker

---

## 🎯 最终验证

### 所有功能正常的标志

1. ✅ 无控制台错误（忽略浏览器扩展的错误）
2. ✅ 输入字母自动显示补全菜单
3. ✅ Ctrl+Space 强制显示补全
4. ✅ 语法高亮正常
5. ✅ 主题切换正常
6. ✅ 编辑器高度正常（500px）

### 代码补全工作流

```
用户输入 → 触发字符匹配 → Completion Provider 调用
→ 返回建议列表 → 显示补全菜单 → 用户选择 → 插入代码
```

### 调试技巧

**启用Monaco调试日志**（可选）：
```javascript
// 在Console中执行
localStorage.setItem('monaco-editor-debug', 'true');
// 刷新页面
```

**检查Provider注册**：
```javascript
// Console中执行
const providers = window.monaco?.languages.CompletionItemProviderRegistry;
console.log(providers);
```

---

## 📝 关键修改总结

本次修复包含以下关键修改：

1. ✅ **添加 triggerCharacters** - 自动触发代码补全
2. ✅ **统一使用 window.monaco** - 避免重复导入
3. ✅ **增强编辑器选项** - suggest widget配置
4. ✅ **手动主题选择** - 移除自动检测
5. ✅ **类型安全** - 使用 Monaco 类型导入

---

## 💡 提示

**如果代码补全完全正常，但仍然看到 "message port closed" 错误**：

→ 这是**浏览器扩展**导致的，可以安全忽略
→ 不影响 Monaco Editor 的任何功能
→ 建议在无痕模式测试确认

**如果代码补全不工作**：

→ 请按照本文档的排查步骤逐步检查
→ 确保重启了开发服务器
→ 确保硬刷新了浏览器

---

**测试时间**: 2026-01-01
**推荐测试环境**: Chrome 无痕模式
**开发服务器**: http://localhost:5173/

🎉 **完整的测试后应该看到流畅的代码补全体验！**
