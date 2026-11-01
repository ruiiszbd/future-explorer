<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ParticleBackground from '../components/game/ParticleBackground.vue'
import GameButton from '../components/common/GameButton.vue'
import ShareCard from '../components/share/ShareCard.vue'
import { useResultStore } from '../stores/result'
import { useTestStore } from '../stores/test'
import { usePrefsStore } from '../stores/prefs'
import { features } from '../config/features'
import { captureShareImage, downloadDataUrl } from '../utils/shareGenerator'
import { formatMajorLevel } from '../utils/majorFormat'
import { EXAMPLE_NOTE } from '../data/catalogView'
import { interestHeadline } from '../data/scale'
import { EXPLORE_DISCLAIMER } from '../config/copy'

const router = useRouter()
const resultStore = useResultStore()
const testStore = useTestStore()
const prefs = usePrefsStore()

const openCareer = ref(0)
const openMajor = ref(-1)
const sharing = ref(false)
const shareRef = ref(null)
const previewUrl = ref('')
const selectedProvince = ref(prefs.province || '')
const feedback = ref(prefs.getFeedback(resultStore.type) || '')
const schoolProvinces = ref([])
const enrichRecommendedSchools = ref(null)

const showSchools = features.schoolRecommendations
const showMajors = features.majorRecommendations
const headline = computed(() =>
  interestHeadline(resultStore.type, {
    tied: resultStore.tied,
    lowInterest: resultStore.lowInterest,
  }),
)

const enrichedMajors = computed(() =>
  resultStore.majors.map((major) => ({
    ...major,
    levelLabel: formatMajorLevel(major.level),
    schools:
      showSchools && enrichRecommendedSchools.value
        ? enrichRecommendedSchools.value(major.recommendedSchools || [], selectedProvince.value)
        : [],
  })),
)

const topSchoolNames = computed(() => {
  if (!showSchools) return []
  const names = []
  enrichedMajors.value.forEach((m) => {
    m.schools.forEach((s) => {
      if (!names.includes(s.name)) names.push(s.name)
    })
  })
  return names.slice(0, 3)
})

onMounted(async () => {
  if (!resultStore.hasResult) {
    router.replace('/')
    return
  }
  // 仅在开启院校推荐时加载全量院校库，避免无用大包
  if (showSchools) {
    const mod = await import('../utils/schoolRecommend')
    schoolProvinces.value = mod.schoolProvinces
    enrichRecommendedSchools.value = mod.enrichRecommendedSchools
  }
})

function onProvinceChange() {
  prefs.setProvince(selectedProvince.value)
}

function setFeedback(value) {
  feedback.value = value
  prefs.setFeedback(resultStore.type, value)
}

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
        <p>探索完成</p>
        <h1>{{ headline.title }}</h1>
        <p v-if="headline.note" class="headline-note">{{ headline.note }}</p>
        <span v-if="resultStore.lowInterest">活动兴趣还不集中，下面只是了解的起点</span>
        <span v-else>按你愿意做的活动和工作条件整理。院校推荐将在数据梳理完整后开放</span>
        <p v-if="resultStore.valueNote" class="value-note">{{ resultStore.valueNote }}</p>
        <p v-if="resultStore.styleNote" class="style-note">{{ resultStore.styleNote }}</p>
      </header>

      <section v-if="showSchools" class="filter glass-panel">
        <label for="province">所在省份（可选，用于优先展示本省院校）</label>
        <select id="province" v-model="selectedProvince" @change="onProvinceChange">
          <option value="">不限省份</option>
          <option v-for="p in schoolProvinces" :key="p" :value="p">{{ p }}</option>
        </select>
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
        <p class="block-tip">{{ EXAMPLE_NOTE }}负责人岗位、军队人员，以及不便分类的其他从业人员，不作为入门推荐。</p>
      </section>

      <section v-if="showMajors" class="block block--secondary">
        <h2>示例专业</h2>
        <p class="block-tip">只列出上面大类里的例子，暂不绑定具体院校</p>
        <article
          v-for="(major, i) in enrichedMajors"
          :key="major.name"
          class="card glass-panel"
          :class="{ open: openMajor === i }"
          @click="toggleMajor(i)"
        >
          <div class="card__top">
            <div>
              <h3>{{ major.name }}</h3>
              <p class="match">
                {{ major.majorCategoryName }}<template v-if="major.majorClassName"> · {{ major.majorClassName }}</template>
                · {{ major.levelLabel }} · {{ major.interestLabel }}
              </p>
            </div>
            <span class="chev">{{ openMajor === i ? '收起' : '展开' }}</span>
          </div>
          <div v-show="openMajor === i" class="card__body">
            <p v-if="major.catalogName"><strong>目录名称：</strong>{{ major.catalogName }}</p>
            <p v-if="major.majorCode"><strong>专业代码：</strong>{{ major.majorCode }}</p>
            <p><strong>核心课程：</strong>{{ (major.coreCourses || []).join('、') }}</p>
            <div v-if="showSchools" class="schools">
              <strong>推荐院校（可核验）：</strong>
              <ul>
                <li v-for="school in major.schools" :key="school.name">
                  <span>{{ school.name }}</span>
                  <span class="tag">{{ school.levelLabel }}</span>
                  <span v-if="school.city" class="muted">{{ school.province }}{{ school.city }}</span>
                  <span v-if="school.inProvince" class="tag tag--local">本省优先</span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section class="block">
        <h2>示例岗位</h2>
        <p class="block-tip">只列出上面中类里的例子。展开可查看相近活动、入学前核对与技能</p>
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
              <p class="match">
                <template v-if="career.occupationMidName">{{ career.occupationMidName }} · </template>{{ career.interestLabel }}
              </p>
            </div>
            <span class="chev">{{ openCareer === i ? '收起' : '展开' }}</span>
          </div>
          <div v-show="openCareer === i" class="card__body">
            <p>{{ career.reason }}</p>
            <p v-if="career.checks?.length"><strong>入学前核对：</strong>{{ career.checks.join('；') }}</p>
            <p><strong>所需技能：</strong>{{ career.skills }}</p>
            <p><strong>就业方向：</strong>{{ (career.industries || []).join('、') }}</p>
          </div>
        </article>
      </section>

      <section class="feedback glass-panel">
        <h2>这次职业方向推荐对你有帮助吗？</h2>
        <div class="feedback__btns">
          <button
            type="button"
            :class="{ active: feedback === 'useful' }"
            @click="setFeedback('useful')"
          >
            有用
          </button>
          <button
            type="button"
            :class="{ active: feedback === 'ok' }"
            @click="setFeedback('ok')"
          >
            一般
          </button>
          <button
            type="button"
            :class="{ active: feedback === 'useless' }"
            @click="setFeedback('useless')"
          >
            没用
          </button>
        </div>
        <p v-if="feedback" class="thanks">已记录，谢谢反馈</p>
      </section>

      <p class="disclaimer">
        声明：{{ EXPLORE_DISCLAIMER }}当前优先提供职业方向建议；具体院校推荐将在学校与专业数据梳理完整后开放。
      </p>

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

      <div class="share-offscreen" aria-hidden="true">
        <div ref="shareRef">
          <ShareCard
            :type="headline.title"
            :type-name="headline.note"
            :description="resultStore.description"
            :careers="resultStore.careers"
            :majors="showMajors ? enrichedMajors : []"
            :schools="topSchoolNames"
            :province="showSchools ? selectedProvince : ''"
            :show-schools="showSchools"
            :show-majors="showMajors"
            :value-line="[resultStore.valueNote, resultStore.styleNote].filter(Boolean).join(' ')"
            :major-categories="resultStore.majorCategories"
            :occupation-mids="resultStore.occupationMids"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.head,
.filter,
.feedback,
.catalog {
  padding: 20px;
  margin-bottom: 16px;
}

.catalog h2 {
  margin: 0 0 12px;
  font-size: 1.15rem;
}

.catalog h2 + .catalog-list {
  margin-bottom: 16px;
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

.head p {
  color: #fde68a;
  font-weight: 800;
}

.head h1 {
  margin: 6px 0;
  font-size: 1.6rem;
  line-height: 1.35;
}

.headline-note {
  margin: 0 0 8px;
  font-weight: 800;
}

.head span,
.muted,
.block-tip {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.value-note,
.style-note {
  margin-top: 8px;
  color: #fde68a;
  font-weight: 700;
  line-height: 1.55;
}

.style-note {
  color: #bae6fd;
}

.block-tip {
  margin: -4px 0 12px;
}

.filter label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
}

.filter select {
  width: 100%;
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  padding: 0 12px;
}

.block {
  margin-bottom: 22px;
}

.block--secondary {
  opacity: 0.95;
}

.block h2,
.feedback h2 {
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

.schools ul {
  list-style: none;
  margin-top: 8px;
  display: grid;
  gap: 8px;
}

.schools li {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}

.tag {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.35);
  color: #e0f2fe;
}

.tag--local {
  background: rgba(52, 211, 153, 0.3);
  color: #d1fae5;
}

.feedback__btns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.feedback__btns button {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.feedback__btns button.active {
  border-color: rgba(34, 211, 238, 0.8);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(59, 130, 246, 0.35));
}

.thanks {
  margin-top: 10px;
  color: #86efac;
  font-weight: 700;
}

.disclaimer {
  margin: 8px 0 18px;
  font-size: 0.82rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.55);
}

.actions {
  display: grid;
  gap: 12px;
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
