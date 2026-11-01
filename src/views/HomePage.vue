<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import ParticleBackground from '../components/game/ParticleBackground.vue'
import GameButton from '../components/common/GameButton.vue'
import { useAccessStore } from '../stores/access'
import { useTestStore } from '../stores/test'
import { useResultStore } from '../stores/result'
import { defaultQuestions } from '../data/questions'
import { EXPLORE_DISCLAIMER } from '../config/copy'

const router = useRouter()
const route = useRoute()
const access = useAccessStore()
const testStore = useTestStore()
const resultStore = useResultStore()
const logoRef = ref(null)
const titleRef = ref(null)
const code = ref('')
const codeError = ref('')
const redeeming = ref(false)
const askedForCode = computed(() => route.query.need === '1')

onMounted(() => {
  access.ensureRestored()
  gsap.from(logoRef.value, {
    scale: 0.4,
    opacity: 0,
    duration: 0.8,
    ease: 'back.out(1.8)',
  })
  gsap.from(titleRef.value, {
    y: 24,
    opacity: 0,
    duration: 0.7,
    delay: 0.2,
    ease: 'power3.out',
  })
  gsap.to('.orbit-ring', {
    rotate: 360,
    duration: 18,
    repeat: -1,
    ease: 'none',
  })
})

function startAdventure(resume = false) {
  if (!access.unlocked) return
  if (!resume) {
    testStore.clearProgress()
    resultStore.clearResult()
  }
  router.push('/test')
}

async function submitCode() {
  codeError.value = ''
  redeeming.value = true
  try {
    const result = await access.redeem(code.value)
    if (!result.ok) {
      codeError.value = result.error
      return
    }
    code.value = ''
    if (route.query.need) router.replace('/')
  } finally {
    redeeming.value = false
  }
}
</script>

<template>
  <div class="page home">
    <ParticleBackground />
    <div class="page-inner home__inner">
      <div class="logo-stage" ref="logoRef">
        <div class="orbit-ring" />
        <div class="orbit-ring orbit-ring--2" />
        <div class="planet">
          <span class="planet__star">✦</span>
        </div>
      </div>

      <div ref="titleRef" class="home__copy">
        <p class="eyebrow">TureCareer Explorer</p>
        <h1>未来探索者</h1>
        <p class="subtitle">
          用一场星际小冒险，走进具体的工作情境。职业兴趣决定方向，做事方式只在同类职业里帮你排序。
        </p>
        <ul class="intro">
          <li>完成后可以看到你更愿意做的事</li>
          <li>以及对应的专业大类、职业中类</li>
          <li>和若干示例专业、示例岗位</li>
        </ul>
      </div>

      <div class="home__actions">
        <p v-if="access.restoring" class="tips">正在确认兑换状态...</p>
        <template v-else-if="access.unlocked">
          <p class="unlocked">这台设备已解锁</p>
          <GameButton size="lg" block @click="startAdventure(false)">开始冒险</GameButton>
          <GameButton
            v-if="testStore.hasProgress"
            variant="secondary"
            block
            @click="startAdventure(true)"
          >
            继续上次探索
          </GameButton>
          <GameButton
            v-if="resultStore.hasResult && !testStore.hasProgress"
            variant="ghost"
            block
            @click="router.push('/result')"
          >
            查看上次结果
          </GameButton>
        </template>
        <form v-else class="code-form" @submit.prevent="submitCode">
          <p v-if="askedForCode && !codeError" class="code-error">请先输入兑换码</p>
          <label for="access-code">小红书付款后获得的兑换码</label>
          <input
            id="access-code"
            v-model="code"
            autocomplete="off"
            autocapitalize="characters"
            maxlength="12"
            placeholder="例如 ABCD-EFGH"
          />
          <p v-if="codeError" class="code-error">{{ codeError }}</p>
          <GameButton size="lg" block :disabled="redeeming" @click="submitCode">
            {{ redeeming ? '正在核对...' : '使用兑换码' }}
          </GameButton>
          <p class="tips">一个码只在一台设备上使用一次。请在这台设备上做完并查看结果。</p>
        </form>
      </div>

      <p class="tips">共 {{ defaultQuestions.length }} 关 · 约 8 分钟 · 手机友好</p>
      <p class="disclaimer">{{ EXPLORE_DISCLAIMER }}</p>
      <router-link class="admin-entry" to="/admin">管理入口</router-link>
    </div>
  </div>
</template>

<style scoped>
.home__inner {
  min-height: calc(100vh - 48px);
  min-height: calc(100dvh - 48px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 22px;
}

.logo-stage {
  position: relative;
  width: 180px;
  height: 180px;
  display: grid;
  place-items: center;
  margin-bottom: 8px;
}

.orbit-ring {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 2px dashed rgba(255, 255, 255, 0.28);
}

.orbit-ring--2 {
  inset: -8px;
  border-style: solid;
  border-color: rgba(34, 211, 238, 0.25);
  animation-direction: reverse;
}

.planet {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fde68a, #a855f7 45%, #1d4ed8 85%);
  box-shadow:
    0 0 40px rgba(168, 85, 247, 0.55),
    inset -12px -16px 28px rgba(15, 23, 42, 0.35);
  display: grid;
  place-items: center;
  animation: float 3.4s ease-in-out infinite;
}

.planet__star {
  font-size: 42px;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
}

.eyebrow {
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fde68a;
  margin-bottom: 8px;
}

h1 {
  font-size: clamp(2.4rem, 8vw, 3.6rem);
  font-weight: 900;
  line-height: 1.1;
  background: linear-gradient(120deg, #fff, #c4b5fd, #67e8f9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 8px 40px rgba(168, 85, 247, 0.35);
}

.subtitle {
  margin-top: 12px;
  color: var(--text-muted);
  line-height: 1.65;
  font-size: 1.02rem;
  max-width: 28em;
  margin-inline: auto;
}

.intro {
  margin: 14px auto 0;
  padding: 0;
  list-style: none;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
  font-size: 0.95rem;
}

.code-form {
  display: grid;
  gap: 10px;
  text-align: left;
}

.code-form label,
.unlocked {
  font-weight: 800;
  color: #fde68a;
}

.code-form input {
  width: 100%;
  min-height: 48px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 0 14px;
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.code-error {
  color: #fca5a5;
  font-weight: 700;
  line-height: 1.5;
}

.disclaimer {
  max-width: 34em;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.82rem;
  line-height: 1.6;
}

.home__actions {
  width: min(360px, 100%);
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

.tips {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.9rem;
  font-weight: 700;
}

.admin-entry {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 4px;
}

.admin-entry:hover {
  color: rgba(255, 255, 255, 0.65);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
