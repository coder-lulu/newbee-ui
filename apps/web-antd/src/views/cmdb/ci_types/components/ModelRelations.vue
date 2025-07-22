<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
} from 'ant-design-vue';

// 关系类型接口
interface RelationType {
  id: number;
  name: string;
}

// 模型关系接口
interface ModelRelation {
  parentId: number;
  childId: number;
  relationTypeId: number;
  constraint: number; // 0: 一对多, 1: 多对多, 2: 多对一
  parentAttrIds: number[];
  childAttrIds: number[];
  // 额外的显示字段
  parentName?: string;
  childName?: string;
  relationTypeName?: string;
  constraintName?: string;
}

// 属性接口
interface ModelAttribute {
  id: number;
  name: string;
  alias: string;
}

// 模型信息接口
interface ModelInfo {
  id: number;
  name: string;
  attributes: ModelAttribute[];
}

export default defineComponent({
  name: 'ModelRelations',
  components: {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ASelect: Select,
    ASelectOption: Select.Option,
    AForm: Form,
    AFormItem: Form.Item,
    AInput: Input,
    ATable: Table,
    ATableColumn: Table.Column,
    AButton: Button,
    ASpace: Space,
    ADivider: Divider,
    ASpin: Spin,
    ARow: Row,
    ACol: Col,
    AModal: Modal,
  },
  props: {
    typeId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    // 加载状态
    const loading = ref(false);

    // 数据
    const relations = ref<ModelRelation[]>([]);
    const relationTypes = ref<RelationType[]>([]);
    const allModels = ref<ModelInfo[]>([]);

    // 搜索条件
    const searchForm = reactive({
      relationTypeId: undefined as number | undefined,
      keyword: '',
    });

    // 编辑相关
    const editModalVisible = ref(false);
    const editingRelation = ref<null | Partial<ModelRelation>>(null);

    // 表单绑定字段
    const parentModelId = ref<number>();
    const childModelId = ref<number>();
    const relationTypeId = ref<number>();
    const constraintType = ref<number>(0);

    // 选中的模型属性
    const selectedParentAttributes = ref<number[]>([]);
    const selectedChildAttributes = ref<number[]>([]);

    // 关系约束选项
    const constraintOptions = [
      { value: 0, label: '一对多' },
      { value: 1, label: '多对多' },
      { value: 2, label: '多对一' },
    ];

    // 获取关系类型名称
    const getRelationTypeName = (relationTypeId: number) => {
      const found = relationTypes.value.find(
        (item) => item.id === relationTypeId,
      );
      return found ? found.name : '';
    };

    // 获取约束关系名称
    const getConstraintName = (constraint: number) => {
      const found = constraintOptions.find((item) => item.value === constraint);
      return found ? found.label : '';
    };

    // 获取模型名称
    const getModelName = (modelId: number) => {
      const found = allModels.value.find((item) => item.id === modelId);
      return found ? found.name : '';
    };

    // 加载数据
    const loadData = async () => {
      loading.value = true;
      try {
        // 实际项目中应该调用API
        // const [relationResp, typesResp, modelsResp] = await Promise.all([
        //   fetchModelRelations(props.typeId),
        //   fetchRelationTypes(),
        //   fetchAllModels()
        // ]);

        // 模拟API响应
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 模拟关系类型数据
        relationTypes.value = [
          { id: 1, name: 'contain' },
          { id: 2, name: 'deploy' },
          { id: 3, name: 'install' },
          { id: 4, name: 'connect' },
        ];

        // 模拟所有模型数据
        allModels.value = [
          {
            id: 2,
            name: '服务器',
            attributes: [
              { id: 7, name: 'cpu', alias: 'CPU' },
              { id: 8, name: 'memory', alias: '内存' },
              { id: 9, name: 'disk', alias: '磁盘' },
            ],
          },
          {
            id: 3,
            name: '网络设备',
            attributes: [
              { id: 13, name: 'ip', alias: 'IP地址' },
              { id: 14, name: 'mac', alias: 'MAC地址' },
            ],
          },
          {
            id: 4,
            name: '应用',
            attributes: [
              { id: 18, name: 'app_name', alias: '应用名称' },
              { id: 19, name: 'version', alias: '版本' },
              { id: 20, name: 'port', alias: '端口' },
              { id: 21, name: 'status', alias: '状态' },
            ],
          },
          {
            id: 45,
            name: '硬盘',
            attributes: [
              { id: 10, name: 'size', alias: '容量' },
              { id: 11, name: 'type', alias: '类型' },
              { id: 12, name: 'manufacturer', alias: '制造商' },
            ],
          },
          {
            id: 67,
            name: '交换机',
            attributes: [
              { id: 15, name: 'brand', alias: '品牌' },
              { id: 16, name: 'port_count', alias: '端口数量' },
              { id: 17, name: 'management_ip', alias: '管理IP' },
            ],
          },
          {
            id: 89,
            name: '容器',
            attributes: [
              { id: 22, name: 'container_id', alias: '容器ID' },
              { id: 23, name: 'image', alias: '镜像' },
            ],
          },
        ];

        // 模拟关系数据
        const rawRelations = [
          {
            parentId: 2,
            childId: 45,
            relationTypeId: 1,
            constraint: 0,
            parentAttrIds: [7, 8, 9],
            childAttrIds: [10, 11, 12],
          },
          {
            parentId: 3,
            childId: 67,
            relationTypeId: 2,
            constraint: 1,
            parentAttrIds: [13, 14],
            childAttrIds: [15, 16, 17],
          },
          {
            parentId: 4,
            childId: 89,
            relationTypeId: 3,
            constraint: 2,
            parentAttrIds: [18, 19, 20, 21],
            childAttrIds: [22, 23],
          },
        ];

        // 组装关系数据，添加显示字段
        relations.value = rawRelations.map((relation) => ({
          ...relation,
          parentName: getModelName(relation.parentId),
          childName: getModelName(relation.childId),
          relationTypeName: getRelationTypeName(relation.relationTypeId),
          constraintName: getConstraintName(relation.constraint),
        }));
      } catch (error) {
        console.error('加载模型关系数据失败:', error);
        message.error('加载模型关系数据失败');
      } finally {
        loading.value = false;
      }
    };

    // 筛选关系数据
    const filteredRelations = () => {
      let result = [...relations.value];

      if (searchForm.relationTypeId) {
        result = result.filter(
          (item) => item.relationTypeId === searchForm.relationTypeId,
        );
      }

      if (searchForm.keyword) {
        const keyword = searchForm.keyword.toLowerCase();
        result = result.filter(
          (item) =>
            item.parentName?.toLowerCase().includes(keyword) ||
            false ||
            item.childName?.toLowerCase().includes(keyword) ||
            false,
        );
      }

      return result;
    };

    // 重置搜索条件
    const resetSearch = () => {
      searchForm.relationTypeId = undefined;
      searchForm.keyword = '';
    };

    // 获取父模型的属性
    const getParentAttributes = () => {
      if (!editingRelation.value?.parentId) return [];
      const parentModel = allModels.value.find(
        (model) => model.id === editingRelation.value?.parentId,
      );
      return parentModel?.attributes || [];
    };

    // 获取子模型的属性
    const getChildAttributes = () => {
      if (!editingRelation.value?.childId) return [];
      const childModel = allModels.value.find(
        (model) => model.id === editingRelation.value?.childId,
      );
      return childModel?.attributes || [];
    };

    // 打开添加关系模态框
    const handleAddRelation = () => {
      editingRelation.value = {
        parentId: undefined,
        childId: undefined,
        relationTypeId: undefined,
        constraint: 0,
        parentAttrIds: [],
        childAttrIds: [],
      };

      // 重置表单绑定字段
      parentModelId.value = undefined;
      childModelId.value = undefined;
      relationTypeId.value = undefined;
      constraintType.value = 0;

      selectedParentAttributes.value = [];
      selectedChildAttributes.value = [];
      editModalVisible.value = true;
    };

    // 打开编辑关系模态框
    const handleEditRelation = (record: ModelRelation) => {
      editingRelation.value = { ...record };

      // 设置表单绑定字段
      parentModelId.value = record.parentId;
      childModelId.value = record.childId;
      relationTypeId.value = record.relationTypeId;
      constraintType.value = record.constraint;

      selectedParentAttributes.value = [...record.parentAttrIds];
      selectedChildAttributes.value = [...record.childAttrIds];
      editModalVisible.value = true;
    };

    // 删除关系
    const handleDeleteRelation = (record: ModelRelation) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除 ${record.parentName} 与 ${record.childName} 之间的关系吗？`,
        okType: 'danger',
        onOk: async () => {
          try {
            // 实际项目中应该调用API
            // await deleteModelRelation(record.parentId, record.childId);

            // 模拟API调用
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 更新本地数据
            relations.value = relations.value.filter(
              (item) =>
                !(
                  item.parentId === record.parentId &&
                  item.childId === record.childId
                ),
            );

            message.success('关系删除成功');
          } catch (error) {
            console.error('删除关系失败:', error);
            message.error('删除关系失败');
          }
        },
      });
    };

    // 保存关系
    const handleSaveRelation = async () => {
      if (!editingRelation.value) return;

      // 从表单绑定字段更新editingRelation
      if (parentModelId.value) {
        editingRelation.value.parentId = parentModelId.value;
      }

      if (childModelId.value) {
        editingRelation.value.childId = childModelId.value;
      }

      if (relationTypeId.value) {
        editingRelation.value.relationTypeId = relationTypeId.value;
      }

      editingRelation.value.constraint = constraintType.value;

      // 表单验证
      if (!editingRelation.value.parentId) {
        message.warning('请选择父模型');
        return;
      }

      if (!editingRelation.value.childId) {
        message.warning('请选择子模型');
        return;
      }

      if (!editingRelation.value.relationTypeId) {
        message.warning('请选择关系类型');
        return;
      }

      if (selectedParentAttributes.value.length === 0) {
        message.warning('请选择父模型属性');
        return;
      }

      if (selectedChildAttributes.value.length === 0) {
        message.warning('请选择子模型属性');
        return;
      }

      try {
        // 设置属性IDs
        editingRelation.value.parentAttrIds = selectedParentAttributes.value;
        editingRelation.value.childAttrIds = selectedChildAttributes.value;

        // 实际项目中应该调用API
        // const response = await saveModelRelation(editingRelation.value);

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 处理本地数据更新
        const newRelation = {
          ...editingRelation.value,
          parentName: getModelName(editingRelation.value.parentId as number),
          childName: getModelName(editingRelation.value.childId as number),
          relationTypeName: getRelationTypeName(
            editingRelation.value.relationTypeId as number,
          ),
          constraintName: getConstraintName(
            editingRelation.value.constraint as number,
          ),
        } as ModelRelation;

        // 检查是否是更新还是新增
        const existingIndex = relations.value.findIndex(
          (item) =>
            item.parentId === newRelation.parentId &&
            item.childId === newRelation.childId,
        );

        if (existingIndex === -1) {
          // 新增
          relations.value.push(newRelation);
        } else {
          // 更新
          relations.value[existingIndex] = newRelation;
        }

        message.success('保存成功');
        editModalVisible.value = false;
      } catch (error) {
        console.error('保存关系失败:', error);
        message.error('保存关系失败');
      }
    };

    // 监听typeId变化，重新加载数据
    watch(
      () => props.typeId,
      (newValue) => {
        if (newValue) {
          loadData();
        }
      },
    );

    // 在组件挂载时加载数据
    onMounted(() => {
      if (props.typeId) {
        loadData();
      }
    });

    // 父模型ID变化时，清空已选择的父模型属性
    watch(
      () => editingRelation.value?.parentId,
      () => {
        selectedParentAttributes.value = [];
      },
    );

    // 子模型ID变化时，清空已选择的子模型属性
    watch(
      () => editingRelation.value?.childId,
      () => {
        selectedChildAttributes.value = [];
      },
    );

    return {
      loading,
      relations,
      relationTypes,
      allModels,
      constraintOptions,
      searchForm,
      editModalVisible,
      editingRelation,
      selectedParentAttributes,
      selectedChildAttributes,
      filteredRelations,
      resetSearch,
      getParentAttributes,
      getChildAttributes,
      handleAddRelation,
      handleEditRelation,
      handleDeleteRelation,
      handleSaveRelation,
    };
  },
});
</script>

<template>
  <div class="model-relations">
    <ASpin :spinning="loading">
      <div class="relation-header">
        <AButton type="primary" @click="handleAddRelation">
          <template #icon><PlusOutlined /></template>
          添加关系
        </AButton>

        <div class="relation-search">
          <ASpace>
            <ASelect
              v-model:value="searchForm.relationTypeId"
              placeholder="关系类型"
              style="width: 120px"
              allow-clear
            >
              <ASelectOption
                v-for="type in relationTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.name }}
              </ASelectOption>
            </ASelect>

            <AInput
              v-model:value="searchForm.keyword"
              placeholder="搜索关键词"
              style="width: 200px"
            >
              <template #suffix>
                <SearchOutlined />
              </template>
            </AInput>

            <AButton @click="resetSearch">重置</AButton>
          </ASpace>
        </div>
      </div>

      <div class="relation-content">
        <ATable
          :data-source="filteredRelations()"
          :row-key="(record) => `${record.parentId}-${record.childId}`"
          :pagination="false"
          :loading="loading"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <ASpace>
                <AButton
                  type="link"
                  size="small"
                  @click="handleEditRelation(record as ModelRelation)"
                >
                  <EditOutlined />
                  编辑
                </AButton>
                <AButton
                  type="link"
                  size="small"
                  danger
                  @click="handleDeleteRelation(record as ModelRelation)"
                >
                  <DeleteOutlined style="color: #f5222d" />
                  删除
                </AButton>
              </ASpace>
            </template>
          </template>

          <ATableColumn
            key="parentName"
            title="父模型"
            data-index="parentName"
          />
          <ATableColumn key="childName" title="子模型" data-index="childName" />
          <ATableColumn
            key="relationTypeName"
            title="关系类型"
            data-index="relationTypeName"
          />
          <ATableColumn
            key="constraintName"
            title="约束关系"
            data-index="constraintName"
          />
          <ATableColumn key="action" title="操作" width="150px" />
        </ATable>
      </div>
    </ASpin>

    <!-- 编辑/添加关系模态框 -->
    <AModal
      v-model:visible="editModalVisible"
      :title="
        editingRelation?.parentId && editingRelation?.childId
          ? '编辑关系'
          : '添加关系'
      "
      width="700px"
      @ok="handleSaveRelation"
      :destroy-on-close="true"
    >
      <AForm layout="vertical">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="父模型" required>
              <ASelect
                v-model:value="parentModelId"
                placeholder="请选择父模型"
                style="width: 100%"
              >
                <ASelectOption
                  v-for="model in allModels"
                  :key="model.id"
                  :value="model.id"
                >
                  {{ model.name }}
                </ASelectOption>
              </ASelect>
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="子模型" required>
              <ASelect
                v-model:value="childModelId"
                placeholder="请选择子模型"
                style="width: 100%"
              >
                <ASelectOption
                  v-for="model in allModels"
                  :key="model.id"
                  :value="model.id"
                  :disabled="model.id === parentModelId"
                >
                  {{ model.name }}
                </ASelectOption>
              </ASelect>
            </AFormItem>
          </ACol>
        </ARow>

        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="关系类型" required>
              <ASelect
                v-model:value="relationTypeId"
                placeholder="请选择关系类型"
                style="width: 100%"
              >
                <ASelectOption
                  v-for="type in relationTypes"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ type.name }}
                </ASelectOption>
              </ASelect>
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="约束关系" required>
              <ASelect
                v-model:value="constraintType"
                placeholder="请选择约束关系"
                style="width: 100%"
              >
                <ASelectOption
                  v-for="option in constraintOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </ASelectOption>
              </ASelect>
            </AFormItem>
          </ACol>
        </ARow>

        <ADivider>属性映射</ADivider>

        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="父模型属性" required>
              <ASelect
                v-model:value="selectedParentAttributes"
                placeholder="请选择父模型属性"
                style="width: 100%"
                mode="multiple"
                :disabled="!parentModelId"
              >
                <ASelectOption
                  v-for="attr in getParentAttributes()"
                  :key="attr.id"
                  :value="attr.id"
                >
                  {{ attr.alias }} ({{ attr.name }})
                </ASelectOption>
              </ASelect>
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="子模型属性" required>
              <ASelect
                v-model:value="selectedChildAttributes"
                placeholder="请选择子模型属性"
                style="width: 100%"
                mode="multiple"
                :disabled="!childModelId"
              >
                <ASelectOption
                  v-for="attr in getChildAttributes()"
                  :key="attr.id"
                  :value="attr.id"
                >
                  {{ attr.alias }} ({{ attr.name }})
                </ASelectOption>
              </ASelect>
            </AFormItem>
          </ACol>
        </ARow>
      </AForm>
    </AModal>
  </div>
</template>

<style scoped>
.model-relations {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.relation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.relation-search {
  display: flex;
  flex: 1;
  justify-content: flex-end;
}

.relation-content {
  margin-top: 16px;
}

:deep(.ant-table-wrapper) {
  background-color: #fff;
  border-radius: 4px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.ant-table-thead > tr > th) {
  padding: 12px 16px;
  font-weight: 500;
  background-color: #f7f9fc;
}
</style>
