<script lang="ts" setup>
import { ref, watch } from 'vue';

import {
  downloadModeOptions,
  downloadTranslationModeOptions,
  downloadTypeOptions,
  useSettingStore,
} from '@/data/stores/setting';
import { useUserDataStore } from '@/data/stores/user_data';

defineProps<{
  type: 'web' | 'wenku';
  glossary: { [key: string]: string };
  submit: () => Promise<void>;
}>();

const userData = useUserDataStore();
const setting = useSettingStore();

const showDownloadOptions = ref(false);
const showTranslateOptions = ref(false);

const toggleTranslateOptions = () => {
  if (showTranslateOptions.value) {
    showTranslateOptions.value = false;
  } else {
    showTranslateOptions.value = true;
    showDownloadOptions.value = false;
  }
};

const toggleDownloadOptions = () => {
  if (showDownloadOptions.value) {
    showDownloadOptions.value = false;
  } else {
    showDownloadOptions.value = true;
    showTranslateOptions.value = false;
  }
};

// 翻译设置
const translateExpireChapter = ref(false);
const syncFromProvider = ref(false);
const startIndex = ref<number | null>(0);
const endIndex = ref<number | null>(65536);
const taskNumber = ref<number | null>(1);

defineExpose({
  getTranslationOptions: () => ({
    translateExpireChapter: translateExpireChapter.value,
    syncFromProvider: syncFromProvider.value,
    startIndex: startIndex.value ?? 0,
    endIndex: endIndex.value ?? 65536,
    taskNumber: taskNumber.value ?? 1,
  }),
});

// 下载设置
const tryUseChineseTitleAsFilename = ref(setting.downloadFilenameType === 'zh');
watch(
  tryUseChineseTitleAsFilename,
  (it) => (setting.downloadFilenameType = it ? 'zh' : 'jp')
);
</script>

<template>
  <n-p depth="3" style="font-size: 12px">
    # 如果想自己生成机翻，请先阅读
    <RouterNA to="/forum/64f3d63f794cbb1321145c07">使用说明</RouterNA>
  </n-p>

  <n-button-group style="margin-bottom: 8px">
    <c-button
      label="翻译设置"
      :round="false"
      @click="toggleTranslateOptions()"
    />
    <c-button
      label="下载设置"
      :round="false"
      @click="toggleDownloadOptions()"
    />
    <slot />
  </n-button-group>

  <n-collapse-transition
    :show="showTranslateOptions || showDownloadOptions"
    style="margin-bottom: 16px"
  >
    <n-list v-if="showTranslateOptions" bordered>
      <n-list-item>
        <advance-option
          title="翻译过期章节"
          description="在启动翻译任务时，重新翻译术语表过期的章节。一次性设定，默认关闭。"
        >
          <template #suffix>
            <n-switch
              :rubber-band="false"
              size="small"
              v-model:value="translateExpireChapter"
            />
          </template>
        </advance-option>
      </n-list-item>

      <n-list-item v-if="type === 'web' && userData.passWeek">
        <advance-option
          title="与源站同步"
          description="在启动翻译任务时，同步已缓存章节。如果缓存章节与源站不匹配，会删除章节，包含现有的翻译。慎用，不要抱着试试的心情用这个功能，用之前请确保你知道自己在干什么。一次性设定，默认关闭。"
        >
          <template #suffix>
            <n-switch
              :rubber-band="false"
              size="small"
              v-model:value="syncFromProvider"
            />
          </template>
        </advance-option>
      </n-list-item>

      <n-list-item v-if="type === 'web'">
        <advance-option
          title="自定义更新范围"
          description="控制翻译任务的范围，章节序号可以看下面目录结尾方括号里的数字。比如，“从0到10”，表示属于区间[0，10)的章节，从第0章到第9章，不包含第10章。均分任务只对排队GPT/Sakura生效，最大为10。"
        >
          <n-flex style="text-align: center">
            <div>
              <n-input-group>
                <n-input-group-label size="small">从</n-input-group-label>
                <n-input-number
                  size="small"
                  v-model:value="startIndex"
                  :show-button="false"
                  button-placement="both"
                  :min="0"
                  style="width: 60px"
                />
                <n-input-group-label size="small">到</n-input-group-label>
                <n-input-number
                  size="small"
                  v-model:value="endIndex"
                  :show-button="false"
                  :min="0"
                  style="width: 60px"
                />
              </n-input-group>
            </div>
            <div>
              <n-input-group>
                <n-input-group-label size="small">均分</n-input-group-label>
                <n-input-number
                  size="small"
                  v-model:value="taskNumber"
                  :show-button="false"
                  :min="1"
                  :max="10"
                  style="width: 60px"
                />
                <n-input-group-label size="small">个任务</n-input-group-label>
              </n-input-group>
            </div>
          </n-flex>
        </advance-option>
      </n-list-item>

      <n-list-item>
        <advance-option
          title="术语表"
          description="术语表过大可能会使得翻译质量下降，此外，出于安全起见，Sakura只会使用日语长度超过两个字的术语。"
        >
          <glossary-edit :glossary="glossary" />
          <c-button
            label="提交"
            async
            require-login
            :round="false"
            type="primary"
            secondary
            size="small"
            @click="submit"
          />
        </advance-option>
      </n-list-item>
    </n-list>

    <n-list v-if="showDownloadOptions" bordered>
      <n-list-item v-if="type === 'web'">
        <advance-option
          title="中文文件名"
          description="如果小说标题已经被翻译，则使用翻译后的中文标题作为下载的文件名。"
        >
          <template #suffix>
            <n-switch
              :rubber-band="false"
              size="small"
              v-model:value="tryUseChineseTitleAsFilename"
            />
          </template>
        </advance-option>
      </n-list-item>

      <n-list-item>
        <advance-option
          title="下载文件语言"
          description="设置下载文件的语言。注意部分EPUB阅读器不支持半透明字体，日文段落无法正确显示为半透明字体。"
        >
          <n-radio-group
            v-model:value="setting.downloadFormat.mode"
            size="small"
          >
            <n-radio-button
              v-for="option in downloadModeOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </n-radio-group>
        </advance-option>
      </n-list-item>

      <n-list-item>
        <advance-option
          title="下载文件翻译"
          description="设置下载文件使用的翻译。注意选中的翻译顺序，优先模式下顺序代表优先级，并列模式下顺序代表翻译的排列顺序。"
        >
          <n-flex>
            <n-radio-group
              v-model:value="setting.downloadFormat.translationsMode"
              size="small"
            >
              <n-radio-button
                v-for="option in downloadTranslationModeOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </n-radio-group>
            <translator-check
              v-model:value="setting.downloadFormat.translations"
              show-order
              size="small"
            />
          </n-flex>
        </advance-option>
      </n-list-item>

      <n-list-item v-if="type === 'web'">
        <advance-option title="下载文件类型" description="设置下载文件的类型。">
          <n-radio-group
            v-model:value="setting.downloadFormat.type"
            size="small"
          >
            <n-radio-button
              v-for="option in downloadTypeOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </n-radio-group>
        </advance-option>
      </n-list-item>
    </n-list>
  </n-collapse-transition>
</template>
