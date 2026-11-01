<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameButton from '../../components/common/GameButton.vue'
import { useAdminStore } from '../../stores/admin'
import { DIMENSION_OPTIONS, STYLE_PAIRS, choicesFor, dimensionLabel, isStyleCode, sectionOf } from '../../data/scale'

const admin = useAdminStore()
const router = useRouter()
const editingId = ref(null)
const dragFrom = ref(null)

const form = reactive({
  question_text: '',
  dimension: 'R',
  image: '',
  options: choicesFor('R'),
})

const sorted = computed(() =>
  [...admin.questions].sort((a, b) => a.order_index - b.order_index),
)

function resetForm() {
  editingId.value = null
  form.question_text = ''
  form.dimension = 'R'
  form.image = ''
  form.options = choicesFor('R')
}

function lettersFor(code) {
  return STYLE_PAIRS.find((pair) => pair.code === code)?.letters || []
}

function onDimensionChange() {
  form.options = choicesFor(form.dimension)
}

function startEdit(q) {
  editingId.value = q.id
  form.question_text = q.question_text
  form.dimension = q.dimension
  form.image = q.image || ''
  form.options = q.options.map((o) => ({ ...o }))
}

function save() {
  if (!form.question_text.trim()) {
    alert('请填写题干')
    return
  }
  if (form.options.some((o) => !o.text.trim())) {
    alert('请填写全部选项')
    return
  }
  const payload = {
    question_text: form.question_text.trim(),
    dimension: form.dimension,
    section: sectionOf(form.dimension),
    image: form.image || '',
    options: form.options.map((o) => ({
      ...o,
      text: o.text.trim(),
      trait: isStyleCode(form.dimension) ? o.trait : form.dimension,
      score: Number(o.score),
    })),
  }
  if (editingId.value) {
    admin.updateQuestion(editingId.value, payload)
  } else {
    admin.addQuestion(payload)
  }
  resetForm()
}

function remove(id) {
  if (confirm('确认删除该题目？')) admin.removeQuestion(id)
}

function onDragStart(index) {
  dragFrom.value = index
}

function onDrop(index) {
  if (dragFrom.value === null) return
  admin.reorderQuestions(dragFrom.value, index)
  dragFrom.value = null
}
</script>

<template>
  <div class="admin-page">
    <div class="shell">
      <header>
        <h1>题库管理</h1>
        <div class="actions">
          <GameButton size="sm" variant="ghost" @click="router.push('/admin')">返回仪表盘</GameButton>
        </div>
      </header>

      <section class="panel">
        <h2>{{ editingId ? `编辑题目 #${editingId}` : '新增题目' }}</h2>
        <label>
          题干
          <textarea v-model="form.question_text" rows="2" />
        </label>
        <label>
          维度
          <select v-model="form.dimension" @change="onDimensionChange">
            <option v-for="item in DIMENSION_OPTIONS" :key="item.code" :value="item.code">
              {{ item.label }}
            </option>
          </select>
        </label>
        <div v-for="opt in form.options" :key="opt.key" class="opt-row" :class="{ 'opt-row--style': isStyleCode(form.dimension) }">
          <strong>{{ opt.key }}</strong>
          <input v-model="opt.text" placeholder="选项文案" />
          <select v-if="isStyleCode(form.dimension)" v-model="opt.trait">
            <option v-for="letter in lettersFor(form.dimension)" :key="letter" :value="letter">{{ letter }}</option>
            <option value="">不分</option>
          </select>
          <select v-model.number="opt.score">
            <option :value="2">2 分</option>
            <option :value="1">1 分</option>
            <option :value="0">0 分</option>
          </select>
        </div>
        <div class="actions">
          <GameButton size="sm" @click="save">{{ editingId ? '保存修改' : '添加题目' }}</GameButton>
          <GameButton v-if="editingId" size="sm" variant="ghost" @click="resetForm">取消</GameButton>
        </div>
      </section>

      <section class="panel">
        <h2>题目列表（可拖拽排序）</h2>
        <article
          v-for="(q, index) in sorted"
          :key="q.id"
          class="q-item"
          draggable="true"
          @dragstart="onDragStart(index)"
          @dragover.prevent
          @drop="onDrop(index)"
        >
          <div class="q-item__head">
            <span>#{{ q.order_index }} · {{ dimensionLabel(q.dimension) }} {{ q.dimension }}</span>
            <div class="actions">
              <button @click="startEdit(q)">编辑</button>
              <button class="danger" @click="remove(q.id)">删除</button>
            </div>
          </div>
          <p>{{ q.question_text }}</p>
          <ul>
            <li v-for="o in q.options" :key="o.key">{{ o.key }}. {{ o.text }} → {{ o.score }} 分</li>
          </ul>
        </article>
      </section>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 20px 14px 40px;
  background: linear-gradient(160deg, #0f172a, #1e1b4b);
}

.shell {
  width: min(860px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

header,
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.panel,
.q-item {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  padding: 14px;
}

.panel {
  display: grid;
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
}

textarea,
input,
select {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  padding: 10px 12px;
}

.opt-row {
  display: grid;
  grid-template-columns: 28px 1fr 88px;
  gap: 8px;
  align-items: center;
}

.opt-row--style {
  grid-template-columns: 28px 1fr 72px 88px;
}

.q-item {
  margin-top: 10px;
  cursor: grab;
}

.q-item__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 800;
}

.q-item ul {
  margin-top: 8px;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
}

.actions button {
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
}

.actions .danger {
  background: rgba(248, 113, 113, 0.25);
}
</style>
