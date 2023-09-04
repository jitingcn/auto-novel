import { createRouter, createWebHistory } from 'vue-router';
import { useUserDataStore } from './data/stores/userData';

const history = createWebHistory();

function requireAdmin(from: any, to: any, next: any) {
  if (useUserDataStore().isAdmin) {
    next();
  } else {
    alert('没有管理员权限，无法访问页面');
    next({ path: '/' });
  }
}

const routes = [
  { path: '/', component: () => import('./pages/home/Index.vue') },

  {
    path: '/reset-password',
    component: () => import('./pages/other/ResetPassword.vue'),
  },

  {
    path: '/favorite-list',
    component: () => import('./pages/list/FavoriteList.vue'),
  },
  {
    path: '/read-history',
    component: () => import('./pages/list/ReadHistoryList.vue'),
  },
  {
    path: '/novel-list',
    component: () => import('./pages/list/WebNovelList.vue'),
  },
  {
    path: '/novel-rank/:providerId/:typeId',
    component: () => import('./pages/list/WebNovelRank.vue'),
  },
  {
    path: '/wenku-list',
    component: () => import('./pages/list/WenkuNovelList.vue'),
  },

  {
    path: '/novel/:providerId/:novelId',
    component: () => import('./pages/novel/WebNovel.vue'),
  },
  {
    path: '/wenku/non-archived',
    component: () => import('./pages/novel/WenkuNonArchived.vue'),
  },
  {
    path: '/wenku/:novelId',
    component: () => import('./pages/novel/WenkuNovel.vue'),
  },

  {
    path: '/novel/:providerId/:novelId/:chapterId',
    component: () => import('./pages/chapter/WebChapter.vue'),
  },

  {
    path: '/forum',
    component: () => import('./pages/forum/Forum.vue'),
  },
  {
    path: '/forum-edit',
    component: () => import('./pages/forum/ForumEdit.vue'),
  },
  {
    path: '/forum/:id',
    component: () => import('./pages/forum/ForumArticle.vue'),
  },
  {
    path: '/forum-edit/:id',
    component: () => import('./pages/forum/ForumEdit.vue'),
  },

  {
    path: '/admin',
    redirect: '/admin/web-patch-history',
    beforeEnter: requireAdmin,
    children: [
      {
        path: '/admin/web-patch-history',
        component: () => import('./pages/admin/AdminWebPatchHistory.vue'),
      },
      {
        path: '/admin/web-toc-merge-history',
        component: () => import('./pages/admin/AdminWebTocMergeHistory.vue'),
      },
      {
        path: '/admin/wenku-upload-history',
        component: () => import('./pages/admin/AdminWenkuUploadHistory.vue'),
      },
    ],
  },
];

const router = createRouter({
  history,
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

export default router;
