<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { PageQuery } from '#/api/common';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getVxePopupContainer } from '@vben/utils';

import { useClipboard } from '@vueuse/core';
import {
  Dropdown,
  Image,
  Menu,
  MenuItem,
  message,
  Popconfirm,
  Space,
} from 'ant-design-vue';
import { isPlainObject } from 'remeda';

import { addSortParams, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteFile, downloadFile, getFileList } from '#/api/fms/file';
import { UploadDragger } from '#/components/uploadFile';

import { columns, querySchema } from './data';
import Form from './form.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // 日期选择格式化
  fieldMappingTime: [
    [
      'createTime',
      ['params[beginCreateTime]', 'params[endCreateTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    // trigger: 'row',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page, sorts }, formValues = {}) => {
        const params: PageQuery = {
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        };
        // 添加排序参数
        addSortParams(params, sorts);
        return await getFileList(params);
      },
    },
  },
  rowConfig: {
    keyField: 'id',
    height: 65,
  },
  sortConfig: {
    // 远程排序
    remote: true,
    // 支持多字段排序 默认关闭
    multiple: false,
  },
  id: 'system-file-index',
};

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
});

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    // 排序 重新请求接口
    sortChange: () => tableApi.query(),
  },
});

async function handleDelete(ids: (number | string)[]) {
  await deleteFile(ids);
  await tableApi.query();
}

// function handleMultiDelete() {
//   const rows = tableApi.grid.getCheckboxRecords();
//   const ids = rows.map((row: FileInfo) => row.ossId);
//   Modal.confirm({
//     title: '提示',
//     okType: 'danger',
//     content: `确认删除选中的${ids.length}条记录吗？`,
//     onOk: async () => {
//       await deleteFile(ids);
//       await tableApi.query();
//     },
//   });
// }

// function isImageFile(ext: string) {
//   const supportList = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
//   return supportList.some((item) => ext.toLocaleLowerCase().includes(item));
// }

// ---------------- upload modal ------------------
const [UploadModal, uploadModalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel() {
    uploadModalApi.close();
  },
  onConfirm: async () => {
    uploadModalApi.close();
  },
  onOpenChange() {},
  title: $t('component.upload.upload'),
});

const imagePath = ref<string>('');
const videoPath = ref<string>('');
const videoTitle = ref<string>('');
const imageTitle = ref<string>('');
const currentFileName = ref<string>('');

// ------------- preview video modal --------------------
const [PreviewVideoModal, previewVideoModalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel() {
    previewVideoModalApi.close();
  },
  onConfirm: async () => {
    previewVideoModalApi.close();
  },
  onOpenChange() {
    previewVideoModalApi.setState({ title: videoTitle.value });
  },
  title: videoTitle.value,
});

function handleDownloadVideo() {
  const link = document.createElement('a');
  link.href = videoPath.value;
  link.download = currentFileName.value;
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  previewVideoModalApi.close();
}

// -------------- preview image modal ----------------------
const [PreviewImageModal, previewImageModalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel() {
    previewImageModalApi.close();
  },
  onConfirm: async () => {
    previewImageModalApi.close();
  },
  onOpenChange() {
    previewImageModalApi.setState({ title: imageTitle.value });
  },
});

function handleDownloadImage() {
  const link = document.createElement('a');
  link.href = imagePath.value;
  link.download = currentFileName.value;
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  previewImageModalApi.close();
}

const { copy } = useClipboard();

function handleCopyPath(record: any) {
  try {
    if (!record?.publicPath) {
      message.error('复制失败');
      return;
    }

    copy(record.publicPath);
    message.success('复制成功');
  } catch (error) {
    console.error('Copy path error:', error);
    message.error('复制失败');
  }
}

async function handleDownload(record: any) {
  try {
    const file = await downloadFile(record.id);
    // 添加更严格的类型检查
    if (!file || typeof file !== 'object') {
      message.error('下载失败');
      return;
    }

    const fileType = file.type?.split('/')[0];
    currentFileName.value = `${record.name}.${record.path?.split('.')[1] || ''}`;

    if (fileType === 'image') {
      imageTitle.value = currentFileName.value;
      imagePath.value = URL.createObjectURL(file);
      previewImageModalApi.open();
    } else if (fileType === 'video') {
      videoTitle.value = currentFileName.value;
      videoPath.value = URL.createObjectURL(file);
      previewVideoModalApi.open();
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = currentFileName.value;
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    }
  } catch (error) {
    console.error('Download file error:', error);
    message.error('下载失败');
  }
}

function openFormModal(record: any) {
  if (isPlainObject(record)) {
    formModalApi?.setData({
      record,
      isUpdate: true,
      gridApi: tableApi,
    });
  } else {
    formModalApi.setData({
      record: null,
      isUpdate: false,
      gridApi: tableApi,
    });
  }
  formModalApi.open();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="文件列表">
      <template #toolbar-tools>
        <a-button v-access:code="['fms:file:add']" @click="uploadModalApi.open">
          上传
        </a-button>
      </template>
      <template #action="{ row }">
        <Space>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete([row.id])"
          >
            <a-button
              danger
              v-access:code="['system:role:remove']"
              @click.stop=""
            >
              删除
            </a-button>
          </Popconfirm>
        </Space>
        <Dropdown
          :get-popup-container="getVxePopupContainer"
          placement="bottomRight"
        >
          <template #overlay>
            <Menu>
              <MenuItem key="1" @click="handleCopyPath(row)">
                复制链接
              </MenuItem>
              <MenuItem key="1" @click="openFormModal(row)"> 编辑 </MenuItem>
              <MenuItem key="2" @click="handleDownload(row)"> 下载 </MenuItem>
            </Menu>
          </template>
          <a-button size="small" type="link"> 更多 </a-button>
        </Dropdown>
      </template>
    </BasicTable>
    <PreviewImageModal>
      <Image :src="imagePath" style="" width="100%" />
      <template #footer>
        <a-button key="download" type="primary" @click="handleDownloadImage">
          下载
        </a-button>
      </template>
    </PreviewImageModal>
    <PreviewVideoModal>
      <template #footer>
        <a-button key="download" type="primary" @click="handleDownloadVideo">
          下载
        </a-button>
      </template>
      <video controls height="720" width="1280">
        <source :src="videoPath" type="video/mp4" />
      </video>
    </PreviewVideoModal>
    <FormModal />
    <UploadModal>
      <UploadDragger />
    </UploadModal>
  </Page>
</template>
