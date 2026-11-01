<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GameButton from '../../components/common/GameButton.vue'
import { createAccessCodes, listAccessCodes } from '../../services/accessCodes'
import { formatAccessCode } from '../../utils/accessCode'

const router = useRouter()
const password = ref('')
const count = ref(10)
const message = ref('')
const busy = ref(false)
const codes = ref([])

const unusedText = () =>
  codes.value
    .filter((item) => !item.redeemedAt)
    .map((item) => formatAccessCode(item.code))
    .join('\n')

async function loadList(options = {}) {
  if (!options.keepMessage) message.value = ''
  busy.value = true
  try {
    const result = await listAccessCodes(password.value)
    if (!result.ok) {
      message.value = result.error
      return
    }
    codes.value = result.codes
  } finally {
    busy.value = false
  }
}

async function generate() {
  message.value = ''
  busy.value = true
  try {
    const result = await createAccessCodes(password.value, Number(count.value))
    if (!result.ok) {
      message.value = result.error
      return
    }
    message.value = `已生成 ${result.codes.length} 个兑换码`
    await loadList({ keepMessage: true })
  } finally {
    busy.value = false
  }
}

async function copyUnused() {
  const text = unusedText()
  if (!text) {
    message.value = '没有未使用的兑换码'
    return
  }
  await navigator.clipboard.writeText(text)
  message.value = '未使用的兑换码已复制'
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-shell">
      <header class="top">
        <div>
          <h1>兑换码</h1>
          <p class="muted">付款后把一个码发给买家。买家在首页输入，这台设备就可以做题和看结果。</p>
        </div>
        <GameButton size="sm" variant="ghost" @click="router.push('/admin')">返回</GameButton>
      </header>

      <section class="panel">
        <p class="muted">
          先在 Supabase 执行 supabase/access-codes.sql，再把 admin_config 里的 code_admin_secret 改成和管理后台相同的密码，至少 8 位。
        </p>
        <input v-model="password" type="password" placeholder="管理密码" autocomplete="current-password" />
        <div class="row">
          <input v-model.number="count" type="number" min="1" max="100" />
          <GameButton size="sm" :disabled="busy" @click="generate">生成</GameButton>
          <GameButton size="sm" variant="secondary" :disabled="busy" @click="loadList">刷新列表</GameButton>
          <GameButton size="sm" variant="ghost" :disabled="busy" @click="copyUnused">复制未使用</GameButton>
        </div>
        <p v-if="message" class="muted">{{ message }}</p>
      </section>

      <section v-if="codes.length" class="panel">
        <h2>最近 {{ codes.length }} 个</h2>
        <ul class="code-list">
          <li v-for="item in codes" :key="item.code">
            <strong>{{ formatAccessCode(item.code) }}</strong>
            <span>{{ item.redeemedAt ? '已使用' : '未使用' }}</span>
          </li>
        </ul>
      </section>
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
  line-height: 1.55;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.panel {
  padding: 16px;
  display: grid;
  gap: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

input {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 0 12px;
}

input[type='password'] {
  width: 100%;
}

input[type='number'] {
  width: 88px;
}

.code-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.code-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}

.code-list span {
  color: rgba(255, 255, 255, 0.65);
}
</style>
