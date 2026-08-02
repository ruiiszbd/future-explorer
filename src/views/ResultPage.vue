<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ParticleBackground from '../components/game/ParticleBackground.vue'
import GameButton from '../components/common/GameButton.vue'
import { useResultStore } from '../stores/result'

const router = useRouter()
const resultStore = useResultStore()

onMounted(() => {
  if (!resultStore.hasResult) {
    router.replace('/')
  }
})
</script>

<template>
  <div class="page result-page">
    <ParticleBackground />
    <div v-if="resultStore.hasResult" class="page-inner">
      <section class="hero glass-panel">
        <p class="label">你的性格代码</p>
        <h1 class="type">{{ resultStore.type }}</h1>
        <p class="type-name">{{ resultStore.typeName }}</p>
        <p class="desc">{{ resultStore.description }}</p>
      </section>

      <section class="bars glass-panel">
        <h2>四维能量条</h2>
        <div v-for="bar in resultStore.bars" :key="bar.high" class="dim">
          <div class="dim__labels">
            <span :class="{ active: bar.dominant === bar.low }">{{ bar.lowLabel }}</span>
            <span :class="{ active: bar.dominant === bar.high }">{{ bar.highLabel }}</span>
          </div>
          <div class="dim__track">
            <div class="dim__fill" :style="{ width: `${bar.highPercent}%` }" />
            <div class="dim__marker" :style="{ left: `${bar.highPercent}%` }">
              {{ bar.highPercent }}%
            </div>
          </div>
        </div>
      </section>

      <GameButton size="lg" block @click="router.push('/recommend')">
        查看职业/专业推荐
      </GameButton>
    </div>
  </div>
</template>

<style scoped>
.hero,
.bars {
  padding: 24px 20px;
  margin-bottom: 16px;
}

.label {
  color: #fde68a;
  font-weight: 800;
  margin-bottom: 8px;
}

.type {
  font-size: clamp(3rem, 14vw, 4.5rem);
  font-weight: 900;
  letter-spacing: 0.12em;
  line-height: 1;
  background: linear-gradient(100deg, #fbbf24, #f472b6 40%, #a855f7 70%, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: glow-text 2.4s ease-in-out infinite;
}

.type-name {
  margin-top: 10px;
  font-size: 1.35rem;
  font-weight: 800;
}

.desc {
  margin-top: 14px;
  color: var(--text-muted);
  line-height: 1.7;
}

.bars h2 {
  margin-bottom: 16px;
  font-size: 1.15rem;
}

.dim + .dim {
  margin-top: 18px;
}

.dim__labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.86rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 8px;
}

.dim__labels .active {
  color: #fff;
}

.dim__track {
  position: relative;
  height: 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: visible;
}

.dim__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #22d3ee, #3b82f6, #a855f7);
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.dim__marker {
  position: absolute;
  top: -28px;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}

@keyframes glow-text {
  0%,
  100% {
    filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.35));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(34, 211, 238, 0.55));
  }
}
</style>
