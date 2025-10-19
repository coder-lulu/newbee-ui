<script lang="ts" setup>
import type { SystemTenantApi } from '#/api/system/tenant';

import { useVbenForm, z } from '#/adapter/form';
import { createTenant, updateTenant } from '#/api/system/tenant';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

interface Props {
  tenantData?: SystemTenantApi.SystemTenant | null;
}

const props = withDefaults(defineProps<Props>(), {
  tenantData: null,
});

const emit = defineEmits<{
  success: [data: SystemTenantApi.SystemTenant];
}>();

const isUpdate = computed(() => !!props.tenantData?.id);

const [BaseForm, { setFieldValue }] = useVbenForm({
  commonConfig: {
    hideLabel: false,
    hideRequiredMark: false,
    labelWidth: 120,
  },
  handleSubmit: onSubmit,
  schema: useFormSchema(),
  showDefaultActions: true,
  submitButtonOptions: {
    text: computed(() => (isUpdate.value ? $t('common.update') : $t('common.add'))),
  },
  wrapperClass: 'grid-cols-1',
});

async function onSubmit(values: Record<string, any>) {
  try {
    const submitData = {
      ...values,
      expireTime: values.expireTime ? Number(values.expireTime) : undefined,
    };

    if (isUpdate.value && props.tenantData?.id) {
      await updateTenant({ ...submitData, id: props.tenantData.id });
    } else {
      await createTenant(submitData);
    }
    emit('success', submitData as SystemTenantApi.SystemTenant);
  } catch (error) {
    console.error('Submit failed:', error);
    throw error;
  }
}

watchEffect(() => {
  if (props.tenantData) {
    setFieldValue(props.tenantData);
  }
});
</script>

<template>
  <BaseForm />
</template>