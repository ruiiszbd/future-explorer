<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GameButton from '../../components/common/GameButton.vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()
const router = useRouter()
const selectedType = ref(admin.recommendations[0]?.type || 'ISTJ')

const form = reactive({
  typeName: '',
  description: '',
  careersJson: '[]',
  majorsJson: '[]',
})

const types = computed(() => admin.recommendations.map((r) => r.type))

function loadType(type) {
  const item = admin.recommendations.find((r) => r.type === type)
  if (!item) return
  form.typeName = item.typeName
  form.description = item.description
  form.careersJson = JSON.stringify(item.careers, null, 2)
  form.majorsJson = JSON.stringify(item.majors, null, 2)
}

watch(selectedType, loadType, { immediate: true })

function save() {
  try {
    const careers = JSON.parse(form.careersJson)
    const majors = JSON.parse(form.majorsJson)
    admin.updateRecommendation(selectedType.value, {
      typeName: form.typeName,
      description: form.description,
      careers,
      majors,
    })
    admin.message = `${selectedType.value} 已保存到本地管理状态`
  } catch (err) {
    alert(`JSON 解析失败：${err.message}`)
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="shell">
      <header>
        <h1>推荐数据管理</h1>
        <GameButton size="sm" variant="ghost" @click="router.push('/admin')">返回仪表盘</GameButton>
      </header>

      <section class="panel">
        <label>
          选择 MBTI 类型
          <select v-model="selectedType">
            <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
          </select>
        </label>

        <label>
          类型名称
          <input v-model="form.typeName" />
        </label>

        <label>
          趣味描述
          <textarea v-model="form.description" rows="4" />
        </label>

        <label>
          职业推荐 JSON
          <textarea v-model="form.careersJson" rows="12" class="code" />
        </label>

        <label>
          专业推荐 JSON
          <textarea v-model="form.majorsJson" rows="12" class="code" />
        </label>

        <GameButton @click="save">保存当前类型</GameButton>
        <p v-if="admin.message" class="muted">{{ admin.message }}</p>
        <p class="hint">
          careers 字段建议包含：name, reason, salary, skills, industries, match；
          majors 字段建议包含：name, level, employmentRate, coreCourses, recommendedSchools, match。
        </p>
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

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.panel {
  display: grid;
  gap: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  padding: 16px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
}

input,
select,
textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  padding: 10px 12px;
}

.code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.82rem;
  line-height: 1.45;
}

.muted {
  color: rgba(255, 255, 255, 0.7);
}

.hint {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
  line-height: 1.5;
}
</style>
