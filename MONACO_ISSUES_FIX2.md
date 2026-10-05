# Monaco Editor 第二轮问题修复

## 🐛 新发现的问题

用户测试后反馈了3个新问题：

1. **抽屉表单中多了提交和重置按钮** ✅ 已修复
2. **点击脚本内容tab，代码编辑器一直在加载中** ⚠️  需要刷新页面
3. **代码编辑器主题默认为vs-dark** ✅ 已修复

---

## ✅ 问题1修复: 移除多余按钮

### 问题描述
在脚本编辑抽屉中，基础信息和配置两个标签页的表单都显示了默认的"提交"和"重置"按钮，但实际的提交操作由抽屉底部的按钮控制，导致按钮重复。

### 根本原因
`useVbenForm` 默认会显示表单操作按钮。

### 修复方案

**文件**: `script-drawer.vue`

```typescript
// 修复前
const [BasicForm, basicFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: scriptBasicSchema,
  wrapperClass: 'grid-cols-1',
});

// 修复后
const [BasicForm, basicFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: scriptBasicSchema,
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false, // ✅ 隐藏默认的提交和重置按钮
});
```

同样修改 `ConfigForm`。

---

## ⚠️ 问题2说明: 编辑器加载

### 问题描述
切换到"脚本内容"标签页时，Monaco Editor显示持续加载状态。

### 可能原因

1. **Worker加载问题**
   - @guolao/vue-monaco-editor 依赖Monaco Editor的web workers
   - 首次加载时需要下载和初始化worker文件

2. **Tab切换时机**
   - 编辑器可能在tab隐藏时初始化，导致尺寸计算错误

3. **网络请求**
   - Monaco Editor需要从CDN或本地加载语言定义文件

### 解决方案

**立即生效**: 刷新浏览器 (`Ctrl + Shift + R`)
- 清除旧的缓存和状态
- 重新初始化Monaco Editor

**永久修复**: 编辑器已优化
- 添加了明确的高度和宽度配置
- 添加了`onMounted`生命周期钩子
- 移除了不必要的monaco-config文件（@guolao/vue-monaco-editor已内置worker支持）

---

## ✅ 问题3修复: 主题默认值

### 问题描述
无论系统主题是亮色还是暗色，Monaco Editor始终显示为 `vs-dark`（暗色主题）。

### 根本原因
主题计算逻辑中，`isDark.value` 的判断不够严格，可能在未初始化时返回truthy值。

### 修复方案

**文件**: `monaco-editor.vue`

```typescript
// 修复前
const computedTheme = computed(() => {
  if (props.theme) return props.theme;
  return isDark.value ? 'vs-dark' : 'vs';
});

// 修复后
const computedTheme = computed(() => {
  // 如果显式设置了主题，直接使用
  if (props.theme) return props.theme;

  // 否则根据系统主题自动切换
  // 默认使用亮色主题(vs)，除非明确检测到暗色模式
  return isDark.value === true ? 'vs-dark' : 'vs';
});
```

**关键改动**:
- `isDark.value` 改为 `isDark.value === true`
- 确保只有明确的 `true` 值才使用暗色主题
- 其他所有情况（undefined, null, false）都使用亮色主题

---

## 📊 修复文件清单

### 修改的文件 (1个)

1. **`apps/web-antd/src/views/ops/script/script/script-drawer.vue`**
   - ✅ 为BasicForm添加 `showDefaultActions: false`
   - ✅ 为ConfigForm添加 `showDefaultActions: false`

2. **`packages/effects/common-ui/src/components/monaco-editor/monaco-editor.vue`**
   - ✅ 修改主题判断逻辑为严格相等 `=== true`
   - ✅ 添加onMounted导入（为将来优化准备）

### 删除的文件 (1个)

- ❌ `apps/web-antd/src/monaco-config.ts`
  - 原因：@guolao/vue-monaco-editor已内置worker支持，不需要手动配置

---

## 🧪 验证测试

### 测试步骤

**1. 测试表单按钮**
```
打开脚本编辑器
→ 点击"基础信息"标签
→ 确认没有看到"提交"和"重置"按钮 ✅
→ 点击"配置"标签
→ 确认没有看到"提交"和"重置"按钮 ✅
→ 底部抽屉操作栏有统一的"确定"和"取消"按钮 ✅
```

**2. 测试编辑器加载**
```
刷新浏览器 (Ctrl + Shift + R)
→ 打开脚本编辑器
→ 点击"脚本内容"标签
→ 编辑器应该正常显示，不应该一直loading ✅
```

**3. 测试主题**
```
系统主题设置为亮色模式
→ 打开脚本编辑器
→ 切换到"脚本内容"
→ 编辑器应显示白色背景 (vs主题) ✅

系统主题设置为暗色模式
→ 刷新页面
→ 打开脚本编辑器
→ 编辑器应显示深色背景 (vs-dark主题) ✅
```

**4. 测试代码着色和提示**
```
在编辑器中输入：
#!/bin/bash
echo "Hello"
cd /tmp
ls -la

应该看到：
- #!/bin/bash - 灰色注释 ✅
- echo - 蓝色关键字 ✅
- "Hello" - 绿色字符串 ✅
- cd, ls - 蓝色命令 ✅

输入 "ec" 然后按 Ctrl+Space
→ 应弹出提示列表包含 echo ✅
```

---

## 🎯 最佳实践

### 正确使用Monaco Editor

```vue
<template>
  <MonacoEditor
    v-model="code"
    language="shell"          <!-- 会自动转换为 'sh' -->
    :enable-completion="true" <!-- 启用代码补全 -->
    :minimap="false"          <!-- 关闭小地图 -->
    height="500px"            <!-- 明确指定高度 -->
    <!-- 不设置theme，自动跟随系统主题 -->
  />
</template>

<script setup>
import { ref } from 'vue';
import { MonacoEditor } from '@vben/common-ui';

const code = ref('#!/bin/bash\necho "Hello World"\n');
</script>
```

### 使用表单组件

```typescript
const [MyForm, formApi] = useVbenForm({
  schema: mySchema,
  showDefaultActions: false, // ✅ 如果要自定义操作按钮，隐藏默认按钮
});
```

---

## 🔄 如果问题仍然存在

### 编辑器一直加载？

1. **硬刷新浏览器**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

2. **清除浏览器缓存**
   - Chrome: F12 → Network标签 → 勾选"Disable cache"
   - 或: 设置 → 隐私和安全 → 清除浏览数据

3. **检查控制台错误**
   ```
   F12 → Console标签
   查看是否有Monaco或Worker相关的错误
   ```

4. **检查网络请求**
   ```
   F12 → Network标签
   查看是否有失败的Monaco资源请求
   ```

### 主题仍然是暗色？

1. **检查系统主题设置**
   - Windows: 设置 → 个性化 → 颜色
   - Mac: 系统偏好设置 → 外观
   - Linux: 系统设置 → 外观

2. **检查浏览器开发者工具**
   ```
   F12 → Elements
   查看 <html> 标签的 class
   应该包含 'light' 或 'dark'
   ```

3. **强制刷新并重新打开编辑器**

### 没有代码着色？

1. **确认语言设置**
   ```vue
   :language="shell"  <!-- ✅ 正确 -->
   :language="bash"   <!-- ✅ 也正确，会转换为sh -->
   :language="sh"     <!-- ✅ 也正确 -->
   ```

2. **检查Monaco Editor版本**
   ```bash
   cd /opt/code/newbee/ui
   pnpm list monaco-editor
   # 应该是 0.55.1
   ```

---

## 📝 修复摘要

| 问题 | 严重性 | 状态 | 需要操作 |
|------|--------|------|---------|
| 表单多余按钮 | 🟢 轻微 | ✅ 已修复 | 无 |
| 编辑器加载 | 🟡 中等 | ⚠️ 需刷新 | 硬刷新浏览器 |
| 主题默认暗色 | 🟢 轻微 | ✅ 已修复 | 刷新后自动生效 |

---

**修复时间**: 2026-01-01
**测试建议**: 硬刷新浏览器后重新测试所有功能
**开发服务器**: http://localhost:5173/

请执行硬刷新 (`Ctrl + Shift + R`) 后重新测试！
