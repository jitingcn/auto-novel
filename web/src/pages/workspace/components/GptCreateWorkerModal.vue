<script lang="ts" setup>
import { FormInst, FormItemRule, FormRules } from 'naive-ui';
import { ref } from 'vue';

import { GptWorker, useGptWorkspaceStore } from '@/data/stores/workspace';

const gptWorkspace = useGptWorkspaceStore();

const formRef = ref<FormInst>();
const formValue = ref<GptWorker>({
  id: '',
  type: 'web',
  model: 'gpt-3.5',
  endpoint: '',
  key: '',
});
const formRules: FormRules = {
  id: [
    {
      validator: (rule: FormItemRule, value: string) => value.trim().length > 0,
      message: '名字不能为空',
      trigger: 'input',
    },
    {
      validator: (rule: FormItemRule, value: string) =>
        gptWorkspace.workers.find(({ id }) => id === value) === undefined,
      message: '名字不能重复',
      trigger: 'input',
    },
  ],
  key: [
    {
      validator: (rule: FormItemRule, value: string) => value.trim().length > 0,
      message: 'Key不能为空',
      trigger: 'input',
    },
    {
      validator: (rule: FormItemRule, value: string) =>
        gptWorkspace.workers.find(({ key }) => key === value) === undefined,
      message: 'Key不能重复',
      trigger: 'input',
    },
  ],
};

const createGptWorker = async () => {
  const validated = await new Promise<boolean>(function (resolve, _reject) {
    formRef.value?.validate((errors) => {
      if (errors) resolve(false);
      else resolve(true);
    });
  });
  if (!validated) return;

  const worker = { ...formValue.value };
  worker.id = worker.id.trim();
  worker.endpoint = worker.endpoint.trim();
  worker.key = worker.key.trim();
  try {
    const obj = JSON.parse(worker.key);
    if (typeof obj.accessToken === 'string') {
      worker.key = obj.accessToken;
    }
  } catch {}
  gptWorkspace.addWorker(worker);
};
</script>

<template>
  <c-modal title="添加GPT翻译器">
    <n-form
      ref="formRef"
      :model="formValue"
      :rules="formRules"
      label-placement="left"
      label-width="auto"
    >
      <n-form-item-row path="id" label="名字">
        <n-input
          v-model:value="formValue.id"
          placeholder="给你的翻译器起个名字"
          :input-props="{ spellcheck: false }"
        />
      </n-form-item-row>
      <n-form-item-row path="type" label="类型">
        <n-radio-group v-model:value="formValue.type" name="type">
          <n-flex>
            <n-radio value="web">Web</n-radio>
            <n-radio value="api">Api</n-radio>
          </n-flex>
        </n-radio-group>
      </n-form-item-row>
      <n-form-item-row path="model" label="模型">
        <n-radio-group v-model:value="formValue.model" name="model">
          <n-flex>
            <n-radio value="gpt-3.5">GPT-3.5</n-radio>
            <n-radio :disabled="formValue.type === 'web'" value="gpt-4">
              GPT-4
            </n-radio>
          </n-flex>
        </n-radio-group>
      </n-form-item-row>
      <n-form-item-row path="endpoint" label="链接">
        <n-input
          v-model:value="formValue.endpoint"
          placeholder="可选，空着表示使用默认值"
          :input-props="{ spellcheck: false }"
        />
      </n-form-item-row>
      <n-form-item-row path="key" label="Key">
        <n-input
          v-model:value="formValue.key"
          :placeholder="
            formValue.type === 'web' ? '请输入Access token' : '请输入Api key'
          "
          :input-props="{ spellcheck: false }"
        />
      </n-form-item-row>

      <n-text depth="3" style="font-size: 12px">
        {{
          formValue.type === 'web'
            ? '# 链接例子：https://chatgpt-proxy.lss233.com/api'
            : '# 链接例子：https://gpt.mnxcc.com，后面不要加‘/v1’'
        }}
      </n-text>
    </n-form>

    <template #action>
      <c-button label="添加" async type="primary" @click="createGptWorker" />
    </template>
  </c-modal>
</template>
