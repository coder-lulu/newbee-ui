# Monaco Editor 快速开始

## 🚀 5分钟上手指南

### 1. 基础使用

#### 导入组件
```typescript
import { MonacoEditor, MonacoDiff } from '@vben/common-ui';
```

#### Shell 脚本编辑器
```vue
<template>
  <MonacoEditor
    v-model="shellScript"
    language="shell"
    :enable-completion="true"
    height="400px"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MonacoEditor } from '@vben/common-ui';

const shellScript = ref(`#!/bin/bash
# 示例脚本
echo "Hello World"
`);
</script>
```

#### SQL 查询编辑器
```vue
<template>
  <MonacoEditor
    v-model="sqlQuery"
    language="sql"
    :enable-completion="true"
    :minimap="false"
    height="300px"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const sqlQuery = ref(`SELECT * FROM users WHERE status = 1`);
</script>
```

#### 配置文件编辑器 (YAML/JSON)
```vue
<template>
  <MonacoEditor
    v-model="config"
    language="yaml"
    :enable-completion="true"
    height="400px"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const config = ref(`
server:
  port: 8080
  host: localhost
database:
  driver: mysql
  host: localhost
  port: 3306
`);
</script>
```

### 2. 代码对比

#### 脚本版本对比
```vue
<template>
  <MonacoDiff
    :original-value="originalScript"
    :modified-value="modifiedScript"
    language="shell"
    height="600px"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MonacoDiff } from '@vben/common-ui';

const originalScript = ref(`#!/bin/bash
echo "Version 1"
`);

const modifiedScript = ref(`#!/bin/bash
echo "Version 2"
ls -la
`);
</script>
```

### 3. 完整示例：脚本编辑器抽屉

```vue
<template>
  <Drawer
    v-model:open="visible"
    title="编辑脚本"
    width="800px"
  >
    <Form :model="formData" layout="vertical">
      <FormItem label="脚本名称" name="name">
        <Input v-model:value="formData.name" />
      </FormItem>

      <FormItem label="脚本类型" name="language">
        <Select v-model:value="formData.language">
          <SelectOption value="shell">Shell</SelectOption>
          <SelectOption value="python">Python</SelectOption>
          <SelectOption value="sql">SQL</SelectOption>
        </Select>
      </FormItem>

      <FormItem label="脚本内容" name="content">
        <MonacoEditor
          v-model="formData.content"
          :language="formData.language"
          :enable-completion="true"
          :minimap="false"
          height="500px"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="visible = false">取消</Button>
        <Button type="primary" @click="handleSave">保存</Button>
      </Space>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { MonacoEditor } from '@vben/common-ui';
import { Drawer, Form, FormItem, Input, Select, SelectOption, Button, Space, message } from 'ant-design-vue';

const visible = ref(false);
const formData = reactive({
  name: '',
  language: 'shell',
  content: '',
});

const handleSave = () => {
  console.log('保存脚本:', formData);
  message.success('脚本保存成功');
  visible.value = false;
};
</script>
```

## 📖 可用属性

### MonacoEditor Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | - | 编辑器内容 (支持 v-model) |
| `language` | `string` | `'shell'` | 语言模式 |
| `theme` | `'vs' \| 'vs-dark' \| 'hc-black'` | 自动 | 主题 (不设置则自动适配) |
| `readonly` | `boolean` | `false` | 只读模式 |
| `height` | `string \| number` | `'400px'` | 编辑器高度 |
| `enableCompletion` | `boolean` | `false` | 启用代码补全 |
| `minimap` | `boolean` | `true` | 显示小地图 |
| `lineNumbers` | `'on' \| 'off' \| 'relative'` | `'on'` | 行号显示 |

### MonacoDiff Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `originalValue` | `string` | - | 原始内容 |
| `modifiedValue` | `string` | - | 修改后内容 |
| `language` | `string` | `'shell'` | 语言模式 |
| `theme` | `'vs' \| 'vs-dark' \| 'hc-black'` | 自动 | 主题 |
| `height` | `string \| number` | `'600px'` | 编辑器高度 |
| `readonly` | `boolean` | `true` | 只读模式 |

## 🎨 支持的语言

- `shell` - Shell 脚本 (45+ 命令补全)
- `python` - Python (20+ 关键字补全)
- `sql` - SQL (30+ 关键字补全)
- `yaml` - YAML 配置
- `json` - JSON 配置
- `javascript` - JavaScript
- `typescript` - TypeScript
- `markdown` - Markdown
- `xml` - XML
- `html` - HTML
- `css` - CSS

## 💡 代码补全示例

### Shell 命令补全
输入以下命令开头，按 `Ctrl+Space` 触发补全：
- `cd`, `ls`, `pwd`, `mkdir`, `rm`, `cp`, `mv`
- `grep`, `find`, `sed`, `awk`, `tar`, `chmod`
- `systemctl`, `ps`, `top`, `curl`, `wget`, `ssh`

### Python 关键字补全
输入以下关键字开头：
- `def`, `class`, `if`, `for`, `while`, `try`, `import`
- `print`, `len`, `range`, `str`, `int`, `list`, `dict`

### SQL 关键字补全
输入以下关键字开头：
- `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `FROM`, `WHERE`
- `CREATE`, `ALTER`, `DROP`, `TABLE`, `INDEX`
- `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`

## ⚙️ 高级配置

### 自定义编辑器选项
```vue
<MonacoEditor
  v-model="code"
  language="python"
  :enable-completion="true"
  :minimap="true"
  :line-numbers="'on'"
  :readonly="false"
  theme="vs-dark"
  height="500px"
/>
```

### 禁用小地图和行号
```vue
<MonacoEditor
  v-model="code"
  language="json"
  :minimap="false"
  :line-numbers="'off'"
  height="300px"
/>
```

### 只读编辑器
```vue
<MonacoEditor
  v-model="code"
  language="shell"
  :readonly="true"
  height="400px"
/>
```

## 🔧 故障排除

### Q: 代码补全不生效？
A: 确保设置了 `:enable-completion="true"` 并按 `Ctrl+Space` 触发

### Q: 主题不跟随系统切换？
A: 不要手动设置 `theme` 属性，组件会自动检测系统主题

### Q: 编辑器高度异常？
A: 确保父容器有明确的高度，或使用固定高度如 `height="500px"`

### Q: 想添加更多语言补全？
A: 编辑 `packages/effects/common-ui/src/components/monaco-editor/language-config.ts`

## 📚 更多资源

- [Monaco Editor 官方文档](https://microsoft.github.io/monaco-editor/)
- [Vue Monaco Editor](https://github.com/imguolao/monaco-vue)
- [完整集成报告](./MONACO_INTEGRATION_REPORT.md)

---

**提示**: 开发服务器运行在 http://localhost:5175/ ，可以直接访问查看效果！
