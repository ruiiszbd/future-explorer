<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameButton from '../../components/common/GameButton.vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()
const router = useRouter()
const editingId = ref(null)
const dragFrom = ref(null)

const form = reactive({
  question_text: '',
  dimension: 'EI',
  options: [
    { key: 'A', text: '', trait: 'E' },
    { key: 'B', text: '', trait: 'I' },
    { key: 'C', text: '', trait: 'E' },
    { key: 'D', text: '', trait: 'I' },
  ],
})

const sorted = computed(() =>
  [...admin.questions].sort((a, b) => a.order_index - b.order_index),
)

const traitOptions = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P'],
}

function resetForm() {
  editingId.value = null
  form.question_text = ''
  form.dimension = 'EI'
  form.options = [
    { key: 'A', text: '', trait: 'E' },
    { key: 'B', text: '', trait: 'I' },
    { key: 'C', text: '', trait: 'E' },
    { key: 'D', text: '', trait: 'I' },
  ]
}

function onDimensionChange() {
  const [a, b] = traitOptions[form.dimension]
  form.options[0].trait = a
  form.options[1].trait = b
  form.options[2].trait = a
  form.options[3].trait = b
}

function startEdit(q) {
  editingId.value = q.id
  form.question_text = q.question_text
  form.dimension = q.dimension
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
    options: form.options.map((o) => ({ ...o, text: o.text.trim() })),
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
            <option value="EI">E/I</option>
            <option value="SN">S/N</option>
            <option value="TF">T/F</option>
            <option value="JP">J/P</option>
          </select>
        </label>
        <div v-for="opt in form.options" :key="opt.key" class="opt-row">
          <strong>{{ opt.key }}</strong>
          <input v-model="opt.text" placeholder="选项文案" />
          <select v-model="opt.trait">
            <option v-for="t in traitOptions[form.dimension]" :key="t" :value="t">{{ t }}</option>
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
            <span>#{{ q.order_index }} · {{ q.dimension }}</span>
            <div class="actions">
              <button @click="startEdit(q)">编辑</button>
              <button class="danger" @click="remove(q.id)">删除</button>
            </div>
          </div>
          <p>{{ q.question_text }}</p>
          <ul>
            <li v-for="o in q.options" :key="o.key">{{ o.key }}. {{ o.text }} → {{ o.trait }}</li>
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
  grid-template-columns: 28px 1fr 70px;
  gap: 8px;
  align-items: center;
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
