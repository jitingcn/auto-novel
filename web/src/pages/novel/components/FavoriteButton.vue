<script lang="ts" setup>
import { FavoriteBorderOutlined, FavoriteOutlined } from '@vicons/material';
import { useMessage } from 'naive-ui';
import { computed, ref } from 'vue';

import { ApiUser, Favored } from '@/data/api/api_user';

const props = defineProps<{
  favored: string | undefined;
  favoredList: Favored[];
  novel:
    | { type: 'web'; providerId: string; novelId: string }
    | { type: 'wenku'; novelId: string };
}>();
const emit = defineEmits<{ 'update:favored': [string | undefined] }>();

const message = useMessage();

const favoredTitle = computed(
  () => props.favoredList.find((it) => it.id === props.favored)?.title
);

const favoriteNovel = async (favoredId: string) => {
  const result = await (props.novel.type === 'web'
    ? ApiUser.favoriteWebNovel(
        favoredId,
        props.novel.providerId,
        props.novel.novelId
      )
    : ApiUser.favoriteWenkuNovel(favoredId, props.novel.novelId));
  if (result.ok) {
    emit('update:favored', favoredId);
    message.success('收藏成功');
    showFavoredModal.value = false;
  } else {
    message.error('收藏错误：' + result.error.message);
  }
};

const unfavoriteNovel = async () => {
  if (props.favored === undefined) return;
  const result = await (props.novel.type === 'web'
    ? ApiUser.unfavoriteWebNovel(
        props.favored,
        props.novel.providerId,
        props.novel.novelId
      )
    : ApiUser.unfavoriteWenkuNovel(props.favored, props.novel.novelId));
  if (result.ok) {
    emit('update:favored', undefined);
    message.success('取消收藏成功');
    showFavoredModal.value = false;
  } else {
    message.error('取消收藏错误：' + result.error.message);
  }
};

const showFavoredModal = ref(false);
const selectedFavoredId = ref(props.favored ?? 'default');
</script>

<template>
  <template v-if="favoredList.length <= 1">
    <c-button
      v-if="favored"
      label="已收藏"
      :icon="FavoriteOutlined"
      async
      require-login
      @click="unfavoriteNovel"
    />
    <c-button
      v-else
      label="收藏"
      :icon="FavoriteBorderOutlined"
      async
      require-login
      @click="favoriteNovel(favoredList[0].id)"
    />
  </template>

  <template v-else>
    <c-button
      :label="favored ? '已收藏:' + favoredTitle : '收藏'"
      :icon="favored ? FavoriteOutlined : FavoriteBorderOutlined"
      require-login
      @click="showFavoredModal = true"
    />
  </template>

  <c-modal v-model:show="showFavoredModal" title="收藏到...">
    <n-radio-group v-model:value="selectedFavoredId">
      <n-flex vertical size="large">
        <n-radio
          v-for="favored in favoredList"
          :key="favored.id"
          :value="favored.id"
        >
          {{ favored.title }}
        </n-radio>
        <n-radio key="deleted" value="deleted"> 取消收藏 </n-radio>
      </n-flex>
    </n-radio-group>
    <template #action>
      <c-button
        label="确定"
        async
        require-login
        type="primary"
        @click="
          selectedFavoredId === 'deleted'
            ? unfavoriteNovel()
            : favoriteNovel(selectedFavoredId)
        "
      />
    </template>
  </c-modal>
</template>
