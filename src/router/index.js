import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '../stores/admin'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/TestPage.vue'),
    meta: { title: '性格探索' },
  },
  {
    path: '/loading',
    name: 'loading',
    component: () => import('../views/LoadingPage.vue'),
    meta: { title: '分析中' },
  },
  {
    path: '/result',
    name: 'result',
    component: () => import('../views/ResultPage.vue'),
    meta: { title: '探索结果' },
  },
  {
    path: '/recommend',
    name: 'recommend',
    component: () => import('../views/RecommendPage.vue'),
    meta: { title: '职业与专业推荐' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/Admin/Dashboard.vue'),
    meta: { title: '管理后台', requiresAdmin: true },
  },
  {
    path: '/admin/questions',
    name: 'admin-questions',
    component: () => import('../views/Admin/QuestionManage.vue'),
    meta: { title: '题库管理', requiresAdmin: true },
  },
  {
    path: '/admin/data',
    name: 'admin-data',
    component: () => import('../views/Admin/DataManage.vue'),
    meta: { title: '推荐数据', requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '未来探索者'} · 未来探索者`
  if (to.meta.requiresAdmin) {
    const admin = useAdminStore()
    if (!admin.authenticated && to.name !== 'admin') {
      return { name: 'admin' }
    }
  }
  return true
})

export default router
