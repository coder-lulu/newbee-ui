<script lang="ts">
// @ts-nocheck
import type {
  AttributeAppendToCiType,
  AttributeItem,
  ReferenceModel,
  ValidationRule,
} from '#/api/cmdb/ci_types/model';

import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';

// 引入CodeMirror组件
// @ts-ignore
import { CodeMirror } from '@vben/common-ui';

import {
  AppstoreOutlined,
  BranchesOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
  HighlightOutlined,
  LinkOutlined,
  LockOutlined,
  NumberOutlined,
  PictureOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Popover,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tabs,
  Tag,
  TimePicker,
  Tooltip,
} from 'ant-design-vue';
// 导入 dayjs
import dayjs from 'dayjs';

// 使用别名路径，但添加类型注释以避免TS错误
// @ts-ignore
import {
  appendAttributeToCiType,
  getAttributeInfoSimpleList,
  getCiTypeAttributeById,
} from '#/api/cmdb/ci_types/index';
import { createDefaultAttributeItem } from '#/api/cmdb/ci_types/model';
import { ValidationRuleManager } from '#/components/validation';

// 定义带展现字段的枚举项类型
// @ts-ignore
type EnumItemView = {
  label: string;
  meta: {
    icon: string;
    label: string;
    style: {
      bgColor: string;
      color: string;
      fontStyle: string;
      fontWeight: string;
      textDecoration: string;
    };
  };
  value: string;
};

export default defineComponent({
  name: 'AttributeForm',
  components: {
    AForm: Form,
    AFormItem: Form.Item,
    AInput: Input,
    AInputSearch: Input.Search,
    ATextarea: Input.TextArea,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASwitch: Switch,
    ADivider: Divider,
    ASpace: Space,
    AButton: Button,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ARow: Row,
    ACol: Col,
    ATag: Tag,
    ATooltip: Tooltip,
    ADatePicker: DatePicker,
    ATimePicker: TimePicker,
    AppstoreOutlined,
    BranchesOutlined,
    CalendarOutlined,
    CheckSquareOutlined,
    DeleteOutlined,
    EditOutlined,
    FieldTimeOutlined,
    FileTextOutlined,
    FontColorsOutlined,
    FontSizeOutlined,
    HighlightOutlined,
    LinkOutlined,
    LockOutlined,
    NumberOutlined,
    PictureOutlined,
    PlusOutlined,
    APopover: Popover,
    SearchOutlined,
    CodeMirror,
    ASpin: Spin,
    ValidationRuleManager,
  },
  props: {
    typeId: {
      type: Number,
      required: false,
      default: 0,
    },
    groupId: {
      type: Number,
      required: false,
      default: 0,
    },
    id: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  emits: ['create', 'update', 'cancel', 'refresh'],
  setup(props, { emit }) {
    const formRef = ref();
    const activeTab = ref('new');
    const computedActiveTab = ref('expression');
    // 显示加载动画，如果id不为空则是更新，否则为新建
    const loading = ref(false);
    // formState 只声明一份
    const formState = reactive(
      createDefaultAttributeItem(props.typeId, props.groupId),
    );
    // 保证option和fontOption有默认值，防止未初始化导致报错
    if (!formState.attribute.option) {
      formState.attribute.option = {};
    }
    if (!formState.attribute.option.fontOption) {
      formState.attribute.option.fontOption = {
        color: '',
        bgColor: '',
        fontWeight: '',
        fontStyle: '',
        textDecoration: '',
      };
    }
    // 确保validatorRules有默认值
    if (!formState.attribute.validatorRules) {
      formState.attribute.validatorRules = [];
    }
    // 已有属性相关数据
    const existAttributes = ref<AttributeSimple[]>([]);
    const selectedAttributes = ref<number[]>([]);
    const searchText = ref('');

    // 加载已有属性列表
    const loadExistAttributes = async () => {
      try {
        // 调用API获取所有已有属性的列表
        const response = await getAttributeInfoSimpleList({
          excludeCiTypeId: props.typeId,
        });
        // response 可能是 {} 如果为{} 则返回
        if (response === null || response === undefined) {
          existAttributes.value = [];
          return;
        }
        // 提取所有属性并去重
        const allAttributes: AttributeSimple[] = [];
        const attributeIds = new Set();

        response.forEach((attr) => {
          if (!attributeIds.has(attr.id)) {
            attributeIds.add(attr.id);
            allAttributes.push(attr);
          }
        });

        existAttributes.value = allAttributes;
      } catch (error) {
        console.error('加载已有属性失败:', error);
        message.error('加载已有属性失败');
      }
    };

    // 初始加载数据
    loadExistAttributes();

    // 过滤属性
    const filteredExistAttributes = computed(() => {
      // 首先排除已选的属性
      const availableAttributes = existAttributes.value.filter(
        (attr) =>
          !selectedAttributes.value.some((selected) => selected.id === attr.id),
      );

      // 如果没有搜索文本，返回所有未选属性
      if (!searchText.value) return availableAttributes;

      // 根据搜索文本过滤未选属性
      const keyword = searchText.value.toLowerCase();
      return availableAttributes.filter(
        (attr) =>
          attr.name.toLowerCase().includes(keyword) ||
          attr.alias.toLowerCase().includes(keyword),
      );
    });

    // 数据类型选项
    const valueTypeOptions = [
      {
        value: 'int',
        label: '整数',
        icon: NumberOutlined,
        description: '整数',
      },
      {
        value: 'float',
        label: '浮点数',
        icon: NumberOutlined,
        description: '浮点数',
      },
      {
        value: 'text',
        label: '短文本',
        icon: FontSizeOutlined,
        description: '文本长度 <= 255',
      },
      {
        value: 'longtext',
        label: '长文本',
        icon: FileTextOutlined,
        description: '文本长度 > 255',
      },
      {
        value: 'datetime',
        label: '日期时间',
        icon: CalendarOutlined,
        description: 'yyyy-MM-dd HH:mm:ss',
      },
      {
        value: 'date',
        label: '日期',
        icon: CalendarOutlined,
        description: 'yyyy-MM-dd',
      },
      {
        value: 'time',
        label: '时间',
        icon: FieldTimeOutlined,
        description: 'HH:mm:ss',
      },
      {
        value: 'json',
        label: 'JSON',
        icon: BranchesOutlined,
        description: 'JSON',
      },
      {
        value: 'password',
        label: '密码',
        icon: LockOutlined,
        description: '密码',
      },
      { value: 'link', label: '链接', icon: LinkOutlined, description: '链接' },
      {
        value: 'reference',
        label: '引用',
        icon: AppstoreOutlined,
        description: '引用',
      },
      {
        value: 'boolean',
        label: '布尔',
        icon: CheckSquareOutlined,
        description: '布尔',
      },
      {
        value: 'image',
        label: '图片',
        icon: PictureOutlined,
        description: '图片',
      },
    ];

    // 显示选项设置
    const showChoiceOptions = computed(() => {
      return formState.attribute.isChoice;
    });

    // 是否显示高级设置区域
    const showAdvancedSettings = computed(() => {
      return !['boolean', 'json'].includes(formState.attribute.valueType); // 排除JSON和布尔类型
    });

    // 是否显示下拉列表区域
    const showEnumSection = computed(() => {
      return formState.attribute.valueType !== 'password'; // 排除密码类型
    });

    // 是否显示默认值组件
    const showDefaultValueComponent = computed(() => {
      return formState.attribute.valueType !== 'reference'; // 排除引用类型
    });

    // 是否显示引用模型组件
    const showReferenceModelComponent = computed(() => {
      return formState.attribute.valueType === 'reference'; // 仅引用类型显示
    });

    // 是否显示图片组件
    const showImageComponent = computed(() => {
      return formState.attribute.valueType === 'image'; // 仅图片类型显示
    });

    // 根据数据类型判断默认值组件类型
    const defaultValueComponentType = computed(() => {
      if (!formState.attribute.valueType) return 'input';

      console.log(
        '当前数据类型:',
        formState.attribute.valueType,
        typeof formState.attribute.valueType,
      );

      // 确保使用字符串比较
      const valueType = String(formState.attribute.valueType);

      switch (valueType) {
        case 'date': {
          // 日期
          console.log('选择了日期类型');
          return 'date';
        }
        case 'datetime': {
          // 日期时间
          console.log('选择了日期时间类型');
          return 'datetime';
        }
        case 'json': {
          // JSON
          console.log('选择了JSON类型');
          return 'json';
        }
        case 'time': {
          // 时间
          console.log('选择了时间类型');
          return 'time';
        }
        default: {
          console.log('默认使用input类型');
          return 'input';
        }
      }
    });

    // 枚举项管理
    const enumItems = ref<EnumItemView[]>([]);

    // 添加枚举项
    const addEnumItem = () => {
      enumItems.value.push(
        reactive({
          value: '',
          meta: {
            icon: '',
            label: '',
            style: {
              color: '',
              bgColor: '',
              fontWeight: '',
              fontStyle: '',
              textDecoration: '',
            },
          },
        }),
      );
      enumItems.value = [...enumItems.value];
    };

    // 是否为编辑模式
    const isEditMode = computed(() => !!formState.attribute.id);

    // 删除枚举项
    const removeEnumItem = (index: number) => {
      if (
        isEditMode.value &&
        enumItems.value.length <= 1 &&
        formState.attribute?.isChoice
      ) {
        message.warning('至少保留一个枚举项');
        return;
      }
      enumItems.value.splice(index, 1);
      updateEnumChoices();
      enumItems.value = [...enumItems.value];
    };

    // 当前编辑的枚举项索引
    const currentEditEnumIndex = ref(-1);

    // 设置当前编辑的枚举项
    const setCurrentEditEnum = (index: number) => {
      // 如果当前已经在编辑这一项，则关闭
      if (currentEditEnumIndex.value === index) {
        currentEditEnumIndex.value = -1;
        return;
      }
      // 只切换索引，不要清空颜色
      currentEditEnumIndex.value = index;

      // 强制更新状态以确保UI刷新
      window.setTimeout(() => {
        if (enumItems.value[index]) {
          const temp = { ...enumItems.value[index] };
          enumItems.value[index] = temp;
        }
      }, 10);
    };

    // 处理弹出窗口状态变化
    const handleOpenChange = (visible: boolean) => {
      console.log('Popover可见性变更:', visible);
      if (!visible) {
        setCurrentEditEnum(-1);
      }
    };

    // 预定义的颜色列表，用于快速选择
    const predefinedColors = [
      '#f5222d', // 红色
      '#fa541c', // 橙色
      '#fa8c16', // 橙黄色
      '#faad14', // 黄色
      '#fadb14', // 亮黄色
      '#a0d911', // 黄绿色
      '#52c41a', // 绿色
      '#13c2c2', // 青色
      '#1677ff', // 蓝色
      '#2f54eb', // 紫蓝色
      '#722ed1', // 紫色
      '#eb2f96', // 玫红
      '#000000', // 黑色
      '#ffffff', // 白色
      '#f0f0f0', // 浅灰
      '#d9d9d9', // 灰色
    ];

    // 处理枚举项颜色选择
    const handleEnumColorChange = (
      index: number,
      colorType: 'bgColor' | 'color',
      color: string,
    ) => {
      if (index >= 0 && index < enumItems.value.length) {
        const item = enumItems.value[index];
        if (item) {
          if (colorType === 'color') {
            item.meta.style.color = color;
          } else if (colorType === 'bgColor') {
            item.meta.style.bgColor = color;
          }
          enumItems.value = [...enumItems.value];
          updateEnumChoices();
        }
      }
    };

    // 更新枚举样式到formState
    const updateEnumChoices = () => {
      formState.attribute.choices = enumItems.value.map((item) => ({
        value: item.value,
        meta: {
          icon: item.meta.icon,
          label: item.meta.label,
          style: {
            color: item.meta.style?.color,
            bgColor: item.meta.style?.bgColor,
            fontWeight: item.meta.style?.fontWeight,
            fontStyle: item.meta.style?.fontStyle,
            textDecoration: item.meta.style?.textDecoration,
          },
        },
      }));
    };

    // 强制更新视图 - 仅在需要时单独调用
    const forceUpdate = () => {
      // 创建一个通用的强制更新函数，不会导致递归
      const temp = [...enumItems.value];
      enumItems.value = temp;
    };

    // 监听enumItems变化，更新到formState
    watch(
      enumItems,
      () => {
        // 只调用updateEnumChoices，避免循环依赖
        updateEnumChoices();
      },
      { deep: true },
    );

    // 处理验证规则变化
    const handleValidationRulesChange = (rules: ValidationRule[]) => {
      // 将rules中params中的value转换为string
      rules.forEach((rule) => {
        if (rule.params) {
          rule.params.forEach((param) => {
            if (param.value) {
              param.value = String(param.value);
            }
          });
        }
      });
      formState.attribute.validatorRules = rules;
    };

    // 初始化数据
    const initData = async () => {
      if (props.id && props.id > 0) {
        // 编辑模式，加载现有数据
        loading.value = true;
        try {
          const response = await getCiTypeAttributeById(props.id);
          if (response) {
            Object.assign(formState, response);
            // 确保validatorRules有默认值
            if (!formState.attribute.validatorRules) {
              formState.attribute.validatorRules = [];
            }
          }
        } catch (error) {
          console.error('加载属性数据失败:', error);
          message.error('加载属性数据失败');
        } finally {
          loading.value = false;
        }
      }
    };

    // 提交表单
    // 保存
    const handleSubmit = () => {
      // 在提交表单前确保枚举项是最新的
      if (formState.attribute.isChoice) {
        updateEnumChoices();
      }

      if (activeTab.value === 'new') {
        console.log('保存:', formState);
        console.log('计算表达式:', formState.attribute.computeExpr);
        console.log('计算代码:', formState.attribute.computeScript);
        if (formState.attribute.id) {
          formRef.value.validate().then(() => {
            const updateData = {
              ...formState,
              typeId: props.typeId,
              groupId: props.groupId,
            };
            console.log('更新数据:', updateData);
            emit('update', updateData);
          });
          return;
        }
        // 新增属性
        formRef.value
          .validate()
          .then(() => {
            const createData = {
              ...formState,
            };
            console.log('创建数据:', createData);
            emit('create', createData);
          })
          .catch((error: any) => {
            console.error('表单验证失败:', error);
            message.error('表单验证失败');
          });
      }
    };

    // 重置
    const resetForm = () => {
      if (activeTab.value === 'new') {
        formRef.value.resetFields();
        enumItems.value = [];
        addEnumItem();
      } else {
        selectedAttributes.value = [];
      }
    };

    // 取消
    const handleCancel = () => {
      emit('cancel');
    };

    // 选择属性
    const selectAttribute = (attribute: AttributeItem) => {
      // 检查是否已选
      const index = selectedAttributes.value.findIndex(
        (attr) => attr.id === attribute.id,
      );
      if (index === -1) {
        selectedAttributes.value.push(attribute);
      }
    };

    // 取消选择属性
    const unselectAttribute = (attribute: AttributeItem) => {
      const index = selectedAttributes.value.findIndex(
        (attr) => attr.id === attribute.id,
      );
      if (index !== -1) {
        selectedAttributes.value.splice(index, 1);
      }
    };

    // 全选属性
    const selectAllAttributes = () => {
      filteredExistAttributes.value.forEach((attr) => {
        if (
          !selectedAttributes.value.some((selected) => selected.id === attr.id)
        ) {
          selectedAttributes.value.push(attr);
        }
      });
    };

    // 全部取消
    const unselectAllAttributes = () => {
      selectedAttributes.value = [];
    };

    // 处理数据类型变化
    const handleDataTypeChange = (value: any) => {
      console.log(
        '切换数据类型:',
        value,
        '之前类型:',
        formState.attribute.valueType,
      );

      // 更新数据类型
      formState.attribute.valueType = value;

      // 强制刷新默认值组件 - 先清空值
      formState.attribute.default.default = '';

      // 稍后重新设置值，这样组件会重新渲染
      window.setTimeout(() => {
        // 处理日期值，确保UI更新
        updateDatePickerValues();

        // 添加控制台日志以辅助调试
        console.log('数据类型切换后状态:');
        console.log('- 数据类型:', formState.attribute.valueType);
        console.log('- 显示高级设置:', showAdvancedSettings.value);
        console.log('- 显示下拉列表:', showEnumSection.value);
        console.log('- 显示默认值组件:', showDefaultValueComponent.value);
        console.log('- 显示引用模型组件:', showReferenceModelComponent.value);
      }, 50);
    };

    // 更新日期选择器相关值定义
    const dateTimeValue = ref<any>(undefined);
    const dateValue = ref<any>(undefined);
    const timeValue = ref<any>(undefined);

    // 更新日期选择器值
    const updateDatePickerValues = () => {
      // 根据当前设置的值更新对应picker值
      if (
        defaultValueComponentType.value === 'datetime' &&
        formState.attribute.default
      ) {
        try {
          dateTimeValue.value = formState.attribute.default.default
            ? dayjs(formState.attribute.default.default)
            : undefined;
        } catch (error) {
          console.error('处理日期时间值失败', error);
          dateTimeValue.value = undefined;
        }
      } else if (
        defaultValueComponentType.value === 'date' &&
        formState.attribute.default.default
      ) {
        try {
          dateValue.value = formState.attribute.default.default
            ? dayjs(formState.attribute.default.default)
            : undefined;
        } catch (error) {
          console.error('处理日期值失败', error);
          dateValue.value = undefined;
        }
      } else if (
        defaultValueComponentType.value === 'time' &&
        formState.attribute.default.default
      ) {
        try {
          timeValue.value = formState.attribute.default.default
            ? dayjs(formState.attribute.default.default, 'HH:mm:ss')
            : undefined;
        } catch (error) {
          console.error('处理时间值失败', error);
          timeValue.value = undefined;
        }
      }
    };

    const showFontColor = ref(false);
    const showBgColor = ref(false);

    // 日期选择器值相关处理
    const handleDateTimeChange = (val: any) => {
      formState.attribute.default.default = '';

      if (val) {
        try {
          // 使用val的format方法转换为字符串
          formState.attribute.default.default = val.format(
            'YYYY-MM-DD HH:mm:ss',
          );
        } catch (error) {
          console.error('日期时间转换错误', error);
          formState.attribute.default.default = '';
        }
      } else {
        formState.attribute.default.default = '';
      }
    };

    const handleDateChange = (val: any) => {
      formState.attribute.default.default = '';

      if (val) {
        try {
          formState.attribute.default.default = val.format('YYYY-MM-DD');
        } catch (error) {
          console.error('日期转换错误', error);
          formState.attribute.default.default = '';
        }
      } else {
        formState.attribute.default.default = '';
      }
    };

    const handleTimeChange = (val: any) => {
      formState.attribute.default.default = '';

      if (val) {
        try {
          formState.attribute.default.default = val.format('HH:mm:ss');
        } catch (error) {
          console.error('时间转换错误', error);
          formState.attribute.default.default = '';
        }
      } else {
        formState.attribute.default.default = '';
      }
    };

    // 处理主表单字体颜色选择
    const handleFormColorChange = (
      colorType: 'bgColor' | 'color',
      color: string,
    ) => {
      // 防御性展开，防止undefined
      const obj = { ...getFontOption() };
      if (colorType === 'color') {
        obj.color = color;
        formState.attribute.option.fontOption = obj;
        showFontColor.value = false;
      } else {
        obj.bgColor = color;
        formState.attribute.option.fontOption = obj;
        showBgColor.value = false;
      }
    };

    // 处理开关状态变更 - 使用any类型兼容ant-design-vue
    const handleUniqueChange = (checked: any) => {
      formState.isUnique = Boolean(checked);
    };

    const handleRequiredChange = (checked: any) => {
      formState.isRequired = Boolean(checked);
    };

    const handleIndexChange = (checked: any) => {
      formState.attribute.isIndex = Boolean(checked);
    };

    const handleListChange = (checked: any) => {
      formState.attribute.isList = Boolean(checked);
    };

    const handleDynamicChange = (checked: any) => {
      formState.attribute.isDynamic = Boolean(checked);
    };

    const handleComputedChange = (checked: any) => {
      formState.attribute.isComputed = Boolean(checked);
    };

    const handleEditChange = (checked: any) => {
      formState.isEdit = Boolean(checked);
    };

    const handleListShowChange = (checked: any) => {
      formState.listShow = Boolean(checked);
    };

    const handleDetailShowChange = (checked: any) => {
      formState.detailShow = Boolean(checked);
    };

    // 监听表单状态变化
    watch(
      () => formState,
      () => {
        console.log('表单状态变更:', formState);
      },
      { deep: true },
    );

    // 初始化时调用一次更新日期值
    updateDatePickerValues();

    // 处理枚举项样式改变
    const handleEnumStyleChange = (
      index: number,
      styleKey: string,
      value: any,
    ) => {
      if (
        index >= 0 &&
        index < enumItems.value.length &&
        enumItems.value[index]?.meta?.style
      ) {
        const style = enumItems.value[index].meta!.style!;
        switch (styleKey) {
          case 'bgColor': {
            style.bgColor = String(value);
            break;
          }
          case 'color': {
            style.color = String(value);
            break;
          }
          case 'fontItalic': {
            style.fontStyle = value ? 'italic' : '';
            break;
          }
          case 'fontUnderline': {
            style.textDecoration = value ? 'underline' : '';
            break;
          }
          case 'fontWeight': {
            style.fontWeight = value ? 'bold' : '';
            break;
          }
        }
        const items = [...enumItems.value];
        enumItems.value = items;
        updateEnumChoices();
      }
    };

    // 引用模型相关数据
    const referenceModels = ref<ReferenceModel[]>([]);
    const selectedModelId = ref<number | undefined>(undefined);
    // 处理引用模型变更
    const handleReferenceModelChange = (value: any) => {
      selectedModelId.value = typeof value === 'number' ? value : undefined;
      console.log('选择的引用模型:', value);
    };

    // 加载引用模型列表
    const loadReferenceModels = async () => {
      // try {
      //   // 使用API获取CI类型列表作为引用模型
      //   const response = await getCiTypeList();
      //   if (Array.isArray(response)) {
      //     referenceModels.value = response.map((model) => ({
      //       id: model.id as number,
      //       name: model.name as string,
      //       alias: (model.alias as string) || (model.name as string),
      //     }));
      //   }
      // } catch (error) {
      //   console.error('加载引用模型失败:', error);
      //   message.error('加载引用模型失败');
      // }
    };

    // 初始加载引用模型
    loadReferenceModels();

    // 处理JSON值变更
    const handleJsonValueChange = (val: any) => {
      formState.attribute.default.default = val;
    };

    // 注意：计算表达式和计算代码现在使用 v-model 双向绑定，不需要单独的处理函数

    // 新增：始终返回完整fontOption对象的方法
    function getFontOption() {
      return (
        formState.attribute?.option?.fontOption || {
          color: '',
          bgColor: '',
          fontWeight: '',
          fontStyle: '',
          textDecoration: '',
        }
      );
    }

    // 根据 id 判断是新建还是编辑，自动加载/回填数据
    const loadAttributeItem = async () => {
      if (props.id) {
        loading.value = true;
        try {
          const res = await getCiTypeAttributeById(props.id);
          if (res) {
            // 逐项赋值，确保响应式，结构与CiTypeAttributeItem一致
            Object.assign(formState, res);

            // 在数据赋值完成后，再处理数据类型变化
            handleDataTypeChange(formState.attribute.valueType);

            // 确保 typeId 和 groupId 不被覆盖，如果后端返回的是 null 或 undefined，使用 props 中的值
            if (
              (!formState.typeId || formState.typeId === null) &&
              props.typeId
            ) {
              formState.typeId = props.typeId;
            }
            if (
              (!formState.groupId || formState.groupId === null) &&
              props.groupId
            ) {
              formState.groupId = props.groupId;
            }

            // 兼容 default 字段，防止null
            if (!formState.attribute.default) {
              formState.attribute.default = { default: '' };
            } else if (
              typeof formState.attribute.default.default === 'string'
            ) {
              formState.attribute.default = {
                default: formState.attribute.default.default,
              };
            }
            // 回填 option
            if (!formState.attribute.option) {
              formState.attribute.option = {};
            }
            // 回填 option.fontOption
            if (!formState.attribute.option.fontOption) {
              formState.attribute.option.fontOption = {
                color: '',
                bgColor: '',
                fontWeight: '',
                fontStyle: '',
                textDecoration: '',
              };
            }
            // 兼容 choices 字段，防止null
            if (!Array.isArray(formState.attribute.choices)) {
              formState.attribute.choices = [];
            }

            // 回填枚举项
            enumItems.value =
              formState.attribute &&
              Array.isArray(formState.attribute.choices) &&
              formState.attribute.isChoice
                ? formState.attribute.choices.map((item) =>
                    reactive({
                      value: item.value || '',
                      meta: {
                        icon: item.meta?.icon || '',
                        label: item.meta?.label || '',
                        style: {
                          color: item.meta?.style?.color || '',
                          bgColor: item.meta?.style?.bgColor || '',
                          fontWeight: item.meta?.style?.fontWeight || '',
                          fontStyle: item.meta?.style?.fontStyle || '',
                          textDecoration:
                            item.meta?.style?.textDecoration || '',
                        },
                      },
                    }),
                  )
                : [];
            if (enumItems.value.length === 0 && formState.attribute.isChoice)
              addEnumItem();
          }
        } finally {
          loading.value = false;
        }
      } else {
        // 新建时重置
        Object.assign(
          formState,
          createDefaultAttributeItem(props.typeId, props.groupId),
        );
        enumItems.value = [];
        if (!formState.attribute.option) {
          formState.attribute.option = {};
        }
        if (!formState.attribute.option.fontOption) {
          formState.attribute.option.fontOption = {
            color: '',
            bgColor: '',
            fontWeight: '',
            fontStyle: '',
            textDecoration: '',
          };
        }
        if (formState.attribute.isChoice) addEnumItem();
      }
    };

    // 监听 id/typeId/groupId 变化自动加载
    watch(
      () => [props.id, props.typeId, props.groupId],
      () => {
        loadAttributeItem();
      },
      { immediate: true },
    );
    // 组件挂载时初始化
    onMounted(() => {
      loadExistAttributes();
      initData();
    });

    const handleAppendAttributeToCiType = () => {
      if (selectedAttributes.value.length === 0) {
        message.error('请先选择属性');
        return;
      }
      const data: AttributeAppendToCiType = {
        ciTypeId: props.typeId,
        groupId: props.groupId,
        attributeIds: selectedAttributes.value.map((item) => item.id),
      };
      appendAttributeToCiType(data).then(() => {
        selectedAttributes.value = [];
        handleCancel();
        emit('refresh');
      });
    };

    return {
      formRef,
      formState,
      activeTab,
      valueTypeOptions,
      showChoiceOptions,
      handleSubmit,
      handleCancel,
      handleAppendAttributeToCiType,
      existAttributes,
      filteredExistAttributes,
      selectedAttributes,
      searchText,
      defaultValueComponentType,
      showAdvancedSettings,
      showEnumSection,
      showDefaultValueComponent,
      showReferenceModelComponent,
      showImageComponent,
      handleValidationRulesChange,
      initData,
      loading,
      addEnumItem,
      removeEnumItem,
      handleOpenChange,
      predefinedColors,
      handleEnumColorChange,
      forceUpdate,
      handleFormColorChange,
      handleDateTimeChange,
      handleDateChange,
      handleTimeChange,
      handleJsonValueChange,
      handleUniqueChange,
      handleRequiredChange,
      handleIndexChange,
      handleListChange,
      handleDynamicChange,
      handleComputedChange,
      handleEditChange,
      handleListShowChange,
      handleDetailShowChange,
      selectAttribute,
      unselectAttribute,
      selectAllAttributes,
      unselectAllAttributes,
      handleEnumStyleChange,
      referenceModels,
      selectedModelId,
      handleReferenceModelChange,
      loadReferenceModels,
      isEditMode,
      resetForm,
      enumItems,
      currentEditEnumIndex,
      setCurrentEditEnum,
      handleDataTypeChange,
      showFontColor,
      showBgColor,
      dateTimeValue,
      dateValue,
      timeValue,
      updateDatePickerValues,

      updateEnumChoices,
      getFontOption,
      computedActiveTab,
    };
  },
});
</script>

<template>
  <ASpin :spinning="loading" tip="加载中...">
    <ATabs v-model="activeTab">
      <ATabPane key="new" tab="属性配置">
        <AForm
          ref="formRef"
          :model="formState"
          layout="vertical"
          name="attribute_form"
        >
          <ADivider orientation="left">基础设置</ADivider>

          <AFormItem label="属性名(英文)" name="name">
            <AInput
              :value="formState.attribute.name"
              :disabled="!!formState.attribute.id"
              placeholder="请输入属性名称标识，如server_name"
              @input="(e) => (formState.attribute.name = e.target?.value || '')"
            />
          </AFormItem>

          <AFormItem label="别名" name="alias">
            <AInput
              :value="formState.attribute.alias"
              placeholder="请输入属性显示名称，如服务器名称"
              @input="
                (e) => (formState.attribute.alias = e.target?.value || '')
              "
            />
          </AFormItem>

          <AFormItem label="数据类型" name="valueType">
            <ASelect
              :value="formState.attribute.valueType"
              :disabled="!!formState.attribute.id"
              placeholder="请选择数据类型"
              @change="handleDataTypeChange"
            >
              <ASelectOption
                v-for="option in valueTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                <span>
                  <component :is="option.icon" />
                  {{ option.label }}
                  <span
                    v-if="option.description"
                    style="font-size: 12px; color: #999"
                  >
                    ({{ option.description }})
                  </span>
                </span>
              </ASelectOption>
            </ASelect>
          </AFormItem>

          <AFormItem label="默认值" v-if="showDefaultValueComponent">
            <div class="a-form-item-rest">
              <AInput
                v-if="defaultValueComponentType === 'input'"
                :value="formState.attribute.default.default"
                placeholder="请输入默认值"
                class="default-value-component"
                @input="
                  (e) =>
                    (formState.attribute.default.default =
                      e.target?.value || '')
                "
              />
              <ADatePicker
                v-else-if="defaultValueComponentType === 'datetime'"
                :value="dateTimeValue"
                show-time
                placeholder="选择日期时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                class="default-value-component"
                @update:value="handleDateTimeChange"
              />
              <ADatePicker
                v-else-if="defaultValueComponentType === 'date'"
                :value="dateValue"
                placeholder="选择日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                class="default-value-component"
                @update:value="handleDateChange"
              />
              <ATimePicker
                v-else-if="defaultValueComponentType === 'time'"
                :value="timeValue"
                placeholder="选择时间"
                format="HH:mm:ss"
                style="width: 100%"
                class="default-value-component"
                @update:value="handleTimeChange"
              />
              <CodeMirror
                v-else-if="defaultValueComponentType === 'json'"
                :value="formState.attribute.default.default"
                language="js"
                class="default-value-component json-editor"
                style="
                  width: 100%;
                  height: 200px;
                  border: 1px solid #d9d9d9;
                  border-radius: 4px;
                "
                @update:value="handleJsonValueChange"
              />
            </div>
          </AFormItem>

          <AFormItem>
            <div class="switch-options">
              <div class="switch-option">
                <ASwitch
                  :checked="formState.isUnique"
                  @change="handleUniqueChange"
                />
                <span class="switch-label">唯一</span>
              </div>
              <div class="switch-option">
                <ASwitch
                  :checked="formState.isRequired"
                  @change="handleRequiredChange"
                />
                <span class="switch-label">必填</span>
              </div>
              <div class="switch-option">
                <ASwitch
                  :checked="formState.isEdit"
                  @change="handleEditChange"
                />
                <span class="switch-label">可编辑</span>
              </div>
              <div class="switch-option">
                <ASwitch
                  :checked="formState.listShow"
                  @change="handleListShowChange"
                />
                <span class="switch-label">列表显示</span>
              </div>
              <div class="switch-option">
                <ASwitch
                  :checked="formState.detailShow"
                  @change="handleDetailShowChange"
                />
                <span class="switch-label">详情显示</span>
              </div>
              <div class="switch-option">
                <ASwitch
                  :checked="formState.attribute.isList"
                  :disabled="isEditMode"
                  @change="handleListChange"
                />
                <span class="switch-label">多值</span>
              </div>
              <div class="switch-option">
                <ASwitch
                  :checked="formState.attribute.isDynamic"
                  @change="handleDynamicChange"
                />
                <span class="switch-label">动态属性</span>
              </div>
            </div>
          </AFormItem>

          <ADivider orientation="left" v-if="showAdvancedSettings">
            高级设置
          </ADivider>

          <template v-if="showAdvancedSettings">
            <AFormItem label="">
              <ValidationRuleManager
                :rules="formState.attribute.validatorRules || []"
                @change="handleValidationRulesChange"
              />
            </AFormItem>
          </template>

          <ADivider orientation="center" v-if="showEnumSection">
            下拉列表
          </ADivider>

          <template v-if="showEnumSection">
            <ARow>
              <ACol :span="24">
                <ATabs>
                  <ATabPane key="enum" tab="枚举">
                    <AFormItem label="枚举值">
                      <div class="a-form-item-rest">
                        <div
                          v-for="(item, index) in enumItems"
                          :key="index"
                          class="enum-item"
                        >
                          <div class="enum-input-group">
                            <ARow :gutter="16">
                              <ACol :span="10">
                                <AInput
                                  :value="item.value"
                                  placeholder="请输入枚举值"
                                  @input="
                                    (e) => {
                                      item.value = e.target?.value || '';
                                      updateEnumChoices();
                                    }
                                  "
                                />
                              </ACol>
                              <ACol :span="10">
                                <div class="label-with-style">
                                  <AInput
                                    :value="item.meta.label"
                                    placeholder="标签"
                                    class="styled-input"
                                    :style="{
                                      fontWeight:
                                        item.meta.style.fontWeight || 'normal',
                                      fontStyle:
                                        item.meta.style.fontStyle || 'normal',
                                      textDecoration:
                                        item.meta.style.textDecoration ||
                                        'none',
                                      color: item.meta.style.color || '#000000',
                                      backgroundColor:
                                        item.meta.style.bgColor ||
                                        'transparent',
                                    }"
                                    @input="
                                      (e) => {
                                        item.meta.label = e.target?.value || '';
                                        updateEnumChoices();
                                      }
                                    "
                                  />
                                </div>
                              </ACol>
                              <ACol :span="4">
                                <ASpace>
                                  <APopover
                                    placement="rightTop"
                                    trigger="click"
                                    :open="currentEditEnumIndex === index"
                                    @open-change="
                                      (visible) =>
                                        visible
                                          ? setCurrentEditEnum(index)
                                          : setCurrentEditEnum(-1)
                                    "
                                  >
                                    <template #content>
                                      <div class="enum-style-edit-panel">
                                        <div class="enum-style-options">
                                          <div class="mb-2">
                                            <ASwitch
                                              :checked="
                                                item.meta.style?.fontWeight ===
                                                'bold'
                                              "
                                              @change="
                                                (val) => {
                                                  item.meta.style.fontWeight =
                                                    Boolean(val)
                                                      ? 'bold'
                                                      : 'normal';
                                                  updateEnumChoices();
                                                }
                                              "
                                            />
                                            <span class="ml-2">粗体</span>
                                          </div>
                                          <div class="mb-2">
                                            <ASwitch
                                              :checked="
                                                item.meta.style?.fontStyle ===
                                                'italic'
                                              "
                                              @change="
                                                (val) => {
                                                  item.meta.style.fontStyle =
                                                    Boolean(val)
                                                      ? 'italic'
                                                      : 'normal';
                                                  updateEnumChoices();
                                                }
                                              "
                                            />
                                            <span class="ml-2">斜体</span>
                                          </div>
                                          <div class="mb-2">
                                            <ASwitch
                                              :checked="
                                                item.meta.style
                                                  ?.textDecoration ===
                                                'underline'
                                              "
                                              @change="
                                                (val) => {
                                                  item.meta.style.textDecoration =
                                                    Boolean(val)
                                                      ? 'underline'
                                                      : 'none';
                                                  updateEnumChoices();
                                                }
                                              "
                                            />
                                            <span class="ml-2">下划线</span>
                                          </div>
                                          <div class="mb-2">
                                            <span>前景色:</span>
                                            <div class="color-picker-container">
                                              <span
                                                class="color-dot-mini"
                                                :style="{
                                                  background:
                                                    item.meta.style?.color ||
                                                    '#000',
                                                }"
                                              ></span>
                                              <div class="color-picker-inline">
                                                <div
                                                  v-for="(
                                                    color, colorIndex
                                                  ) in predefinedColors"
                                                  :key="`font-${index}-${colorIndex}`"
                                                  class="color-swatch"
                                                  :style="{
                                                    backgroundColor: color,
                                                  }"
                                                  :class="{
                                                    active:
                                                      item.meta.style?.color ===
                                                      color,
                                                  }"
                                                  @click="
                                                    handleEnumColorChange(
                                                      index,
                                                      'color',
                                                      color,
                                                    )
                                                  "
                                                  :title="color"
                                                ></div>
                                              </div>
                                            </div>
                                          </div>
                                          <div class="mb-2">
                                            <span>背景色:</span>
                                            <div class="color-picker-container">
                                              <span
                                                class="color-dot-mini"
                                                :style="{
                                                  background:
                                                    item.meta.style?.bgColor ||
                                                    '#f0f0f0',
                                                }"
                                              ></span>
                                              <div class="color-picker-inline">
                                                <div
                                                  v-for="(
                                                    color, colorIndex
                                                  ) in predefinedColors"
                                                  :key="`bg-${index}-${colorIndex}`"
                                                  class="color-swatch"
                                                  :style="{
                                                    backgroundColor: color,
                                                  }"
                                                  :class="{
                                                    active:
                                                      item.meta.style
                                                        ?.bgColor === color,
                                                  }"
                                                  @click="
                                                    handleEnumColorChange(
                                                      index,
                                                      'bgColor',
                                                      color,
                                                    )
                                                  "
                                                  :title="color"
                                                ></div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </template>
                                    <AButton
                                      type="primary"
                                      size="small"
                                      shape="circle"
                                    >
                                      <EditOutlined />
                                    </AButton>
                                  </APopover>
                                  <AButton
                                    type="text"
                                    danger
                                    size="small"
                                    @click="removeEnumItem(index)"
                                    :disabled="
                                      isEditMode &&
                                      enumItems.length <= 1 &&
                                      formState.attribute?.isChoice
                                    "
                                    :title="
                                      isEditMode &&
                                      formState.attribute?.isChoice
                                        ? '至少保留一个枚举项'
                                        : '删除此枚举项'
                                    "
                                  >
                                    <DeleteOutlined />
                                  </AButton>
                                </ASpace>
                              </ACol>
                            </ARow>
                          </div>
                        </div>
                      </div>
                      <div class="mt-2">
                        <AButton type="dashed" @click="addEnumItem" block>
                          <PlusOutlined /> 添加枚举项
                        </AButton>
                      </div>
                    </AFormItem>
                  </ATabPane>

                  <ATabPane key="build_in" tab="内置">
                    <div>内置功能待实现</div>
                  </ATabPane>

                  <ATabPane key="webhook" tab="Webhook">
                    <div>Webhook功能待实现</div>
                  </ATabPane>

                  <ATabPane key="other_types" tab="其他模型属性">
                    <div>其他模型属性功能待实现</div>
                  </ATabPane>

                  <ATabPane key="code" tab="代码">
                    <div>代码功能待实现</div>
                  </ATabPane>
                </ATabs>
              </ACol>
            </ARow>
          </template>

          <AFormItem>
            <ASwitch
              :checked="formState.attribute.isComputed"
              @change="handleComputedChange"
            />
            <span class="switch-label">计算属性</span>
          </AFormItem>

          <!-- 计算属性配置面板 -->
          <AFormItem v-if="formState.attribute.isComputed">
            <div class="computed-panel">
              <ATabs v-model="computedActiveTab">
                <ATabPane key="expression" tab="表达式">
                  <div class="computed-content">
                    <p class="computed-hint">
                      引用属性使用求值语法，如：<code>&#123;&#123;attr_name | join(',')&#125;&#125;</code>
                      其中 <code>attr_name</code> 为属性名
                    </p>
                    <div class="computed-tips">
                      <div class="tips-item">
                        1.引用属性请同时标记引用属性名：
                        <strong
                          >&#123;&#123;attr_name | join(',')&#125;&#125;</strong
                        >
                      </div>
                      <div class="tips-item">
                        2.支持表达式求值,写法类似
                        <strong>&#123;&#123;attr_name&#125;&#125;</strong>
                      </div>
                      <div class="tips-item">
                        3.不能引用自己，会导致计算属性失效
                      </div>
                    </div>
                    <div class="computed-expression-editor">
                      <CodeMirror
                        v-model="formState.attribute.computeExpr"
                        language="text"
                        style="
                          width: 100%;
                          height: 100%;
                          border: 1px solid #d9d9d9;
                          border-radius: 4px;
                        "
                        placeholder="{{a}} + {{b}}"
                      />
                    </div>
                  </div>
                </ATabPane>

                <ATabPane key="code" tab="代码">
                  <div class="computed-content">
                    <p class="computed-hint">
                      查看所有属性：<strong
                        >{ fontOption: 查看所有匹配的属性值 }</strong
                      >
                    </p>
                    <div class="computed-code-editor">
                      <CodeMirror
                        v-model="formState.attribute.computeScript"
                        language="js"
                        style="
                          width: 100%;
                          height: 100%;
                          border: 1px solid #d9d9d9;
                          border-radius: 4px;
                        "
                        placeholder="f(a) { return a * 2; }"
                      />
                    </div>
                  </div>
                </ATabPane>
              </ATabs>
            </div>
          </AFormItem>

          <!-- 引用模型组件 -->
          <AFormItem label="引用模型" v-if="showReferenceModelComponent">
            <div class="a-form-item-rest">
              <ASelect
                placeholder="请选择引用模型"
                style="width: 100%"
                :value="selectedModelId"
                @change="handleReferenceModelChange"
              >
                <ASelectOption
                  v-for="model in referenceModels"
                  :key="model.id"
                  :value="model.id"
                >
                  {{ model.name }}
                </ASelectOption>
              </ASelect>
            </div>
          </AFormItem>

          <AFormItem>
            <ASpace>
              <!-- 添加或更新  如果formState.attribute.id存在，则更新，否则添加-->
              <AButton type="primary" @click="handleSubmit">
                {{ formState.attribute.id ? '更新' : '添加' }}
              </AButton>
              <!-- 取消 -->
              <AButton @click="handleCancel">取消</AButton>
            </ASpace>
          </AFormItem>
        </AForm>
      </ATabPane>

      <ATabPane key="exist" tab="已有属性" v-if="!isEditMode">
        <div class="attribute-select-container">
          <div class="attribute-unselected">
            <div class="panel-header">
              <span>{{ filteredExistAttributes.length }} 项</span>
              <span class="panel-title">未选属性</span>
            </div>
            <div class="search-box">
              <AInputSearch
                v-model="searchText"
                placeholder="请输入搜索内容"
                style="width: 100%"
              />
            </div>
            <div class="attribute-list">
              <div
                v-for="attr in filteredExistAttributes"
                :key="attr.id"
                class="attribute-item"
                @click="selectAttribute(attr)"
              >
                <div class="attribute-item-main">
                  <div class="attribute-name">{{ attr.alias }}</div>
                  <div class="attribute-en-name">{{ attr.name }}</div>
                </div>
              </div>
              <div
                v-if="filteredExistAttributes.length === 0"
                class="empty-list"
              >
                <span>没有匹配的属性</span>
              </div>
            </div>
          </div>

          <div class="attribute-actions">
            <AButton type="primary" shape="circle" @click="selectAllAttributes">
              &gt;
            </AButton>
            <AButton shape="circle" @click="unselectAllAttributes">
              &lt;
            </AButton>
          </div>

          <div class="attribute-selected">
            <div class="panel-header">
              <span>{{ selectedAttributes.length }} 项</span>
              <span class="panel-title">已选属性</span>
            </div>
            <div class="search-box">
              <AInputSearch placeholder="请输入搜索内容" style="width: 100%" />
            </div>
            <div class="attribute-list">
              <div
                v-for="attr in selectedAttributes"
                :key="attr.id"
                class="attribute-item"
                @click="unselectAttribute(attr)"
              >
                <div class="attribute-item-main">
                  <div class="attribute-name">{{ attr.alias }}</div>
                  <div class="attribute-en-name">{{ attr.name }}</div>
                </div>
              </div>
              <div v-if="selectedAttributes.length === 0" class="empty-list">
                <span>暂无已选属性</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <ASpace>
            <AButton type="primary" @click="handleAppendAttributeToCiType">
              添加到模型
            </AButton>
            <AButton @click="handleCancel">取消</AButton>
          </ASpace>
        </div>
      </ATabPane>
    </ATabs>
  </ASpin>
</template>

<style scoped>
.switch-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.switch-option {
  display: flex;
  align-items: center;
}

.switch-label {
  margin-left: 8px;
}

.font-options {
  display: flex;
  gap: 8px;
}

.enum-item {
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.enum-input-group {
  display: flex;
  align-items: center;
}

.enum-tag-preview {
  display: inline-block;
  padding: 4px 8px;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 4px;
}

.enum-preview {
  margin-top: 8px;
}

.enum-style-options {
  margin-bottom: 12px;
}

.regex-test-result {
  padding: 8px;
  margin: 8px 0;
  text-align: center;
  border-radius: 4px;
}

.regex-test-result.success {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.regex-test-result.error {
  color: #ff4d4f;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}

.regex-test-result.neutral {
  color: #999;
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
}

.mt-1 {
  margin-top: 4px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-3 {
  margin-top: 16px;
}

.mb-1 {
  margin-bottom: 4px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.ml-2 {
  margin-left: 8px;
}

.attribute-select-container {
  display: flex;
  height: 400px;
  margin-bottom: 16px;
}

.attribute-unselected,
.attribute-selected {
  display: flex;
  flex: 1;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.attribute-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  padding: 0 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-title {
  font-weight: 500;
}

.search-box {
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.attribute-list {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.attribute-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.attribute-item:hover {
  background-color: #f5f5f5;
}

.attribute-item-main {
  display: flex;
  flex-direction: column;
}

.attribute-name {
  font-weight: 500;
}

.attribute-en-name {
  font-size: 12px;
  color: #888;
}

.empty-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #999;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 16px;
}

.enum-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
}

.enum-not-enabled {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  margin-bottom: 20px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.enum-hint {
  margin-bottom: 16px;
  color: #999;
}

.preset-button {
  margin-top: 8px;
  color: #1890ff;
}

.preset-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.color-picker {
  width: 30px;
  height: 30px;
  padding: 0;
  margin-left: 8px;
  vertical-align: middle;
  cursor: pointer;
  border: none;
}

.regex-select {
  width: 100%;
  margin-bottom: 12px;
}

.a-form-item-rest {
  width: 100%;
}

.regex-input-container {
  display: flex;
  align-items: center;
}

.font-bold {
  font-weight: bold;
}

.regex-current {
  padding: 8px;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.json-editor {
  font-family: Consolas, Monaco, 'Courier New', monospace;
}

/** 确保编辑器内容区域填满容器 */
:deep(.json-editor .cm-editor) {
  height: 100%;
}

/** 暗黑模式适配 */
:deep(.json-editor .cm-editor.cm-focused) {
  outline: none;
}

.font-options-beauty {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-picker-beauty {
  display: flex;
  gap: 4px;
  align-items: center;
}

.color-dot-beauty {
  display: inline-block;
  width: 22px !important;
  height: 22px !important;
  padding: 0;
  cursor: pointer;
  background: #fff;
  border: 1.5px solid #d9d9d9;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgb(0 0 0 / 3%);
  transition: border 0.2s;
}

.color-dot-beauty:hover {
  border: 1.5px solid #409eff;
}

.color-label-beauty {
  display: flex;
  gap: 2px;
  align-items: center;
  margin-left: 2px;
  font-size: 12px;
  color: #888;
}

.color-dot-mini {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: 2px;
  vertical-align: middle;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
}

.color-dot-mini-picker {
  position: absolute;
  z-index: 9999;
}

.color-picker-popper {
  z-index: 9999 !important;
}

.font-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  font-weight: bold;
}

.preview-btn {
  height: 36px;
  margin-left: 10px;
}

.font-preview {
  padding: 0 8px;
  border-radius: 2px;
}

.color-picker-container {
  position: relative;
  z-index: 1100;
}

.color-select-area {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.enum-style-edit-panel {
  width: 320px;
  padding: 16px;
  margin-top: 12px;
  background: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.color-picker-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 320px;
  margin-top: 8px;
}

.color-swatch {
  width: 20px;
  height: 20px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.2s;
}

.color-swatch:hover {
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  transform: scale(1.1);
}

.color-swatch.active {
  border: 2px solid #1677ff;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  transform: scale(1.1);
}

.label-with-style {
  position: relative;
}

.styled-input {
  transition: all 0.3s ease;
}

.styled-input:hover {
  box-shadow: 0 0 5px rgb(0 0 0 / 20%);
}

.computed-panel {
  padding: 16px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.computed-content {
  padding: 12px 0;
}

.computed-hint {
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
  background-color: #f0f8ff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.computed-hint code {
  padding: 2px 4px;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  background-color: #f5f5f5;
  border-radius: 2px;
}

.computed-tips {
  margin-bottom: 16px;
}

.tips-item {
  padding: 4px 0;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.computed-expression-editor,
.computed-code-editor {
  margin-top: 12px;
}
</style>
