import { createRouter, createWebHistory } from 'vue-router'
import { useAccessStore } from '../stores/access'
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
    meta: { title: '职业兴趣探索', requiresAccess: true },
  },
  {
    path: '/loading',
    name: 'loading',
    component: () => import('../views/LoadingPage.vue'),
    meta: { title: '分析中', requiresAccess: true },
  },
  {
    path: '/result',
    name: 'result',
    component: () => import('../views/ResultPage.vue'),
    meta: { title: '探索结果', requiresAccess: true },
  },
  {
    path: '/recommend',
    name: 'recommend',
    component: () => import('../views/RecommendPage.vue'),
    meta: { title: '职业方向推荐', requiresAccess: true },
  },
  {
    path: '/admin/codes',
    name: 'admin-codes',
    component: () => import('../views/Admin/CodeManage.vue'),
    meta: { title: '兑换码', requiresAdmin: true },
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

router.beforeEach(async (to) => {
  document.title = `${to.meta.title || '未来探索者'} · 未来探索者`
  if (to.meta.requiresAdmin) {
    const admin = useAdminStore()
    if (!admin.authenticated && to.name !== 'admin') {
      return { name: 'admin' }
    }
  }
  if (to.meta.requiresAccess) {
    const access = useAccessStore()
    await access.ensureRestored()
    if (!access.unlocked) return { path: '/', query: { need: '1' } }
  }
  return true
})

export default router
