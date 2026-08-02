<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import ParticleBackground from '../components/game/ParticleBackground.vue'
import GameButton from '../components/common/GameButton.vue'
import { useTestStore } from '../stores/test'
import { useResultStore } from '../stores/result'

const router = useRouter()
const testStore = useTestStore()
const resultStore = useResultStore()
const logoRef = ref(null)
const titleRef = ref(null)

onMounted(() => {
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
  if (!resume) {
    testStore.clearProgress()
    resultStore.clearResult()
  }
  router.push('/test')
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
          用一场星际小冒险，读懂性格代码，解锁适合你的专科专业与职业航线。
        </p>
      </div>

      <div class="home__actions">
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
      </div>

      <p class="tips">共 16 关 · 约 3 分钟 · 手机友好</p>
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
