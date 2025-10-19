// 公用类型定义
export interface FontOption {
  color?: string;
  bgColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
}

export interface ImageOption {
  path?: string;
  name?: string;
  width?: string;
  height?: string;
}

export interface ChoiceItemMeta {
  label?: string;
  icon?: string;
  style?: FontOption;
}

export interface ChoiceItem {
  id?: number;
  value?: string;
  meta?: ChoiceItemMeta;
}

export interface AttributeChoiceWebHook {
  url: string;
  method: string;
  body: string;
  headers: string;
  params: string;
  responseType: string;
  responseFormat: string;
}

export interface AttributeOption {
  fontOption?: FontOption;
  imageOption?: ImageOption[];
}

export interface AttributeChoiceOther {
  filter: string;
  attrId: number;
  typeIds: number[];
}

export interface ValidationRuleParam {
  key: string;
  value: any;
}

// ValidationRule 验证规则结构
export interface ValidationRule {
  type: string;
  params?: ValidationRuleParam[];
  message: string;
  enabled: boolean;
  customValidator?: string;
}

// Attribute 主结构（与后端 proto 对齐）
export interface Attribute {
  id: number;
  typeId: number;
  name: string;
  alias: string;
  valueType: string;
  isChoice: boolean;
  isPassword: boolean;
  isComputed: boolean;
  isList: boolean;
  isReference: boolean;
  sort: number;
  computeScript: string;
  computeExpr: string;
  isDynamic: boolean;
  referenceTypeId: number;
  choiceOther: AttributeChoiceOther;
  choiceWebHook: AttributeChoiceWebHook;
  choices?: ChoiceItem[];
  default?: { default: any };
  option?: AttributeOption;
  groupItemId?: number;
  _groupIndex?: number;
  createdBy?: string;
  validatorRules?: ValidationRule[];
}

// Attribute 主结构（与后端 proto 对齐）
export interface AttributeSimple {
  id: number;
  typeId: number;
  name: string;
  alias: string;
}

export interface AttributeItem {
  id: number;
  attribute?: Attribute;
  groupId?: number;
  typeId?: number;
  listShow?: boolean;
  detailShow?: boolean;
  isUnique?: boolean;
  isRequired?: boolean;
  isEdit?: boolean;
  sort?: number;
  ciTypeAttributeId?: number;
  isInherited?: boolean;
}

export interface AttributeGroup {
  groupId: number;
  sort: number;
  name: string;
  typeId: number;
  items: AttributeItem[];
}

export interface CiTypeGroup {
  id: string;
  createdAt?: number; // int64时间戳，例如：1746277475000
  updatedAt?: number; // int64时间戳
  deletedAt?: number; // int64时间戳
  sort?: string;
  name?: string;
  icon?: string;
}

export interface CiTypeGroupItem {
  id: number;
  sort?: string;
  name?: string;
  typeId?: number;
  groupId?: number;
  icon?: string;
}

export interface UniqueConst {
  attrIds: number[];
}

export interface CiType {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  sort?: number;
  name?: string;
  alias?: string;
  uniqueId?: number;
  isInherited?: boolean;
  createdBy?: string;
  icon?: string;
  defaultOrderAttr?: string;
  showId?: number;
  uniqueConst?: UniqueConst[];
  inheritedModels?: number[];
  groupId?: number;
}

export interface CiTypeGroupItemTreeData {
  id: number;
  sort: number;
  name: string;
  items: CiTypeGroupItem[];
}

// 获取CI类型组项目树查询参数
export interface CiTypeGroupItemTreeQuery {
  groupId?: number;
  includeTypeIds?: number[];
  excludeTypeIds?: number[];
  includeTypeNames?: string[];
  excludeTypeNames?: string[];
}

// 新增：属性分组结构（与后端 proto 对齐）
export interface AttributeGroupInfo {
  groupId?: number;
  sort?: number;
  name?: string;
  typeId?: number;
  itemId?: number;
  items?: Attribute[];
}

export interface AttributeAppendToCiType {
  ciTypeId: number;
  groupId: number;
  attributeIds: number[];
}

// 工厂函数：生成 Attribute 默认对象
export function createDefaultAttribute(typeId: number): Attribute {
  return {
    id: 0,
    typeId: typeId ?? 0,
    name: '',
    alias: '',
    valueType: 'text',
    isChoice: false,
    isPassword: false,
    isComputed: false,
    isList: false,
    isReference: false,
    sort: 0,
    computeScript: '',
    computeExpr: '',
    isDynamic: false,
    referenceTypeId: 0,
    choiceOther: {
      filter: '',
      attrId: 0,
      typeIds: [],
    },
    choiceWebHook: {
      url: '',
      method: '',
      body: '',
      headers: '',
      params: '',
      responseType: '',
      responseFormat: '',
    },
    choices: [],
    default: { default: '' },
    option: {
      fontOption: {
        color: '',
        bgColor: '',
        fontWeight: '',
        fontStyle: '',
        textDecoration: '',
      },
    },
    _groupIndex: 0,
    createdBy: '',
    validatorRules: [],
  };
}

// 工厂函数：生成 AttributeItem 默认对象
export function createDefaultAttributeItem(
  typeId: number,
  groupId?: number,
): AttributeItem {
  return {
    id: 0,
    attribute: createDefaultAttribute(typeId),
    groupId: groupId ?? 0,
    typeId: typeId ?? 0,
    listShow: true,
    detailShow: true,
    isUnique: false,
    isRequired: false,
    isEdit: true,
    sort: 0,
    ciTypeAttributeId: 0,
    isInherited: false,
  };
}
