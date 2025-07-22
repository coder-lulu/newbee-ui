<script lang="ts">
import type { AttributeGroup, AttributeItem } from '#/api/cmdb/ci_types/model';

import { defineComponent, onMounted, reactive, ref, watch } from 'vue';

import {
  AppstoreOutlined,
  BranchesOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  HolderOutlined,
  KeyOutlined,
  LinkOutlined,
  LockOutlined,
  MoreOutlined,
  NumberOutlined,
  PictureOutlined,
  PlusOutlined,
  UpOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Col,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  Menu,
  message,
  Modal,
  Row,
  Spin,
  Tag,
  Tooltip,
} from 'ant-design-vue';
import draggable from 'vuedraggable/src/vuedraggable';

import {
  addCiTypeAttribute,
  changeCiTypeAttributeListShow,
  deleteAttributeGroup,
  deleteCiTypeAttribute,
  listAttributeGroupWithAttribute,
  sortAttributeGroup,
  sortCiTypeAttributeGroupItem,
  updateCiTypeAttribute,
} from '#/api/cmdb/ci_types';

import AddAttributeCard from './AddAttributeCard.vue';
import CiAttributeGroupEditModal from './attr-group-modal.vue';
import AttributeCard from './AttributeCard.vue';
import AttributeForm from './AttributeForm.vue';

export default defineComponent({
  name: 'AttributeProperties',
  components: {
    CiAttributeGroupEditModal,
    PlusOutlined,
    KeyOutlined,
    UpOutlined,
    DownOutlined,
    NumberOutlined,
    FontSizeOutlined,
    FieldTimeOutlined,
    AppstoreOutlined,
    CheckSquareOutlined,
    BranchesOutlined,
    FileTextOutlined,
    LinkOutlined,
    LockOutlined,
    CalendarOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    HolderOutlined,
    AttributeCard,
    AddAttributeCard,
    AttributeForm,
    Spin,
    Button,
    Tooltip,
    Row,
    Col,
    Modal,
    Drawer,
    AForm: Form,
    AFormItem: Form.Item,
    Input,
    Tag,
    Empty,
    Draggable: draggable,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
  },
  props: {
    typeId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    // 状态
    const loading = ref(false);
    const attributeGroups = ref<AttributeGroup[]>([]);
    const editDrawerVisible = ref(false);
    const currentAttributeId = ref<number | undefined>(undefined);
    const currentGroupId = ref<number | undefined>(undefined);
    const currentTypeId = ref<number | undefined>(undefined);
    const uniqueValidationModalVisible = ref(false);
    const newGroup = reactive({
      Name: '',
    });
    const selectedFilters = ref<string[]>([]);
    const ciAttributeGroupModalRef = ref<null | {
      open: () => void;
      setData: (data: any) => void;
    }>(null);

    // 类型过滤选项
    const filterTypeOptions = [
      { value: 'int', label: '整数', icon: NumberOutlined },
      { value: 'float', label: '浮点数', icon: NumberOutlined },
      { value: 'text', label: '短文本', icon: FontSizeOutlined },
      { value: 'longtext', label: '长文本', icon: FileTextOutlined },
      { value: 'datetime', label: '日期时间', icon: CalendarOutlined },
      { value: 'date', label: '日期', icon: CalendarOutlined },
      { value: 'time', label: '时间', icon: FieldTimeOutlined },
      { value: 'json', label: 'JSON', icon: BranchesOutlined },
      { value: 'password', label: '密码', icon: LockOutlined },
      { value: 'link', label: '链接', icon: LinkOutlined },
      { value: 'reference', label: '引用', icon: AppstoreOutlined },
      { value: 'boolean', label: '布尔', icon: CheckSquareOutlined },
      { value: 'image', label: '图片', icon: PictureOutlined },
    ];

    // 加载属性数据
    const loadAttributeData = async () => {
      loading.value = true;
      try {
        // 这里应该调用实际的API
        // 模拟API调用
        const response = await listAttributeGroupWithAttribute(props.typeId);
        // 适配后端返回结构，处理 items 字段
        attributeGroups.value = (response as any[])
          .map((group) => {
            let items: any[] = Array.isArray(group.items) ? group.items : [];
            // 按 sort 升序排序
            items = [...items].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
            return {
              ...group,
              items,
            };
          })
          .sort((a, b) => a.sort - b.sort);
      } catch (error) {
        console.error('加载属性数据失败:', error);
        message.error('加载属性数据失败');
      } finally {
        loading.value = false;
      }
    };

    // 过滤属性
    const filteredAttributes = (items: AttributeItem[]) => {
      if (selectedFilters.value.length === 0) {
        return items;
      }
      return items.filter((item) =>
        selectedFilters.value.includes(item.attribute?.valueType ?? ''),
      );
    };

    // 切换过滤器
    const toggleFilter = (type: string) => {
      const index = selectedFilters.value.indexOf(type);
      if (index === -1) {
        selectedFilters.value.push(type);
      } else {
        selectedFilters.value.splice(index, 1);
      }
      // 强制刷新所有分组的属性显示
      attributeGroups.value = [...attributeGroups.value];
    };

    // 上下移动分组
    const moveGroup = (index: number, direction: 'down' | 'up') => {
      if (direction === 'up' && index > 0) {
        const current = attributeGroups.value[index];
        const previous = attributeGroups.value[index - 1];

        if (current && previous) {
          attributeGroups.value[index] = previous;
          attributeGroups.value[index - 1] = current;
        }
      } else if (
        direction === 'down' &&
        index < attributeGroups.value.length - 1
      ) {
        const current = attributeGroups.value[index];
        const next = attributeGroups.value[index + 1];

        if (current && next) {
          attributeGroups.value[index] = next;
          attributeGroups.value[index + 1] = current;
        }
      }
      // 重新排序
      attributeGroups.value.forEach((group, idx) => {
        group.sort = idx + 1;
      });

      // 保存排序
      saveGroupOrder();
    };

    // 保存分组排序
    const saveGroupOrder = async () => {
      try {
        // 获取所有分组排序信息
        const groupSortInfos = attributeGroups.value.map((group, index) => ({
          groupId: group.groupId,
          name: group.name,
          sort: index + 1, // 根据当前顺序重新计算排序值
        }));
        console.log('保存分组排序:', groupSortInfos);
        await sortAttributeGroup(groupSortInfos);
      } catch (error) {
        console.error('保存分组排序失败:', error);
        message.error('保存分组排序失败');
      }
    };

    // 处理分组排序
    const handleGroupSort = async (event: any) => {
      try {
        if (event.moved) {
          // 重新排序
          attributeGroups.value.forEach((group, idx) => {
            group.sort = idx + 1;
          });

          // 保存排序
          saveGroupOrder();
        }
      } catch (error) {
        console.error('分组排序失败:', error);
        message.error('分组排序失败');
      }
    };

    // 处理添加分组
    function handleAddAttrGroup() {
      if (ciAttributeGroupModalRef.value) {
        ciAttributeGroupModalRef.value.setData({ typeId: props.typeId });
        ciAttributeGroupModalRef.value.open();
      } else {
        Modal.confirm({
          title: '添加分组',
          content: '模态框组件未正确初始化',
          onOk: () => {
            message.info('请确保CiAttributeGroupEditModal组件已正确注册');
          },
        });
      }
    }

    // 处理编辑分组
    function handleEditGroup(groupId: number) {
      if (ciAttributeGroupModalRef.value) {
        ciAttributeGroupModalRef.value.setData({ id: groupId });
        ciAttributeGroupModalRef.value.open();
      } else {
        Modal.confirm({
          title: '编辑分组',
          content: `模态框组件未正确初始化，无法编辑分组 ID: ${groupId}`,
          onOk: () => {
            message.info('请确保CiAttributeGroupEditModal组件已正确注册');
          },
        });
      }
    }

    // 唯一校验
    const handleUniqueValidation = () => {
      uniqueValidationModalVisible.value = true;
    };

    // 保存唯一校验
    const saveUniqueValidation = async () => {
      try {
        // 保存唯一校验规则
        uniqueValidationModalVisible.value = false;
        message.success('唯一校验规则保存成功');
      } catch (error) {
        console.error('保存唯一校验规则失败:', error);
        message.error('保存唯一校验规则失败');
      }
    };

    // 添加属性
    const handleAddAttribute = (groupIndex: number) => {
      editDrawerVisible.value = true;
      currentAttributeId.value = undefined;
      currentGroupId.value = attributeGroups.value[groupIndex]?.groupId;
      currentTypeId.value = props.typeId;
      console.log(props.typeId);
    };

    // 编辑属性
    const handleEditAttribute = (item: AttributeItem) => {
      editDrawerVisible.value = true;
      currentAttributeId.value = item.ciTypeAttributeId;
      currentGroupId.value = item.groupId;
      currentTypeId.value = item.typeId;
    };

    // 删除属性
    const handleDeleteAttribute = async (attributeItem: AttributeItem) => {
      console.log(attributeItem);
      try {
        if (attributeItem.ciTypeAttributeId) {
          await deleteCiTypeAttribute([attributeItem.ciTypeAttributeId]);
          await loadAttributeData();
        }
      } catch (error) {
        console.error('删除属性失败:', error);
        message.error('删除属性失败');
      }
    };

    // 保存属性
    const createAttribute = async (result: any) => {
      try {
        await addCiTypeAttribute(result);
        // 关闭抽屉
        editDrawerVisible.value = false;
        await loadAttributeData();
      } catch (error) {
        console.error('保存属性失败:', error);
        message.error('保存属性失败');
      }
    };

    // 保存属性
    const updateAttribute = async (result: any) => {
      console.log(result);
      try {
        delete result.attribute.name;
        delete result.attribute.isList;
        delete result.attrIds;
        delete result.ciTypeAttributeId;
        delete result.groupId;
        delete result.sort;
        delete result.valueType;

        await updateCiTypeAttribute(result);
        // 关闭抽屉
        editDrawerVisible.value = false;
        await loadAttributeData();
      } catch (error) {
        console.error('保存属性失败:', error);
        message.error('保存属性失败');
      }
    };

    // 关闭编辑抽屉
    const closeEditDrawer = () => {
      editDrawerVisible.value = false;
    };

    // 处理默认显示切换
    const handleChangeListShow = async (id: number, listShow: boolean) => {
      await changeCiTypeAttributeListShow(id, listShow);
      await loadAttributeData();
    };

    // 处理属性排序
    const handleAttributeSort = async (groupId: number, event: any) => {
      try {
        if (event.added || event.moved) {
          // 检查是否试图拖拽继承属性
          if (
            event.added?.element?.isInherited ||
            event.moved?.element?.isInherited
          ) {
            console.warn('继承属性不允许拖拽排序');
            return;
          }

          // 构建排序信息对象数组
          const sortedGroups = [];

          // 当前分组信息
          const currentGroup = attributeGroups.value.find(
            (g) => g.groupId === groupId,
          );
          if (currentGroup) {
            // 只对非继承属性进行排序，继承属性保持原有排序
            const nonInheritedItems = currentGroup.items.filter(
              (item) => !item.isInherited,
            );
            const inheritedItems = currentGroup.items.filter(
              (item) => item.isInherited,
            );

            // 为非继承属性重新分配排序值
            const sortedItems = nonInheritedItems.map((item, index) => ({
              id: item.id,
              sort: index + 1,
            }));

            // 如果有继承属性，保持它们的原始排序值不变
            const inheritedSortItems = inheritedItems.map((item) => ({
              id: item.id,
              sort: item.sort || 0, // 保持原有排序值
            }));

            sortedGroups.push({
              groupId: currentGroup.groupId,
              items: [...sortedItems, ...inheritedSortItems],
            });
          }

          // 如果是跨分组拖拽，还需要添加源分组的排序信息
          if (event.added) {
            // 找到源分组
            const fromElement = event.added.element;
            if (fromElement && event.added.from !== event.added.to) {
              // 查找所有可能是源分组的分组
              attributeGroups.value.forEach((group) => {
                // 跳过当前目标分组
                if (group.groupId === groupId) return;

                // 如果这个分组包含了相同ID的元素，它可能是源分组，但可能已经移除了元素
                const hasElement = group.items.some(
                  (item) => item.id === fromElement.id,
                );

                // 如果源分组的ID在from字符串中，或者这个分组有相同ID的元素
                if (
                  event.added.from.includes(String(group.groupId)) ||
                  hasElement
                ) {
                  // 同样只对非继承属性进行排序
                  const nonInheritedItems = group.items.filter(
                    (item) => !item.isInherited,
                  );
                  const inheritedItems = group.items.filter(
                    (item) => item.isInherited,
                  );

                  const sortedItems = nonInheritedItems.map((item, index) => ({
                    id: item.id,
                    sort: index + 1,
                  }));

                  const inheritedSortItems = inheritedItems.map((item) => ({
                    id: item.id,
                    sort: item.sort || 0,
                  }));

                  sortedGroups.push({
                    groupId: group.groupId,
                    items: [...sortedItems, ...inheritedSortItems],
                  });
                }
              });
            }
          }

          // 实际API调用应该在此处理
          await sortCiTypeAttributeGroupItem(sortedGroups);
          // await loadAttributeData();
        }
      } catch (error) {
        console.error('更新属性排序失败:', error);
        message.error('更新属性排序失败');
      }
    };

    // 删除分组
    const handleDeleteGroup = async (group: AttributeGroup) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除分组"${group.name}"吗？`,
        okType: 'danger',
        onOk: async () => {
          const index = attributeGroups.value.findIndex(
            (g) => g.groupId === group.groupId,
          );
          if (index !== -1) {
            // 删除分组
            try {
              await deleteAttributeGroup([group.groupId]);
              attributeGroups.value.splice(index, 1);
            } catch (error) {
              console.error('删除分组失败:', error);
            }
          }
        },
      });
    };

    // 处理重命名分组
    const handleRenameGroup = (groupId: number) => {
      if (ciAttributeGroupModalRef.value) {
        ciAttributeGroupModalRef.value.setData({ id: groupId });
        ciAttributeGroupModalRef.value.open();
      } else {
        Modal.confirm({
          title: '重命名分组',
          content: `模态框组件未正确初始化，无法重命名分组 ID: ${groupId}`,
          onOk: () => {
            message.info('请确保CiAttributeGroupEditModal组件已正确注册');
          },
        });
      }
    };

    // 更新分组项目（合并继承属性和非继承属性的新顺序）
    const updateGroupItems = (
      group: AttributeGroup,
      newItems: AttributeItem[],
    ) => {
      // 获取继承属性（保持原有顺序）
      const inheritedItems = group.items.filter((item) => item.isInherited);
      // 更新分组的items，继承属性在前，非继承属性在后
      group.items = [...inheritedItems, ...newItems];
    };

    // 监听typeId变化，重新加载数据
    watch(
      () => props.typeId,
      (newValue) => {
        if (newValue) {
          loadAttributeData();
        }
      },
    );

    // 组件挂载时加载数据
    onMounted(() => {
      if (props.typeId) {
        loadAttributeData();
      }
    });

    return {
      loading,
      attributeGroups,
      editDrawerVisible,
      currentAttributeId,
      currentGroupId,
      currentTypeId,
      uniqueValidationModalVisible,
      newGroup,
      selectedFilters,
      filterTypeOptions,
      filteredAttributes,
      toggleFilter,
      moveGroup,
      handleEditGroup,
      handleAddAttrGroup,
      loadAttributeData,
      handleUniqueValidation,
      saveUniqueValidation,
      handleAddAttribute,
      handleEditAttribute,
      handleDeleteAttribute,
      createAttribute,
      updateAttribute,
      closeEditDrawer,
      handleAttributeSort,
      handleGroupSort,
      handleDeleteGroup,
      ciAttributeGroupModalRef,
      handleRenameGroup,
      handleChangeListShow,
      updateGroupItems,
    };
  },
});
</script>

<template>
  <div class="attribute-properties">
    <div class="attribute-header">
      <div class="left-actions">
        <Button @click="handleAddAttrGroup">
          <template #icon><PlusOutlined /></template>
          添加分组
        </Button>
      </div>
      <div class="filter-buttons">
        <Tooltip
          v-for="type in filterTypeOptions"
          :key="type.value"
          :title="type.label"
        >
          <Button
            class="filter-button"
            :type="selectedFilters.includes(type.value) ? 'primary' : 'default'"
            shape="circle"
            size="small"
            @click="toggleFilter(type.value)"
          >
            <component :is="type.icon" />
          </Button>
        </Tooltip>
      </div>
    </div>

    <Spin :spinning="loading">
      <div v-if="attributeGroups.length > 0" class="attribute-groups">
        <!-- 显示过滤状态（移到分组列表上方） -->
        <div v-if="selectedFilters.length > 0" class="filter-status">
          <span>已筛选: </span>
          <span
            v-for="filter in selectedFilters"
            :key="filter"
            class="filter-tag"
          >
            {{
              filterTypeOptions.find((opt) => opt.value === filter)?.label ||
              filter
            }}
          </span>
          <a @click="selectedFilters = []">清除</a>
        </div>

        <Draggable
          v-model="attributeGroups"
          item-key="groupId"
          handle=".group-handle"
          animation="300"
          ghost-class="ghost-group"
          chosen-class="chosen-group"
          :group="{ name: 'GROUPS_ONLY', pull: 'clone', put: ['GROUPS_ONLY'] }"
          @change="handleGroupSort"
        >
          <template #item="{ element: group }">
            <div class="attribute-group">
              <div class="group-header">
                <div class="group-title">
                  <span class="group-handle">
                    <HolderOutlined />
                  </span>
                  <span class="group-handle">
                    <i class="drag-handle-icon"></i>
                  </span>
                  <span class="group-name">{{ group.name }}</span>
                  <span class="group-count">
                    ({{ filteredAttributes(group.items).length }})
                  </span>
                </div>
                <div class="group-actions">
                  <ADropdown>
                    <Button type="text" size="small">
                      <MoreOutlined />
                    </Button>
                    <template #overlay>
                      <AMenu>
                        <AMenuItem
                          @click="
                            () => {
                              console.log('点击添加属性卡片');
                              const idx = attributeGroups.indexOf(group);
                              console.log('分组索引:', idx);
                              handleAddAttribute(idx);
                            }
                          "
                        >
                          <PlusOutlined />
                          <span>新增属性</span>
                        </AMenuItem>
                        <AMenuItem @click="handleEditGroup(group.groupId)">
                          <EditOutlined />
                          <span>重命名分组</span>
                        </AMenuItem>
                        <AMenuItem @click="handleDeleteGroup(group)">
                          <DeleteOutlined />
                          <span>删除分组</span>
                        </AMenuItem>
                      </AMenu>
                    </template>
                  </ADropdown>
                </div>
              </div>

              <div class="attributes-container">
                <div class="attribute-cards-wrapper">
                  <!-- 不可拖拽的继承属性（显示在上方） -->
                  <template
                    v-for="element in group.items.filter(
                      (item) => item.isInherited,
                    )"
                  >
                    <div
                      v-if="filteredAttributes([element]).length > 0"
                      :key="element.id"
                      class="attribute-card-item inherited-item"
                    >
                      <AttributeCard
                        :item="element"
                        @edit="handleEditAttribute(element)"
                        @delete="handleDeleteAttribute"
                        @change-list-show="handleChangeListShow"
                      />
                    </div>
                  </template>

                  <!-- 可拖拽的非继承属性（显示在继承属性下方） -->
                  <Draggable
                    :model-value="
                      group.items.filter((item) => !item.isInherited)
                    "
                    @update:model-value="updateGroupItems(group, $event)"
                    :group="{
                      name: 'ATTRIBUTES_ONLY',
                      pull: true,
                      put: ['ATTRIBUTES_ONLY'],
                    }"
                    item-key="id"
                    handle=".handle"
                    animation="300"
                    ghost-class="ghost-card"
                    chosen-class="chosen-card"
                    @change="handleAttributeSort(group.groupId, $event)"
                    class="attribute-cards"
                  >
                    <template #item="{ element }">
                      <div
                        v-if="filteredAttributes([element]).length > 0"
                        class="attribute-card-item"
                      >
                        <AttributeCard
                          :item="element"
                          @edit="handleEditAttribute(element)"
                          @delete="handleDeleteAttribute"
                          @change-list-show="handleChangeListShow"
                        />
                      </div>
                    </template>
                  </Draggable>

                  <!-- 添加属性按钮（显示在最后） -->
                  <div class="attribute-card-item">
                    <AddAttributeCard
                      @click="
                        () => {
                          console.log('点击添加属性卡片');
                          const idx = attributeGroups.indexOf(group);
                          console.log('分组索引:', idx);
                          handleAddAttribute(idx);
                        }
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Draggable>
      </div>
      <Empty v-else description="暂无数据" />
    </Spin>

    <!-- 编辑属性的抽屉 -->
    <Drawer
      :open="editDrawerVisible"
      :title="currentAttributeId ? '编辑属性' : '新增属性'"
      width="700"
      placement="right"
      @close="closeEditDrawer"
      :closable="true"
      :mask="true"
      :keyboard="true"
    >
      <AttributeForm
        v-if="editDrawerVisible"
        :id="currentAttributeId"
        :type-id="currentTypeId"
        :group-id="currentGroupId"
        @create="createAttribute"
        @update="updateAttribute"
        @cancel="closeEditDrawer"
        @refresh="loadAttributeData"
        @reload="
          () => {
            closeEditDrawer();
            loadAttributeData();
          }
        "
      />
    </Drawer>

    <!-- 唯一校验的弹窗 -->
    <Modal
      v-model="uniqueValidationModalVisible"
      title="唯一校验设置"
      width="700px"
      @ok="saveUniqueValidation"
      @cancel="uniqueValidationModalVisible = false"
    >
      <p>在此设置唯一校验规则...</p>
      <!-- 唯一校验设置内容 -->
    </Modal>
    <CiAttributeGroupEditModal
      ref="ciAttributeGroupModalRef"
      @reload="loadAttributeData"
    />
  </div>
</template>

<style scoped>
/* 响应式布局调整 - 根据屏幕宽度自适应列数 */
@media (min-width: 1200px) {
  .attribute-card-item {
    max-width: calc(20% - 12.8px); /* 5列 */
  }
}

@media (min-width: 1600px) {
  .attribute-card-item {
    max-width: calc(16.666% - 13.33px); /* 6列 */
  }
}

@media (min-width: 2000px) {
  .attribute-card-item {
    max-width: calc(14.285% - 13.71px); /* 7列 */
  }
}

@media (max-width: 768px) {
  .attribute-card-item {
    min-width: 200px;
    max-width: calc(50% - 8px); /* 小屏幕最多2列 */
  }
}

@media (max-width: 480px) {
  .attribute-card-item {
    min-width: 180px;
    max-width: 100%; /* 极小屏幕1列 */
  }
}

.attribute-properties {
  min-height: 100%;
  padding: 0 16px 16px;
  border-radius: 4px;
}

.attribute-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 16px;
  margin-bottom: 20px;

  /* background-color: #fff; */
  border-radius: 4px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
}

.left-actions {
  display: flex;
  gap: 12px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.attribute-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.attribute-group {
  padding-bottom: 16px;
  margin-bottom: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
}

.group-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 12px;
  cursor: grab;
  background-color: #ceddf9;
  border-bottom: 1px dashed #e8eaed;
}

/* 添加拖拽标识 - 禁止区域 */
.attribute-group::after {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: none;
  pointer-events: none;
  content: '';
  background-color: rgb(255 0 0 / 10%);
  border: 2px dashed #ff4d4f;
}

/* 拖拽分组时显示禁止区域 */
.attributeGroups-ghost .attribute-group::after {
  display: block;
}

.group-title {
  display: flex;
  align-items: center;
}

/* 更新拖拽图标样式 */
.group-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 16px;
  color: #1890ff;
  cursor: move;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.drag-handle-icon {
  display: inline-block;
  width: 10px;
  height: 14px;
  background-image: linear-gradient(
    to bottom,
    #ccc 1px,
    transparent 1px,
    transparent 2px,
    #ccc 2px,
    transparent 3px,
    transparent 4px,
    #ccc 4px,
    transparent 5px,
    transparent 6px,
    #ccc 6px
  );
  background-repeat: repeat;
  background-size: 6px 6px;
  opacity: 0.6;
}

.group-handle:hover .drag-handle-icon {
  opacity: 1;
}

.group-name {
  font-size: 16px;
  font-weight: 500;
  color: #1890ff;
}

.group-count {
  padding: 0 8px;
  margin-left: 8px;
  font-size: 14px;
  color: rgb(0 0 0 / 45%);
  background-color: #f0f0f0;
  border-radius: 10px;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.attributes-container {
  padding: 4px 16px 16px;
  overflow: hidden;
}

.attribute-cards-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
}

.attribute-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}

.attribute-card-item {
  box-sizing: border-box;
  flex: 1 1 200px; /* 自适应宽度，最小200px */
  min-width: 200px;
  transition: all 0.3s ease;
}

.empty-data {
  padding: 40px 0;
  text-align: center;
  background-color: #fff;
  border-radius: 4px;
}

/* 拖拽相关样式 */
.ghost-card {
  background: #c8ebfb;
  border: 1px solid #1890ff !important;
  opacity: 0.5;
}

.chosen-card {
  border: 1px solid #1890ff !important;
  box-shadow: 0 3px 10px rgb(24 144 255 / 30%) !important;
}

.ghost-group {
  background: #e6f7ff !important;
  border: 1px dashed #1890ff !important;
  opacity: 0.8;
}

.chosen-group {
  border: 1px solid #1890ff !important;
  box-shadow: 0 3px 15px rgb(24 144 255 / 20%) !important;
}

.filter-status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px 16px;
  font-size: 13px;
  background-color: #f0f7ff;
  border-radius: 4px;
}

.filter-status span {
  color: #333;
}

.filter-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: #1890ff;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 2px;
}

.filter-status a {
  margin-left: auto;
  color: #1890ff;
  cursor: pointer;
}

.filter-status a:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 继承属性的样式 */
.inherited-item {
  cursor: default !important;
}

.inherited-item .attribute-card {
  cursor: default !important;
}

.inherited-item .handle {
  cursor: default !important;
}

/* 继承属性的视觉提示 */
.inherited-item:hover {
  opacity: 0.8;
}

.inherited-item .attribute-card:hover {
  border-color: #d6d9dc !important;
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%) !important;
  transform: none !important;
}

/* 响应式布局调整 - 使用CSS Grid自适应布局 */
</style>
