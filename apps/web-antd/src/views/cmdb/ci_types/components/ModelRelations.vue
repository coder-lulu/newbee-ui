<script lang="ts">
import { defineComponent, reactive, ref, watch, computed, nextTick } from 'vue';

import {
  ArrowRightOutlined,
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
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';

import { getCiTypeList } from '#/api/cmdb/ciType';
import type { CiTypeInfo } from '#/api/cmdb/ciType/model';
import {
  createCiTypeRelation,
  deleteCiTypeRelation,
  getCiTypeRelationList,
  updateCiTypeRelation,
} from '#/api/cmdb/ciTypeRelation';
import type { CiTypeRelationInfo, CiTypeRelationListReq } from '#/api/cmdb/ciTypeRelation/model';
import { getRelationTypeList } from '#/api/cmdb/relationType';
import type { RelationTypeInfo } from '#/api/cmdb/relationType/model';
import { getCiTypeAttributeList } from '#/api/cmdb/ciTypeAttribute';
import type { AttributeItem } from '#/api/cmdb/ci_types/model';

export default defineComponent({
  name: 'ModelRelations',
  components: {
    ArrowRightOutlined,
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
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ATag: Tag,
  },
  props: {
    typeId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const loading = ref(false);
    const relations = ref<CiTypeRelationInfo[]>([]);
    const relationTypes = ref<RelationTypeInfo[]>([]);
    const allModels = ref<CiTypeInfo[]>([]);
    const parentAttributes = ref<AttributeItem[]>([]);
    const childAttributes = ref<AttributeItem[]>([]);
    // 存储所有模型的属性，用于列表显示
    const allModelAttributes = ref<Map<number, AttributeItem[]>>(new Map());

    const searchForm = reactive({
      relationTypeId: undefined as number | undefined,
      keyword: '',
    });

    const editModalVisible = ref(false);
    const editingRelation = ref<null | Partial<CiTypeRelationInfo>>(null);
    const saveLoading = ref(false);

    // 属性映射对数据
    const attributeMappingPairs = ref<Array<{
      parentAttrId?: number;
      childAttrId?: number;
    }>>([{ parentAttrId: undefined, childAttrId: undefined }]);

    // Form fields for the modal
    const formData = reactive({
      parentModelId: undefined as number | undefined,
      childModelId: undefined as number | undefined,
      relationTypeId: undefined as number | undefined,
      constraintType: 'ONE_TO_MANY' as string,
    });

    // Form validation rules
    const formRules: Record<string, Rule[]> = {
      parentModelId: [
        { required: true, message: '请选择父模型', type: 'number' },
      ],
      childModelId: [
        { required: true, message: '请选择子模型', type: 'number' },
        { 
          validator: (_rule: any, value: number) => {
            if (value === formData.parentModelId) {
              return Promise.reject('子模型不能与父模型相同');
            }
            return Promise.resolve();
          }
        },
      ],
      relationTypeId: [
        { required: true, message: '请选择关系类型', type: 'number' },
      ],
      constraintType: [
        { required: true, message: '请选择约束关系' },
      ],
    };


    const constraintOptions = [
      { value: 'ONE_TO_MANY', label: '一对多' },
      { value: 'MANY_TO_MANY', label: '多对多' },
      { value: 'MANY_TO_ONE', label: '多对一' },
    ];

    const getRelationTypeName = (id: number) => {
      const found = relationTypes.value.find((item) => item.id === id);
      return found ? found.name : '';
    };

    const getConstraintName = (value: string) => {
      const found = constraintOptions.find((item) => item.value === value);
      return found ? found.label : '';
    };

    const getModelName = (id: number) => {
      const found = allModels.value.find((item) => item.id === id);
      return found ? found.name : '';
    };

    // 预加载关系中涉及的所有模型属性
    const loadRelationAttributes = async (relationData: any[]) => {
      const modelIds = new Set<number>();
      relationData.forEach(relation => {
        modelIds.add(relation.parentId);
        modelIds.add(relation.childId);
      });

      // 并行加载所有模型的属性
      const attributePromises = Array.from(modelIds).map(async (typeId) => {
        try {
          const response = await getCiTypeAttributeList({
            typeId: typeId,
            pageSize: 1000,
            page: 1,
          });
          return { typeId, attributes: response?.data || [] };
        } catch (error) {
          console.error(`加载模型${typeId}属性失败:`, error);
          return { typeId, attributes: [] };
        }
      });

      const results = await Promise.all(attributePromises);
      results.forEach(({ typeId, attributes }) => {
        allModelAttributes.value.set(typeId, attributes);
      });
    };

    const loadData = async () => {
      loading.value = true;
      try {
        if (relationTypes.value.length === 0 || allModels.value.length === 0) {
          const [typesResp, modelsResp] = await Promise.all([
            getRelationTypeList({ pageSize: 1000, page: 1 }),
            getCiTypeList({ pageSize: 1000, page: 1 }),
          ]);
          relationTypes.value = typesResp?.data || [];
          allModels.value = modelsResp?.data || [];
        }

        const params: CiTypeRelationListReq = {
          pageSize: 1000,
          page: 1,
          relationTypeId: searchForm.relationTypeId,
        };
        const relationResp = await getCiTypeRelationList(params);
        console.log('getCiTypeRelationList response:', relationResp);

        // 防御性编程：处理data为null或undefined的情况
        const relationData = relationResp?.data || [];
        console.log('Processed relation data:', relationData);
        
        // 预加载属性数据
        await loadRelationAttributes(relationData);
        
        relations.value = relationData
          .filter((r) => r.parentId === props.typeId || r.childId === props.typeId)
          .map((relation) => ({
            ...relation,
            parentName: getModelName(relation.parentId),
            childName: getModelName(relation.childId),
            relationTypeName: getRelationTypeName(relation.relationTypeId),
            constraintName: getConstraintName(relation.constraint || 'ONE_TO_MANY'),
          }));
      } catch (error) {
        console.error('加载模型关系数据失败:', error);
        message.error('加载模型关系数据失败');
      } finally {
        loading.value = false;
      }
    };

    const filteredRelations = computed(() => {
      if (!searchForm.keyword) {
        return relations.value;
      }
      const keyword = searchForm.keyword.toLowerCase();
      return relations.value.filter(
        (item) =>
          item.parentName?.toLowerCase().includes(keyword) ||
          item.childName?.toLowerCase().includes(keyword),
      );
    });

    const resetSearch = () => {
      searchForm.relationTypeId = undefined;
      searchForm.keyword = '';
      loadData();
    };

    const getParentAttributes = () => {
      return parentAttributes.value;
    };

    const getChildAttributes = () => {
      return childAttributes.value;
    };

    // 加载父模型属性
    const loadParentAttributes = async (typeId: number) => {
      if (!typeId) {
        parentAttributes.value = [];
        return;
      }
      try {
        const response = await getCiTypeAttributeList({
          typeId: typeId,
          pageSize: 1000,
          page: 1,
        });
        parentAttributes.value = response?.data || [];
      } catch (error) {
        console.error('加载父模型属性失败:', error);
        parentAttributes.value = [];
      }
    };

    // 加载子模型属性
    const loadChildAttributes = async (typeId: number) => {
      if (!typeId) {
        childAttributes.value = [];
        return;
      }
      try {
        const response = await getCiTypeAttributeList({
          typeId: typeId,
          pageSize: 1000,
          page: 1,
        });
        childAttributes.value = response?.data || [];
      } catch (error) {
        console.error('加载子模型属性失败:', error);
        childAttributes.value = [];
      }
    };

    const clearFormData = () => {
      formData.parentModelId = undefined;
      formData.childModelId = undefined;
      formData.relationTypeId = undefined;
      formData.constraintType = 'ONE_TO_MANY';
      parentAttributes.value = [];
      childAttributes.value = [];
      attributeMappingPairs.value = [{ parentAttrId: undefined, childAttrId: undefined }];
    };

    const handleAddRelation = async () => {
      editingRelation.value = {};
      clearFormData();
      formData.parentModelId = props.typeId;
      
      // 加载父模型（当前类型）的属性
      if (props.typeId) {
        await loadParentAttributes(props.typeId);
      }
      
      editModalVisible.value = true;
    };

    const handleEditRelation = async (record: CiTypeRelationInfo) => {
      editingRelation.value = { ...record };
      
      // 先清空映射对，避免旧数据干扰
      attributeMappingPairs.value = [{ parentAttrId: undefined, childAttrId: undefined }];
      
      // 设置表单数据但不触发watch重置
      formData.relationTypeId = record.relationTypeId;
      formData.constraintType = record.constraint || 'ONE_TO_MANY';
      
      // 先加载属性数据
      const loadPromises = [];
      if (record.parentId) {
        loadPromises.push(loadParentAttributes(record.parentId));
      }
      if (record.childId) {
        loadPromises.push(loadChildAttributes(record.childId));
      }
      
      // 等待属性加载完成
      await Promise.all(loadPromises);
      
      // 设置模型ID（会触发watch，但此时属性已加载）
      formData.parentModelId = record.parentId;
      formData.childModelId = record.childId;
      
      // 在下一个tick设置属性映射，确保属性数据已加载
      await nextTick();
      
      // 构建属性映射对（统一处理）
      const parentIds = record.parentAttrIds?.length ? record.parentAttrIds : 
                       (record.parentAttrId ? [record.parentAttrId] : []);
      const childIds = record.childAttrIds?.length ? record.childAttrIds : 
                      (record.childAttrId ? [record.childAttrId] : []);
      
      if (parentIds.length > 0 || childIds.length > 0) {
        const maxLength = Math.max(parentIds.length, childIds.length);
        attributeMappingPairs.value = Array.from({ length: maxLength }, (_, index) => ({
          parentAttrId: parentIds[index],
          childAttrId: childIds[index],
        }));
      } else {
        attributeMappingPairs.value = [{ parentAttrId: undefined, childAttrId: undefined }];
      }
      
      editModalVisible.value = true;
    };

    const handleDeleteRelation = (record: CiTypeRelationInfo) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除 ${record.parentName} 与 ${record.childName} 之间的关系吗？`,
        okType: 'danger',
        onOk: async () => {
          if (!record.id) return;
          try {
            await deleteCiTypeRelation([record.id]);
            message.success('关系删除成功');
            await loadData();
          } catch (error) {
            console.error('删除关系失败:', error);
            message.error('删除关系失败');
          }
        },
      });
    };

    const handleSaveRelation = async () => {
      if (!editingRelation.value) return;

      if (!formData.parentModelId || !formData.childModelId || !formData.relationTypeId) {
        message.warning('父模型、子模型和关系类型均为必填项');
        return;
      }

      if (formData.parentModelId === formData.childModelId) {
        message.warning('父模型与子模型不能相同');
        return;
      }

      saveLoading.value = true;
      try {
        const payload: CiTypeRelationInfo = {
          ...editingRelation.value,
          parentId: formData.parentModelId,
          childId: formData.childModelId,
          relationTypeId: formData.relationTypeId,
          constraint: formData.constraintType,
        };

        // 处理属性映射（统一处理，保持兼容性）
        const validPairs = attributeMappingPairs.value.filter(
          pair => pair.parentAttrId && pair.childAttrId
        );

        if (validPairs.length === 0) {
          payload.parentAttrId = undefined;
          payload.childAttrId = undefined;
          payload.parentAttrIds = [];
          payload.childAttrIds = [];
        } else {
          // 统一使用数组处理，单一映射为特殊情况
          payload.parentAttrIds = validPairs.map(pair => pair.parentAttrId!);
          payload.childAttrIds = validPairs.map(pair => pair.childAttrId!);
          
          // 为了兼容后端，如果只有一个映射对，同时设置单一字段
          if (validPairs.length === 1) {
            payload.parentAttrId = validPairs[0].parentAttrId;
            payload.childAttrId = validPairs[0].childAttrId;
          } else {
            payload.parentAttrId = undefined;
            payload.childAttrId = undefined;
          }
        }

        if (payload.id) {
          await updateCiTypeRelation(payload);
          message.success('关系更新成功');
        } else {
          await createCiTypeRelation(payload);
          message.success('关系创建成功');
        }

        editModalVisible.value = false;
        clearFormData();
        await loadData();
      } catch (error: any) {
        console.error('保存关系失败:', error);
        const errorMessage = error?.response?.data?.message || error?.message || '保存关系失败';
        message.error(errorMessage);
      } finally {
        saveLoading.value = false;
      }
    };

    watch(
      () => props.typeId,
      (newValue) => {
        if (newValue) {
          loadData();
        }
      },
      { immediate: true },
    );

    watch(
      () => searchForm.relationTypeId,
      () => {
        loadData();
      },
    );

    watch(() => formData.parentModelId, (newParentId, oldParentId) => {
      // 只在真正改变且不是初始设置时重置
      if (oldParentId !== undefined && newParentId !== oldParentId) {
        // 重置属性映射对中的父属性
        attributeMappingPairs.value.forEach(pair => {
          pair.parentAttrId = undefined;
        });
      }
      
      if (newParentId) {
        loadParentAttributes(newParentId);
      } else {
        parentAttributes.value = [];
      }
    });

    watch(() => formData.childModelId, (newChildId, oldChildId) => {
      // 只在真正改变且不是初始设置时重置
      if (oldChildId !== undefined && newChildId !== oldChildId) {
        // 重置属性映射对中的子属性
        attributeMappingPairs.value.forEach(pair => {
          pair.childAttrId = undefined;
        });
      }
      
      if (newChildId) {
        loadChildAttributes(newChildId);
      } else {
        childAttributes.value = [];
      }
    });

    // 属性映射管理函数
    const addMappingPair = () => {
      attributeMappingPairs.value.push({
        parentAttrId: undefined,
        childAttrId: undefined,
      });
    };

    const removeMappingPair = (index: number) => {
      if (attributeMappingPairs.value.length > 1) {
        attributeMappingPairs.value.splice(index, 1);
      }
    };

    // 确保属性不重复选择
    const availableParentAttributes = (currentIndex: number) => {
      const usedIds = attributeMappingPairs.value
        .filter((_, index) => index !== currentIndex)
        .map(pair => pair.parentAttrId)
        .filter(id => id !== undefined);
      
      return parentAttributes.value.filter(attr => !usedIds.includes(attr.id));
    };

    const availableChildAttributes = (currentIndex: number) => {
      const usedIds = attributeMappingPairs.value
        .filter((_, index) => index !== currentIndex)
        .map(pair => pair.childAttrId)
        .filter(id => id !== undefined);
      
      return childAttributes.value.filter(attr => !usedIds.includes(attr.id));
    };

    // 获取属性名称用于显示
    const getAttributeName = (attrId?: number) => {
      if (!attrId) return '未选择';
      
      // 首先在当前编辑的属性中查找（编辑模式）
      const editAttrs = [...parentAttributes.value, ...childAttributes.value];
      const editAttr = editAttrs.find(a => a.id === attrId);
      if (editAttr?.attribute) {
        return editAttr.attribute.alias || editAttr.attribute.name || '未知属性';
      }
      
      // 然后在全局属性映射中查找（列表显示模式）
      for (const [_, attributes] of allModelAttributes.value) {
        const attr = attributes.find(a => a.id === attrId);
        if (attr?.attribute) {
          return attr.attribute.alias || attr.attribute.name || '未知属性';
        }
      }
      
      // 如果都没找到，返回属性ID
      return `属性ID: ${attrId}`;
    };

    return {
      loading,
      relations,
      relationTypes,
      allModels,
      constraintOptions,
      searchForm,
      editModalVisible,
      editingRelation,
      filteredRelations,
      resetSearch,
      getParentAttributes,
      getChildAttributes,
      clearFormData,
      handleAddRelation,
      handleEditRelation,
      handleDeleteRelation,
      handleSaveRelation,
      // 属性映射相关
      attributeMappingPairs,
      addMappingPair,
      removeMappingPair,
      availableParentAttributes,
      availableChildAttributes,
      getAttributeName,
      allModelAttributes,
      // Form data and validation
      formData,
      formRules,
      saveLoading,
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
          :data-source="filteredRelations"
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
                  @click="handleEditRelation(record as CiTypeRelationInfo)"
                >
                  <EditOutlined />
                  编辑
                </AButton>
                <AButton
                  type="link"
                  size="small"
                  danger
                  @click="handleDeleteRelation(record as CiTypeRelationInfo)"
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
          <ATableColumn key="attributeMapping" title="属性映射" width="250px">
            <template #default="{ record }">
              <div class="attribute-mapping-display">
                <!-- 统一显示映射关系 -->
                <template v-if="record.parentAttrIds?.length && record.childAttrIds?.length">
                  <div class="mapping-tags">
                    <ATag 
                      v-for="(parentId, index) in record.parentAttrIds" 
                      :key="index"
                      :color="record.parentAttrIds.length === 1 ? 'blue' : 'green'"
                      size="small"
                      style="margin-bottom: 4px; display: block; word-break: break-all;"
                    >
                      {{ getAttributeName(parentId) }} → 
                      {{ getAttributeName(record.childAttrIds?.[index]) }}
                    </ATag>
                  </div>
                </template>
                <!-- 兼容旧数据格式 -->
                <template v-else-if="record.parentAttrId && record.childAttrId">
                  <ATag color="blue" size="small" style="word-break: break-all;">
                    {{ getAttributeName(record.parentAttrId) }} → 
                    {{ getAttributeName(record.childAttrId) }}
                  </ATag>
                </template>
                <template v-else>
                  <ATag color="default" size="small">无映射</ATag>
                </template>
              </div>
            </template>
          </ATableColumn>
          <ATableColumn key="action" title="操作" width="150px" />
        </ATable>
      </div>
    </ASpin>

    <!-- 编辑/添加关系模态框 -->
    <AModal
      v-model:visible="editModalVisible"
      :title="editingRelation?.id ? '编辑关系' : '添加关系'"
      width="700px"
      :confirm-loading="saveLoading"
      @ok="handleSaveRelation"
      @cancel="clearFormData"
      :destroy-on-close="true"
    >
      <AForm :model="formData" :rules="formRules" layout="vertical">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem name="parentModelId" label="父模型" required>
              <ASelect
                v-model:value="formData.parentModelId"
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
            <AFormItem name="childModelId" label="子模型" required>
              <ASelect
                v-model:value="formData.childModelId"
                placeholder="请选择子模型"
                style="width: 100%"
              >
                <ASelectOption
                  v-for="model in allModels"
                  :key="model.id"
                  :value="model.id"
                  :disabled="model.id === formData.parentModelId"
                >
                  {{ model.name }}
                </ASelectOption>
              </ASelect>
            </AFormItem>
          </ACol>
        </ARow>

        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem name="relationTypeId" label="关系类型" required>
              <ASelect
                v-model:value="formData.relationTypeId"
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
            <AFormItem name="constraintType" label="约束关系" required>
              <ASelect
                v-model:value="formData.constraintType"
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

        <div class="attribute-mapping-section">
          <ADivider>属性映射配置</ADivider>
          
          <div class="mapping-pairs">
            <div
              v-for="(pair, index) in attributeMappingPairs"
              :key="index"
              class="mapping-pair"
            >
              <ARow :gutter="16" align="middle">
                <ACol :span="10">
                  <AFormItem :label="index === 0 ? '父模型属性' : ''">
                    <ASelect
                      v-model:value="pair.parentAttrId"
                      placeholder="选择父属性"
                      :disabled="!formData.parentModelId"
                    >
                      <ASelectOption
                        v-for="attr in availableParentAttributes(index)"
                        :key="attr.id"
                        :value="attr.id"
                      >
                        {{ attr.attribute?.alias || attr.attribute?.name }}
                      </ASelectOption>
                    </ASelect>
                  </AFormItem>
                </ACol>
                
                <ACol :span="2" class="mapping-arrow">
                  <div style="text-align: center;">
                    <ArrowRightOutlined />
                  </div>
                </ACol>
                
                <ACol :span="10">
                  <AFormItem :label="index === 0 ? '子模型属性' : ''">
                    <ASelect
                      v-model:value="pair.childAttrId"
                      placeholder="选择子属性"
                      :disabled="!formData.childModelId"
                    >
                      <ASelectOption
                        v-for="attr in availableChildAttributes(index)"
                        :key="attr.id"
                        :value="attr.id"
                      >
                        {{ attr.attribute?.alias || attr.attribute?.name }}
                      </ASelectOption>
                    </ASelect>
                  </AFormItem>
                </ACol>
                
                <ACol :span="2">
                  <div class="delete-btn-wrapper">
                    <AButton
                      type="text"
                      danger
                      size="small"
                      :disabled="attributeMappingPairs.length <= 1"
                      @click="removeMappingPair(index)"
                      class="delete-mapping-btn"
                    >
                      <DeleteOutlined />
                    </AButton>
                  </div>
                </ACol>
              </ARow>
            </div>
            
            <AButton
              type="dashed"
              block
              @click="addMappingPair"
              class="add-mapping-btn"
            >
              <PlusOutlined /> 添加属性映射
            </AButton>
          </div>
        </div>
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

:deep(.ant-modal-body) {
  padding: 20px 24px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}

:deep(.ant-select-disabled) {
  background-color: #f5f5f5;
}

.relation-search .ant-space {
  align-items: center;
}

/* 属性映射相关样式 */
.attribute-mapping-section {
  margin-top: 16px;
}

.mapping-pairs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mapping-pair {
  padding: 10px 12px;
  border: 1px solid #e8f4fd;
  border-radius: 8px;
  background: linear-gradient(135deg, #fafcff 0%, #f0f8ff 100%);
  box-shadow: 0 1px 3px rgba(24, 144, 255, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.mapping-pair:hover {
  border-color: #bae0ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.12);
  transform: translateY(-1px);
}

.mapping-pair::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #1890ff, #40a9ff);
  border-radius: 8px 0 0 8px;
}

.mapping-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  font-size: 14px;
  font-weight: 600;
  margin-top: 18px;
  text-shadow: 0 1px 2px rgba(24, 144, 255, 0.1);
}

.delete-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
}

.delete-mapping-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.delete-mapping-btn:hover:not(:disabled) {
  background-color: #fff2f0;
  border-color: #ff7875;
}

.add-mapping-btn {
  margin-top: 12px;
  border: 2px dashed #d9d9d9;
  background: #fafafa;
  color: #666;
  height: 40px;
  transition: all 0.3s ease;
}

.add-mapping-btn:hover {
  border-color: #1890ff;
  background: #f0f8ff;
  color: #1890ff;
}

:deep(.mapping-pair .ant-form-item) {
  margin-bottom: 0;
}

:deep(.mapping-pair .ant-form-item-label) {
  padding-bottom: 2px;
}

:deep(.mapping-pair .ant-form-item-label > label) {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.attribute-mapping-display .mapping-tags .ant-tag {
  margin-bottom: 4px;
  margin-right: 0;
}
</style>
