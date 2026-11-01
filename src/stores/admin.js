import { defineStore } from 'pinia'
import { defaultQuestions } from '../data/questions'
import { defaultProfiles } from '../data/profiles'
import { filterHollandProfiles, isCurrentQuestionList, normalizeQuestionList, packOptions } from '../data/scale'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { STORAGE_KEYS } from '../config/storage'

const AUTH_KEY = STORAGE_KEYS.adminAuth
const DATA_KEY = STORAGE_KEYS.adminData

function loadLocalData() {
  try {
    return JSON.parse(localStorage.getItem(DATA_KEY) || 'null')
  } catch {
    return null
  }
}

const localData = loadLocalData()
const storedProfiles = filterHollandProfiles(localData?.recommendations)
const storedQuestions =
  localData?.questions && isCurrentQuestionList(localData.questions)
    ? normalizeQuestionList(localData.questions)
    : defaultQuestions

export const useAdminStore = defineStore('admin', {
  state: () => ({
    authenticated: localStorage.getItem(AUTH_KEY) === '1',
    questions: storedQuestions.map((q) => ({
      ...q,
      options: q.options.map((o) => ({ ...o })),
    })),
    recommendations: (storedProfiles.length ? storedProfiles : defaultProfiles).map((item) => ({
      ...item,
      careers: item.careers.map((c) => ({ ...c })),
      majors: item.majors.map((m) => ({ ...m })),
    })),
    saving: false,
    message: '',
  }),

  getters: {
    questionCount: (state) => state.questions.length,
    typeCoverage: (state) => {
      const complete = state.recommendations.filter(
        (r) => r.careers?.length >= 3 && r.majors?.length >= 3 && r.description,
      ).length
      return { complete, total: state.recommendations.length }
    },
  },

  actions: {
    persistLocal() {
      localStorage.setItem(
        DATA_KEY,
        JSON.stringify({
          questions: this.questions,
          recommendations: this.recommendations,
        }),
      )
    },

    login(password) {
      const expected = import.meta.env.VITE_ADMIN_PASSWORD || '123456'
      if (password === expected) {
        this.authenticated = true
        localStorage.setItem(AUTH_KEY, '1')
        return true
      }
      return false
    },

    logout() {
      this.authenticated = false
      localStorage.removeItem(AUTH_KEY)
    },

    async hydrateFromRemote() {
      if (!isSupabaseConfigured || !supabase) return
      const [qRes, rRes] = await Promise.all([
        supabase.from('questions').select('*').order('order_index', { ascending: true }),
        supabase.from('mbti_recommendations').select('*'),
      ])
      if (qRes.data?.length && isCurrentQuestionList(qRes.data)) {
        this.questions = normalizeQuestionList(qRes.data)
      }
      const usable = filterHollandProfiles(
        (rRes.data || []).map((row) => ({
          type: row.mbti_type,
          typeName: row.type_name,
          description: row.description,
          careers: row.careers,
          majors: row.majors,
        })),
      )
      if (usable.length) this.recommendations = usable
    },

    addQuestion(question) {
      const nextId = Math.max(0, ...this.questions.map((q) => q.id)) + 1
      this.questions.push({
        ...question,
        id: nextId,
        order_index: this.questions.length + 1,
      })
      this.persistLocal()
    },

    updateQuestion(id, patch) {
      const idx = this.questions.findIndex((q) => q.id === id)
      if (idx >= 0) {
        this.questions[idx] = { ...this.questions[idx], ...patch }
        this.persistLocal()
      }
    },

    removeQuestion(id) {
      this.questions = this.questions.filter((q) => q.id !== id)
      this.questions.forEach((q, i) => {
        q.order_index = i + 1
      })
      this.persistLocal()
    },

    reorderQuestions(fromIndex, toIndex) {
      if (fromIndex === toIndex) return
      const list = [...this.questions]
      const [item] = list.splice(fromIndex, 1)
      list.splice(toIndex, 0, item)
      list.forEach((q, i) => {
        q.order_index = i + 1
      })
      this.questions = list
      this.persistLocal()
    },

    updateRecommendation(type, patch) {
      const idx = this.recommendations.findIndex((r) => r.type === type)
      if (idx >= 0) {
        this.recommendations[idx] = { ...this.recommendations[idx], ...patch }
        this.persistLocal()
      }
    },

    exportJson() {
      return JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          questions: this.questions,
          recommendations: this.recommendations,
        },
        null,
        2,
      )
    },

    importJson(jsonText) {
      const data = JSON.parse(jsonText)
      const nextQuestions = data.questions || null
      const nextRecommendations = data.recommendations
        ? filterHollandProfiles(data.recommendations)
        : null
      if (nextQuestions && !isCurrentQuestionList(nextQuestions)) {
        this.message = '这份题库不是当前的情境题，未导入'
        return
      }
      if (data.recommendations && !nextRecommendations?.length) {
        this.message = '推荐数据不是六种职业兴趣，未导入'
        return
      }
      if (nextQuestions) this.questions = normalizeQuestionList(nextQuestions)
      if (nextRecommendations?.length) this.recommendations = nextRecommendations
      this.persistLocal()
      this.message = '导入成功'
    },

    async syncToSupabase() {
      if (!isSupabaseConfigured || !supabase) {
        this.message = '未配置 Supabase，已仅保存在本地内存（可导出 JSON）'
        return false
      }
      this.saving = true
      try {
        const qPayload = this.questions.map((question) => ({
          id: question.id,
          question_text: question.question_text,
          dimension: question.dimension,
          options: packOptions(question),
          order_index: question.order_index,
        }))
        const { error: qErr } = await supabase.from('questions').upsert(qPayload)
        if (qErr) throw qErr
        const questionIds = qPayload.map((item) => item.id)
        if (questionIds.length) {
          await supabase.from('questions').delete().not('id', 'in', `(${questionIds.join(',')})`)
        }

        const rPayload = this.recommendations.map((r) => ({
          mbti_type: r.type,
          type_name: r.typeName,
          description: r.description,
          careers: r.careers,
          majors: r.majors,
        }))
        const { error: rErr } = await supabase.from('mbti_recommendations').upsert(rPayload, {
          onConflict: 'mbti_type',
        })
        if (rErr) throw rErr
        await supabase
          .from('mbti_recommendations')
          .delete()
          .not('mbti_type', 'in', `(${rPayload.map((item) => `"${item.mbti_type}"`).join(',')})`)

        this.message = '已同步到 Supabase'
        return true
      } catch (err) {
        this.message = `同步失败：${err.message}`
        return false
      } finally {
        this.saving = false
      }
    },
  },
})
