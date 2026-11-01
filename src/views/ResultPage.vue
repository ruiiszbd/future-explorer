<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ParticleBackground from '../components/game/ParticleBackground.vue'
import GameButton from '../components/common/GameButton.vue'
import { useResultStore } from '../stores/result'
import { EXAMPLE_NOTE } from '../data/catalogView'
import { hollandActivity, interestHeadline } from '../data/scale'
import { EXPLORE_DISCLAIMER } from '../config/copy'

const router = useRouter()
const resultStore = useResultStore()
const headline = computed(() =>
  interestHeadline(resultStore.type, {
    tied: resultStore.tied,
    lowInterest: resultStore.lowInterest,
  }),
)

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
        <p class="label">{{ headline.label }}</p>
        <h1 class="type">{{ headline.title }}</h1>
        <p v-if="headline.note" class="type-name">{{ headline.note }}</p>
        <p v-if="resultStore.valueNote" class="value-note">{{ resultStore.valueNote }}</p>
        <p v-if="resultStore.styleNote" class="style-note">{{ resultStore.styleNote }}</p>
        <p class="desc">{{ resultStore.description }}</p>
      </section>

      <section class="bars glass-panel">
        <h2>六种活动的愿意程度</h2>
        <div v-for="bar in resultStore.bars" :key="bar.code" class="dim">
          <div class="dim__labels">
            <span :class="{ active: bar.active }">{{ hollandActivity(bar.code) || bar.label }}</span>
            <span :class="{ active: bar.active }">{{ bar.score }}/{{ bar.max }}</span>
          </div>
          <div class="dim__track">
            <div class="dim__fill" :style="{ width: `${bar.percent}%` }" />
          </div>
        </div>
      </section>

      <section class="catalog glass-panel">
        <h2>对应的专业大类</h2>
        <ul class="catalog-list">
          <li v-for="item in resultStore.majorCategories" :key="item.code">{{ item.name }}</li>
        </ul>
        <h2>对应的职业中类</h2>
        <ul class="catalog-list">
          <li v-for="item in resultStore.occupationMids" :key="item.code">{{ item.name }}</li>
        </ul>
        <p class="catalog-note">{{ EXAMPLE_NOTE }}</p>
      </section>

      <GameButton size="lg" block @click="router.push('/recommend')">
        查看职业方向推荐
      </GameButton>

      <p class="disclaimer">
        声明：{{ EXPLORE_DISCLAIMER }}当前优先给出值得了解的职业方向；院校推荐将在数据梳理完整后开放。
      </p>
    </div>
  </div>
</template>

<style scoped>
.hero,
.bars,
.catalog {
  padding: 24px 20px;
  margin-bottom: 16px;
}

.catalog h2 {
  margin: 0 0 12px;
  font-size: 1.15rem;
}

.catalog h2 + .catalog-list {
  margin-bottom: 18px;
}

.catalog-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.catalog-list li {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-weight: 700;
  line-height: 1.4;
}

.catalog-note {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.6;
}

.label {
  color: #fde68a;
  font-weight: 800;
  margin-bottom: 8px;
}

.type {
  font-size: clamp(1.7rem, 7vw, 2.4rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.35;
  background: linear-gradient(100deg, #fbbf24, #f472b6 40%, #a855f7 70%, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.type-name {
  margin-top: 10px;
  font-size: 1.35rem;
  font-weight: 800;
}

.value-note,
.style-note {
  margin-top: 12px;
  color: #fde68a;
  font-weight: 700;
  line-height: 1.6;
}

.style-note {
  color: #bae6fd;
  font-weight: 650;
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

.disclaimer {
  margin-top: 18px;
  font-size: 0.82rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.55);
}
</style>
