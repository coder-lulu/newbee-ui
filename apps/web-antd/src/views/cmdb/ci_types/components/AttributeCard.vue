<script lang="ts">
import { defineComponent } from 'vue';

import {
  BranchesOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  LinkOutlined,
  LockOutlined,
  MoreOutlined,
  NumberOutlined,
  TagOutlined,
} from '@ant-design/icons-vue';
import { Button, Modal, Spin, Tag, Tooltip } from 'ant-design-vue';

export default defineComponent({
  name: 'AttributeCard',
  components: {
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    NumberOutlined,
    FileTextOutlined,
    FieldTimeOutlined,
    ClockCircleOutlined,
    BranchesOutlined,
    LockOutlined,
    LinkOutlined,
    TagOutlined,
    CheckSquareOutlined,
    FontSizeOutlined,
    CalendarOutlined,
    Tag,
    Button,
    Tooltip,
    Spin,
    EyeOutlined,
    EyeInvisibleOutlined,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  emits: ['edit', 'delete', 'toggle-default-show', 'changeListShow'],
  setup(props, { emit }) {
    // 根据属性类型返回对应的图标
    const getAttributeIcon = () => {
      const valueType = props.item.attribute.valueType;
      const iconsMap: { [key: string]: string } = {
        int: 'NumberOutlined', // 整数
        float: 'NumberOutlined', // 浮点数
        text: 'FontSizeOutlined', // 短文本
        longtext: 'FileTextOutlined', // 长文本
        datetime: 'CalendarOutlined', // 日期时间
        date: 'CalendarOutlined', // 日期
        time: 'ClockCircleOutlined', // 时间
        json: 'BranchesOutlined', // JSON
        password: 'LockOutlined', // 密码
        link: 'LinkOutlined', // 链接
        reference: 'TagOutlined', // 引用
        boolean: 'CheckSquareOutlined', // 布尔
      };

      return iconsMap[valueType] || 'FileTextOutlined';
    };

    // 获取属性类型的标签名称
    const getAttributeTypeName = () => {
      const valueType = props.item.attribute.valueType;
      const typeMap: { [key: string]: string } = {
        int: '整数',
        float: '浮点数',
        text: '短文本',
        longtext: '长文本',
        datetime: '日期时间',
        date: '日期',
        time: '时间',
        json: 'JSON',
        password: '密码',
        link: '链接',
        reference: '引用',
        boolean: '布尔',
        image: '图片',
      };

      return typeMap[valueType] || '未知类型';
    };

    // 处理删除操作
    const handleDelete = () => {
      // 如果是继承属性，不允许删除
      if (props.item.isInherited) {
        return;
      }

      Modal.confirm({
        title: '确认删除',
        content: `确定要删除属性 "${props.item.attribute.alias}" 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          emit('delete', props.item);
        },
      });
    };

    // 处理编辑操作
    const handleEdit = () => {
      // 如果是继承属性，不允许编辑
      if (props.item.isInherited) {
        return;
      }
      emit('edit', props.item.attribute);
    };

    // 处理列表显示切换
    const handleToggleListShow = () => {
      // 如果是继承属性，不允许修改列表显示
      if (props.item.isInherited) {
        return;
      }
      emit(
        'changeListShow',
        props.item.ciTypeAttributeId,
        !props.item.listShow,
      );
    };

    // 获取卡片的提示信息
    const getCardTooltip = () => {
      if (props.item.isInherited) {
        return '该属性继承自其它模型，无法进行编辑、删除等操作';
      }
      return props.item.attribute.description || '点击操作按钮进行编辑';
    };

    return {
      getAttributeIcon,
      getAttributeTypeName,
      handleDelete,
      handleEdit,
      handleToggleListShow,
      getCardTooltip,
      EyeOutlined,
      EyeInvisibleOutlined,
    };
  },
});
</script>

<template>
  <div
    class="attribute-card"
    :class="{
      'required-attribute': item.isRequired,
      'unique-attribute': item.isUnique,
      'choice-attribute': item.isChoice,
      'password-attribute': item.isPassword,
      'computed-attribute': item.attribute.isComputed,
      'list-attribute': item.attribute.isList,
      'inherited-attribute': item.isInherited,
    }"
  >
    <div
      v-if="item.listShow && !item.isInherited"
      class="default-show-flag"
      title="默认显示"
    >
      <EyeOutlined style="font-size: 18px; color: #faad14" />
    </div>
    <div
      v-if="item.isInherited"
      class="inherited-flag"
      title="继承属性：此属性继承自父类型，无法编辑或删除"
    >
      <span class="inherited-icon">🧬</span>
      <span class="inherited-text">继承</span>
    </div>
    <Tooltip :title="getCardTooltip()">
      <div class="card-main">
        <div
          class="attribute-type-icon handle"
          :class="{ 'no-drag': item.isInherited }"
        >
          <component :is="getAttributeIcon()" />
        </div>
        <div class="attribute-info">
          <div class="attribute-name" :title="item.attribute.alias">
            {{ item.attribute.alias }}
          </div>
          <div class="attribute-id">{{ item.attribute.name }}</div>
        </div>
        <div class="attribute-type" :title="getAttributeTypeName()">
          {{ getAttributeTypeName() }}
        </div>
      </div>
    </Tooltip>
    <div class="card-divider"></div>
    <div class="card-footer">
      <div class="attribute-tags">
        <Tag
          v-if="true"
          :color="item.isRequired ? 'red' : 'default'"
          :class="{ active: item.isRequired }"
          size="small"
        >
          必填
        </Tag>
        <Tag
          v-if="true"
          :color="item.isUnique ? 'orange' : 'default'"
          :class="{ active: item.isUnique }"
          size="small"
        >
          唯一
        </Tag>
        <Tag
          v-if="true"
          :color="item.attribute.isChoice ? 'green' : 'default'"
          :class="{ active: item.attribute.isChoice }"
          size="small"
        >
          选择
        </Tag>
        <Tag
          v-if="true"
          :color="item.attribute.isList ? 'purple' : 'default'"
          :class="{ active: item.attribute.isList }"
          size="small"
        >
          列表
        </Tag>
        <Tag
          v-if="true"
          :color="item.isEdit ? 'blue' : 'default'"
          :class="{ active: item.isEdit }"
          size="small"
        >
          编辑
        </Tag>
      </div>
    </div>
    <!-- 只有非继承属性才显示操作按钮 -->
    <div v-if="!item.isInherited" class="card-actions">
      <Button size="small" type="text" title="编辑属性" @click="handleEdit">
        <EditOutlined />
      </Button>
      <Button size="small" type="text" title="删除属性" @click="handleDelete">
        <DeleteOutlined style="color: #f5222d" />
      </Button>
      <Button
        size="small"
        type="text"
        :title="item.listShow ? '取消列表显示' : '设为列表显示'"
        @click="handleToggleListShow"
      >
        <component
          :is="item.listShow ? 'EyeOutlined' : 'EyeInvisibleOutlined'"
        />
      </Button>
    </div>
  </div>
</template>

<style scoped>
.attribute-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 200px;
  max-width: 200px;
  height: auto;
  min-height: 100px;
  padding: 0;
  margin: 10px 0 12px;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #eaedf1;
  border-radius: 1px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
  transition: all 0.3s ease;
}

.attribute-card:hover {
  z-index: 2;
  border-color: #40a9ff;
  box-shadow: 0 6px 16px rgb(24 144 255 / 15%);
  transform: translateY(-4px);
}

.card-main {
  position: relative;
  display: flex;
  flex: 2;
  min-height: 62px;
  padding: 16px 14px 15px;
  background-color: #f6f9fc;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.attribute-type-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  font-size: 15px;
  color: #fff;
  background-color: #1890ff;
  border-radius: 8px;
  box-shadow: 0 3px 5px rgb(24 144 255 / 30%);
  transition: transform 0.2s ease;
}

.attribute-card:hover .attribute-type-icon {
  transform: scale(1.08);
}

.handle {
  cursor: move; /* 仅图标区域可拖拽 */
}

.required-attribute .attribute-type-icon {
  background-color: #ff4d4f;
  box-shadow: 0 3px 5px rgb(255 77 79 / 30%);
}

.unique-attribute .attribute-type-icon {
  background-color: #fa8c16;
  box-shadow: 0 3px 5px rgb(250 140 22 / 30%);
}

.choice-attribute .attribute-type-icon {
  background-color: #52c41a;
  box-shadow: 0 3px 5px rgb(82 196 26 / 30%);
}

.password-attribute .attribute-type-icon {
  background-color: #722ed1;
  box-shadow: 0 3px 5px rgb(114 46 209 / 30%);
}

.computed-attribute .attribute-type-icon {
  background-color: #eb2f96;
  box-shadow: 0 3px 5px rgb(235 47 150 / 30%);
}

.list-attribute .attribute-type-icon {
  background-color: #13c2c2;
  box-shadow: 0 3px 5px rgb(19 194 194 / 30%);
}

.inherited-attribute {
  cursor: default;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  opacity: 0.9;
}

.inherited-attribute .attribute-type-icon {
  background-color: #6c757d;
  box-shadow: 0 3px 5px rgb(108 117 125 / 30%);
}

.inherited-attribute .card-main {
  background-color: #f1f3f4;
}

.inherited-attribute .card-footer {
  background-color: #f8f9fa;
}

.attribute-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.attribute-name {
  margin-bottom: 5px;
  overflow: hidden;
  font-size: 15px;
  line-height: 1.4;
  color: #111927;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attribute-id {
  margin-top: 2px;
  overflow: hidden;
  font-size: 12px;
  color: #64748b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-divider {
  height: 1px;
  margin: 0;
  background-color: #f0f2f5;
}

.card-footer {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  max-height: 30px;
  padding: 8px 12px;
  margin-top: auto;
  background-color: #fdfdfd;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
}

.attribute-tags {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 1px;
}

.attribute-tags :deep(.ant-tag) {
  padding: 1px 6px;
  margin: 0;
  font-size: 10px;

  /* font-weight: 440; */
  line-height: 16px;
  color: #909399;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 1px;
  opacity: 0.7;
  transition: all 0.2s ease-in-out;
}

.attribute-tags :deep(.ant-tag.active) {
  opacity: 1;
}

.attribute-tags :deep(.ant-tag-red.active) {
  color: #f5222d;
  background: #fff1f0;
  border-color: #ffa39e;
}

.attribute-tags :deep(.ant-tag-orange.active) {
  color: #fa8c16;
  background: #fff7e6;
  border-color: #ffd591;
}

.attribute-tags :deep(.ant-tag-blue.active) {
  color: #1890ff;
  background: #e6f7ff;
  border-color: #91d5ff;
}

.attribute-tags :deep(.ant-tag-green.active) {
  color: #52c41a;
  background: #f6ffed;
  border-color: #b7eb8f;
}

.attribute-tags :deep(.ant-tag-purple.active) {
  color: #722ed1;
  background: #f9f0ff;
  border-color: #d3adf7;
}

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: none;
  padding: 3px 6px;
  background-color: rgb(255 255 255 / 95%);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
  transition: all 0.2s ease;
}

.attribute-card:hover .card-actions {
  display: flex;
  gap: 6px;
}

.card-actions :deep(.ant-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 14px;
  transition: all 0.2s;
}

.card-actions :deep(.ant-btn:hover) {
  background-color: #f5f5f5;
}

.attribute-type {
  position: absolute;
  bottom: 1px;
  left: 1px;
  z-index: 1;
  padding: 2px 5px;
  font-size: 11px;
  font-weight: 500;
  color: #379fff;
  white-space: nowrap;
  background-color: rgb(230 247 255 / 85%);
  border-radius: 6px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
}

/* 
  当前样式是使用更小的长方形布局，宽度为160px，高度为68px。
  如需恢复为方形布局，修改为:
  width: 172px;
  height: 172px;
  
  如需使用条形布局，可修改为:
  width: 100%;
  height: 40px;
  
  同时需要调整card-main的布局方式为水平排列。
*/

.default-show-flag {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 11;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  background: rgb(255 255 255 / 85%);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
}

.inherited-flag {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 12;
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  backdrop-filter: blur(4px);
  border: 1px solid #dee2e6;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 10%);
}

.inherited-icon {
  font-size: 12px;
  filter: grayscale(0.3);
}

.inherited-text {
  letter-spacing: 0.5px;
}

.no-drag {
  cursor: default !important;
}

.inherited-attribute:hover {
  border-color: #d6d9dc;
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  transform: none;
}
</style>
