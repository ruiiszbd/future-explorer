<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import ParticleBackground from '../components/game/ParticleBackground.vue'
import { useTestStore } from '../stores/test'
import { useResultStore } from '../stores/result'

const router = useRouter()
const testStore = useTestStore()
const resultStore = useResultStore()
const tip = ref('正在校准星际罗盘...')
const shipRef = ref(null)

const tips = [
  '正在分析你的性格代码...',
  '正在比对职业星图...',
  '正在匹配专科航线...',
  '即将抵达结果星球...',
]

onMounted(async () => {
  if (!testStore.isComplete) {
    router.replace(testStore.hasProgress ? '/test' : '/')
    return
  }

  await resultStore.fetchRecommendations()
  resultStore.computeFromAnswers(testStore.answers)

  if (shipRef.value) {
    gsap.to(shipRef.value, {
      x: 40,
      y: -18,
      rotation: 8,
      duration: 1.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })
  }

  let i = 0
  const timer = setInterval(() => {
    i = (i + 1) % tips.length
    tip.value = tips[i]
  }, 700)

  setTimeout(() => {
    clearInterval(timer)
    router.replace('/result')
  }, 2800)
})
</script>

<template>
  <div class="page loading-page">
    <ParticleBackground />
    <div class="page-inner loading-inner">
      <div class="space-lane">
        <div class="trail" />
        <div ref="shipRef" class="ship" aria-hidden="true">🚀</div>
        <div class="planet-target" />
      </div>
      <h2>{{ tip }}</h2>
      <p>飞船正在穿越性格星云，请稍候</p>
      <div class="dots"><span /><span /><span /></div>
    </div>
  </div>
</template>

<style scoped>
.loading-inner {
  min-height: calc(100vh - 48px);
  min-height: calc(100dvh - 48px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 14px;
}

.space-lane {
  position: relative;
  width: min(320px, 90vw);
  height: 120px;
  margin-bottom: 12px;
}

.trail {
  position: absolute;
  left: 10%;
  right: 18%;
  top: 55%;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.8), transparent);
  animation: pulse 1.2s ease-in-out infinite;
}

.ship {
  position: absolute;
  left: 18%;
  top: 28%;
  font-size: 48px;
  filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.7));
}

.planet-target {
  position: absolute;
  right: 8%;
  top: 34%;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fde68a, #ec4899 60%, #6366f1);
  box-shadow: 0 0 24px rgba(236, 72, 153, 0.55);
  animation: pulse 1.4s ease-in-out infinite;
}

h2 {
  font-size: 1.35rem;
  min-height: 2em;
}

p {
  color: var(--text-muted);
}

.dots {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a855f7;
  animation: bounce 1s infinite ease-in-out;
}

.dots span:nth-child(2) {
  animation-delay: 0.15s;
  background: #3b82f6;
}

.dots span:nth-child(3) {
  animation-delay: 0.3s;
  background: #22d3ee;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}
</style>
