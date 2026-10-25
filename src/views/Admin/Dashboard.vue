<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameButton from '../../components/common/GameButton.vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()
const router = useRouter()
const password = ref('')
const error = ref('')

onMounted(async () => {
  if (admin.authenticated) {
    await admin.hydrateFromRemote()
  }
})

function handleLogin() {
  error.value = ''
  if (!admin.login(password.value)) {
    error.value = '密码错误。请确认 VITE_ADMIN_PASSWORD（本地见 .env，线上见 Netlify 环境变量）'
    return
  }
  admin.hydrateFromRemote()
}

function go(path) {
  router.push(path)
}

function downloadBackup() {
  const blob = new Blob([admin.exportJson()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `turecareer-backup-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

async function onImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const text = await file.text()
  try {
    admin.importJson(text)
  } catch (err) {
    admin.message = `导入失败：${err.message}`
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-shell">
      <template v-if="!admin.authenticated">
        <h1>管理后台登录</h1>
        <p class="muted">仅管理员可见。请使用环境变量 VITE_ADMIN_PASSWORD 设置的密码登录。</p>
        <p class="muted warn">安全提示：上线后请勿继续使用弱默认密码；在 Netlify 环境变量中修改 VITE_ADMIN_PASSWORD 并重新部署。</p>
        <input v-model="password" type="password" placeholder="输入管理密码" @keyup.enter="handleLogin" />
        <p v-if="error" class="error">{{ error }}</p>
        <GameButton block @click="handleLogin">登录</GameButton>
        <GameButton variant="ghost" block @click="router.push('/')">返回首页</GameButton>
      </template>

      <template v-else>
        <header class="top">
          <div>
            <h1>仪表盘</h1>
            <p class="muted">未来探索者内容管理</p>
          </div>
          <GameButton size="sm" variant="ghost" @click="admin.logout()">退出</GameButton>
        </header>

        <div class="stats">
          <div class="stat">
            <strong>{{ admin.questionCount }}</strong>
            <span>题目总数</span>
          </div>
          <div class="stat">
            <strong>{{ admin.typeCoverage.complete }}/{{ admin.typeCoverage.total }}</strong>
            <span>推荐数据完整类型</span>
          </div>
        </div>

        <div class="nav-grid">
          <button class="nav-card" @click="go('/admin/questions')">题库管理</button>
          <button class="nav-card" @click="go('/admin/data')">推荐数据管理</button>
        </div>

        <section class="panel">
          <h2>数据备份</h2>
          <div class="row">
            <GameButton size="sm" @click="downloadBackup">导出 JSON</GameButton>
            <label class="file-btn">
              导入 JSON
              <input type="file" accept="application/json" hidden @change="onImport" />
            </label>
            <GameButton size="sm" variant="secondary" :disabled="admin.saving" @click="admin.syncToSupabase()">
              {{ admin.saving ? '同步中...' : '同步到 Supabase' }}
            </GameButton>
          </div>
          <p v-if="admin.message" class="muted">{{ admin.message }}</p>
        </section>

        <GameButton variant="ghost" block @click="router.push('/')">返回前台</GameButton>
      </template>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px 16px;
  background: linear-gradient(160deg, #0f172a, #1e1b4b 50%, #312e81);
}

.admin-shell {
  width: min(760px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

h1 {
  font-size: 1.6rem;
}

.muted {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.92rem;
}

.warn {
  color: #fde68a;
  margin-top: 6px;
}

.error {
  color: #fca5a5;
}

input[type='password'] {
  width: 100%;
  min-height: 48px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 0 14px;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat,
.panel,
.nav-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
}

.stat {
  padding: 18px;
  display: grid;
  gap: 6px;
}

.stat strong {
  font-size: 1.8rem;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.nav-card {
  min-height: 88px;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.panel {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.file-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 560px) {
  .nav-grid,
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
