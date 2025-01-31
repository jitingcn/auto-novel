<script lang="ts" setup>
import { ErrorOutlineOutlined } from '@vicons/material';
import { useMessage, useOsTheme } from 'naive-ui';
import { computed } from 'vue';

import { ApiSakura } from '@/data/api/api_sakura';
import { WebNovelChapterDto } from '@/data/api/api_web_novel';
import { useReaderSettingStore } from '@/data/stores/reader_setting';
import { TranslatorId } from '@/data/translator';

import { NovelInfo } from './util';

const props = defineProps<{
  novelInfo: NovelInfo;
  chapterId: string;
  chapter: WebNovelChapterDto;
}>();

const setting = useReaderSettingStore();
const message = useMessage();
const osThemeRef = useOsTheme();

type Paragraph =
  | { text: string; secondary: boolean; popover?: number }
  | { imageUrl: string }
  | null;

const paragraphs = computed(() => {
  const chapter = props.chapter;
  const merged: Paragraph[] = [];
  const styles: {
    paragraphs: string[];
    secondary: boolean;
    popover?: boolean;
  }[] = [];

  if (setting.mode === 'jp') {
    styles.push({ paragraphs: chapter.paragraphs, secondary: false });
  } else {
    if (setting.mode === 'jp-zh') {
      styles.push({ paragraphs: chapter.paragraphs, secondary: true });
    }

    function paragraphsWithLabel(
      t: TranslatorId
    ): [string, string[] | undefined] {
      if (t === 'youdao') {
        return ['有道', chapter.youdaoParagraphs];
      } else if (t === 'baidu') {
        return ['百度', chapter.baiduParagraphs];
      } else if (t === 'gpt') {
        return ['GPT', chapter.gptParagraphs];
      } else {
        return ['Sakura', chapter.sakuraParagraphs];
      }
    }
    if (setting.translationsMode === 'priority') {
      let hasAnyTranslation = false;
      for (const t of setting.translations) {
        const [label, paragraphs] = paragraphsWithLabel(t);
        if (paragraphs) {
          hasAnyTranslation = true;
          styles.push({
            paragraphs,
            secondary: false,
            popover:
              setting.enableSakuraReportButton &&
              props.novelInfo.type === 'web' &&
              t === 'sakura',
          });
          break;
        } else {
          merged.push({ text: label + '翻译不存在', secondary: true });
        }
      }
      if (!hasAnyTranslation) {
        return merged;
      }
    } else {
      for (const t of setting.translations) {
        const [label, paragraphs] = paragraphsWithLabel(t);
        if (paragraphs) {
          styles.push({
            paragraphs,
            secondary: false,
            popover: setting.enableSakuraReportButton && t === 'sakura',
          });
        } else {
          merged.push({ text: label + '翻译不存在', secondary: true });
        }
      }
    }

    if (setting.mode === 'zh-jp') {
      styles.push({ paragraphs: chapter.paragraphs, secondary: true });
    }
  }

  for (let i = 0; i < chapter.paragraphs.length; i++) {
    if (chapter.paragraphs[i].trim().length === 0) {
      merged.push(null);
    } else if (chapter.paragraphs[i].startsWith('<图片>')) {
      merged.push({ imageUrl: chapter.paragraphs[i].slice(4) });
    } else {
      for (const style of styles) {
        merged.push({
          text: style.paragraphs[i],
          secondary: style.secondary,
          popover: style.popover === true ? i : undefined,
        });
      }
    }
  }
  return merged;
});

const createWebIncorrectCase = async (
  index: number,
  chapter: WebNovelChapterDto
) => {
  if (props.novelInfo.type !== 'web') return;

  const jp = chapter.paragraphs[index];
  const zh = chapter.sakuraParagraphs!![index];

  function truncateParagraphs(
    paragraphsJp: string[],
    paragraphsZh: string[],
    maxLength: number
  ) {
    const truncatedJp: string[] = [];
    const truncatedZh: string[] = [];
    let currentLength = 0;

    for (let i = 0; i < paragraphsJp.length; i++) {
      const pJp = paragraphsJp[i];
      const pZh = paragraphsZh[i];
      if (pJp.trim().length === 0 || pJp.startsWith('<图片>')) {
        continue;
      }
      if (currentLength + pJp.length > maxLength) {
        break;
      }
      currentLength += pJp.length;
      truncatedJp.push(pJp);
      truncatedZh.push(pZh);
    }
    return { jp: truncatedJp, zh: truncatedZh };
  }

  const { jp: contextJpBefore, zh: contextZhBefore } = truncateParagraphs(
    chapter.paragraphs.slice(0, index).reverse(),
    chapter.sakuraParagraphs!.slice(0, index).reverse(),
    512 - jp.length
  );
  const { jp: contextJpAfter, zh: contextZhAfter } = truncateParagraphs(
    chapter.paragraphs.slice(index + 1, chapter.paragraphs.length),
    chapter.sakuraParagraphs!.slice(index + 1, chapter.paragraphs.length),
    512 - jp.length
  );

  const contextJp = [...contextJpBefore.reverse(), jp, ...contextJpAfter];
  const contextZh = [...contextZhBefore.reverse(), zh, ...contextZhAfter];

  const result = await ApiSakura.createWebIncorrectCase({
    providerId: props.novelInfo.providerId,
    novelId: props.novelInfo.novelId,
    chapterId: props.chapterId,
    jp,
    zh,
    contextJp,
    contextZh,
  });
  if (result.ok) {
    message.info('提交成功');
  } else {
    message.error('提交失败:' + result.error.message);
  }
};

const fontColor = computed(() => {
  if (setting.theme.mode === 'custom') {
    return setting.theme.fontColor;
  } else {
    let specificTheme: 'light' | 'dark' = 'light';
    if (setting.theme.mode !== 'system') {
      specificTheme = setting.theme.mode;
    } else if (osThemeRef.value) {
      specificTheme = osThemeRef.value;
    }
    return specificTheme === 'light' ? 'black' : 'white';
  }
});
</script>

<template>
  <div id="chapter-content">
    <template v-for="p of paragraphs" :key="`${chapter.prevId}/${index}`">
      <n-p v-if="p && 'text' in p" :class="{ secondary: p.secondary }">
        {{ p.text }}
        <n-popconfirm
          v-if="p.popover !== undefined"
          :show-icon="false"
          placement="top-start"
          positive-text="提交"
          :negative-text="null"
          @positive-click="createWebIncorrectCase(p.popover, chapter)"
        >
          <template #trigger>
            <n-button
              text
              style="opacity: 0.5"
              @click="(e: MouseEvent) => e.stopPropagation()"
            >
              <n-icon :component="ErrorOutlineOutlined" />
            </n-button>
          </template>
          这段话翻得不准确？
        </n-popconfirm>
      </n-p>
      <br v-else-if="!p" />
      <img
        v-else
        :src="p.imageUrl"
        :alt="p.imageUrl"
        style="max-width: 100%; object-fit: scale-down"
      />
    </template>
  </div>
</template>

<style scoped>
#chapter-content {
  min-height: 65vh;
}
#chapter-content p {
  font-size: v-bind('`${setting.fontSize}px`');
  margin: v-bind('`${setting.fontSize * setting.lineSpace}px 0`');
  color: v-bind('fontColor');
  opacity: v-bind('setting.mixZhOpacity');
}
#chapter-content .secondary {
  opacity: v-bind('setting.mixJpOpacity');
}
</style>
