<script lang="ts" setup>
import { useMessage } from 'naive-ui';

import { PersonalVolumesManager } from '@/data/translator';
import { LocalVolumeMetadata } from '@/data/translator/db/personal';
import { ref } from 'vue';

const props = defineProps<{ volume: LocalVolumeMetadata }>();

const message = useMessage();

const glossary = ref({});

const showGlossaryModal = ref(false);

const toggleGlossaryModal = () => {
  if (showGlossaryModal.value === false) {
    glossary.value = { ...props.volume.glossary };
  }
  showGlossaryModal.value = !showGlossaryModal.value;
};

const submitGlossary = () =>
  PersonalVolumesManager.updateGlossary(props.volume.id, glossary.value)
    .then(() => message.success('术语表提交成功'))
    .catch((error) => message.error(`术语表提交失败：${error}`))
    .then(() => {});
</script>

<template>
  <c-button
    :label="`术语表[${Object.keys(volume.glossary).length}]`"
    v-bind="$attrs"
    @click="toggleGlossaryModal()"
  />
  <c-modal title="编辑术语表" v-model:show="showGlossaryModal">
    <n-p>{{ volume.id }}</n-p>
    <glossary-edit :glossary="glossary" />
    <template #action>
      <c-button label="提交" async type="primary" @click="submitGlossary()" />
    </template>
  </c-modal>
</template>
