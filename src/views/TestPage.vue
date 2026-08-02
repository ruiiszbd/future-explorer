<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ParticleBackground from '../components/game/ParticleBackground.vue'
import ProgressBar from '../components/game/ProgressBar.vue'
import OptionCard from '../components/game/OptionCard.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { useTestStore } from '../stores/test'
import { useResultStore } from '../stores/result'

const router = useRouter()
const testStore = useTestStore()
const resultStore = useResultStore()
const locking = ref(false)
const selectedKey = ref('')
const animKey = ref(0)

const question = computed(() => testStore.currentQuestion)
const planetLabels = ['水星', '金星', '地球', '火星', '木星', '土星', '天王星', '海王星']

onMounted(async () => {
  await Promise.all([testStore.fetchQuestions(), resultStore.fetchRecommendations()])
  if (testStore.isComplete) {
    router.replace('/loading')
  }
})

async function onSelect(option) {
  if (locking.value) return
  locking.value = true
  selectedKey.value = option.key

  await new Promise((r) => setTimeout(r, 280))
  const finished = testStore.selectOption(option)

  if (finished) {
    router.push('/loading')
    return
  }

  selectedKey.value = ''
  animKey.value += 1
  locking.value = false
}

function planetName(index) {
  return planetLabels[index % planetLabels.length]
}
</script>

<template>
  <div class="page test-page">
    <ParticleBackground />
    <div class="page-inner">
      <header class="test-header glass-panel">
        <ProgressBar :current="Math.min(testStore.currentIndex + 1, testStore.total)" :total="testStore.total" />
      </header>

      <LoadingSpinner v-if="!testStore.hydrated && testStore.loading" text="正在同步题库..." />

      <Transition name="fade-slide" mode="out-in">
        <section v-if="question" :key="`${question.id}-${animKey}`" class="quest glass-panel">
          <div class="quest__badge">第 {{ testStore.currentIndex + 1 }} 关 · {{ planetName(testStore.currentIndex) }}站</div>
          <h2>{{ question.question_text }}</h2>
          <div class="quest__options">
            <OptionCard
              v-for="opt in question.options"
              :key="opt.key"
              :option-key="opt.key"
              :text="opt.text"
              :selected="selectedKey === opt.key"
              :disabled="locking"
              @select="onSelect(opt)"
            />
          </div>
        </section>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.test-header {
  padding: 16px 18px;
  margin-bottom: 18px;
}

.quest {
  padding: 22px 18px 20px;
}

.quest__badge {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  color: #0f172a;
  background: linear-gradient(90deg, #fde68a, #f9a8d4);
  margin-bottom: 14px;
}

h2 {
  font-size: clamp(1.35rem, 4.5vw, 1.7rem);
  line-height: 1.35;
  margin-bottom: 18px;
}

.quest__options {
  display: grid;
  gap: 12px;
}
</style>
