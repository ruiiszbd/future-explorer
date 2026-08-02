<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ParticleBackground from '../components/game/ParticleBackground.vue'
import GameButton from '../components/common/GameButton.vue'
import ShareCard from '../components/share/ShareCard.vue'
import { useResultStore } from '../stores/result'
import { useTestStore } from '../stores/test'
import { captureShareImage, downloadDataUrl } from '../utils/shareGenerator'

const router = useRouter()
const resultStore = useResultStore()
const testStore = useTestStore()

const openCareer = ref(0)
const openMajor = ref(0)
const sharing = ref(false)
const shareRef = ref(null)
const previewUrl = ref('')

onMounted(() => {
  if (!resultStore.hasResult) router.replace('/')
})

function toggleCareer(i) {
  openCareer.value = openCareer.value === i ? -1 : i
}

function toggleMajor(i) {
  openMajor.value = openMajor.value === i ? -1 : i
}

async function shareResult() {
  sharing.value = true
  previewUrl.value = ''
  try {
    await nextTick()
    const url = await captureShareImage(shareRef.value)
    previewUrl.value = url
    downloadDataUrl(url, `未来探索者-${resultStore.type}.png`)
  } catch (err) {
    alert(`生成分享图失败：${err.message}`)
  } finally {
    sharing.value = false
  }
}

function restart() {
  testStore.clearProgress()
  resultStore.clearResult()
  router.push('/')
}
</script>

<template>
  <div class="page recommend-page">
    <ParticleBackground />
    <div v-if="resultStore.hasResult" class="page-inner">
      <header class="head glass-panel">
        <p>匹配完成</p>
        <h1>{{ resultStore.type }} · 专属航线</h1>
        <span>按匹配度从高到低排序</span>
      </header>

      <section class="block">
        <h2>职业推荐</h2>
        <article
          v-for="(career, i) in resultStore.careers"
          :key="career.name"
          class="card glass-panel"
          :class="{ open: openCareer === i }"
          @click="toggleCareer(i)"
        >
          <div class="card__top">
            <div>
              <h3>{{ career.name }}</h3>
              <p class="match">匹配度 {{ career.match || 80 }}%</p>
            </div>
            <span class="chev">{{ openCareer === i ? '收起' : '展开' }}</span>
          </div>
          <div v-show="openCareer === i" class="card__body">
            <p>{{ career.reason }}</p>
            <p><strong>薪资前景：</strong>{{ career.salary }}</p>
            <p><strong>所需技能：</strong>{{ career.skills }}</p>
            <p><strong>就业方向：</strong>{{ (career.industries || []).join('、') }}</p>
          </div>
        </article>
      </section>

      <section class="block">
        <h2>专业推荐</h2>
        <article
          v-for="(major, i) in resultStore.majors"
          :key="major.name"
          class="card glass-panel"
          :class="{ open: openMajor === i }"
          @click="toggleMajor(i)"
        >
          <div class="card__top">
            <div>
              <h3>{{ major.name }}</h3>
              <p class="match">{{ major.level }} · 匹配度 {{ major.match || 80 }}%</p>
            </div>
            <span class="chev">{{ openMajor === i ? '收起' : '展开' }}</span>
          </div>
          <div v-show="openMajor === i" class="card__body">
            <p><strong>就业率参考：</strong>{{ major.employmentRate }}</p>
            <p><strong>核心课程：</strong>{{ (major.coreCourses || []).join('、') }}</p>
            <p><strong>推荐院校层次/代表：</strong>{{ (major.recommendedSchools || []).join('、') }}</p>
          </div>
        </article>
      </section>

      <div class="actions">
        <GameButton block :disabled="sharing" @click="shareResult">
          {{ sharing ? '正在生成长图...' : '分享结果' }}
        </GameButton>
        <GameButton variant="secondary" block @click="restart">重新测试</GameButton>
        <GameButton variant="ghost" block @click="router.push('/result')">返回结果页</GameButton>
      </div>

      <div v-if="previewUrl" class="preview glass-panel">
        <p>长图已生成，可长按保存或使用已下载的文件分享</p>
        <img :src="previewUrl" alt="分享长图预览" />
      </div>

      <!-- 离屏分享卡 -->
      <div class="share-offscreen" aria-hidden="true">
        <div ref="shareRef">
          <ShareCard
            :type="resultStore.type"
            :type-name="resultStore.typeName"
            :description="resultStore.description"
            :careers="resultStore.careers"
            :majors="resultStore.majors"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.head {
  padding: 20px;
  margin-bottom: 18px;
}

.head p {
  color: #fde68a;
  font-weight: 800;
}

.head h1 {
  margin: 6px 0;
  font-size: 1.6rem;
}

.head span {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.block {
  margin-bottom: 22px;
}

.block h2 {
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.card {
  padding: 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.card.open {
  border-color: rgba(34, 211, 238, 0.55);
}

.card__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.card h3 {
  font-size: 1.08rem;
}

.match {
  margin-top: 4px;
  color: #67e8f9;
  font-size: 0.86rem;
  font-weight: 700;
}

.chev {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}

.card__body {
  margin-top: 12px;
  display: grid;
  gap: 8px;
  color: var(--text-muted);
  line-height: 1.55;
  font-size: 0.95rem;
}

.actions {
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

.preview {
  margin-top: 18px;
  padding: 14px;
}

.preview p {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.preview img {
  width: 100%;
  border-radius: 12px;
}

.share-offscreen {
  position: fixed;
  left: -9999px;
  top: 0;
  pointer-events: none;
}
</style>
