import { defineStore } from 'pinia'
import { defaultQuestions } from '../data/questions'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const STORAGE_KEY = 'turecareer_test_progress'

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useTestStore = defineStore('test', {
  state: () => {
    const saved = loadProgress()
    return {
      questions: defaultQuestions.map((q) => ({ ...q, options: [...q.options] })),
      currentIndex: saved?.currentIndex ?? 0,
      answers: saved?.answers ?? [],
      loading: false,
      error: null,
      hydrated: false,
    }
  },

  getters: {
    total: (state) => state.questions.length,
    progress: (state) =>
      state.questions.length ? Math.round((state.answers.length / state.questions.length) * 100) : 0,
    currentQuestion: (state) => state.questions[state.currentIndex] || null,
    isComplete: (state) =>
      state.questions.length > 0 && state.answers.length >= state.questions.length,
    hasProgress: (state) => state.answers.length > 0 && !state.isComplete,
  },

  actions: {
    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentIndex: this.currentIndex,
          answers: this.answers,
        }),
      )
    },

    clearProgress() {
      this.currentIndex = 0
      this.answers = []
      localStorage.removeItem(STORAGE_KEY)
    },

    async fetchQuestions() {
      this.loading = true
      this.error = null
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('order_index', { ascending: true })
          if (error) throw error
          if (data?.length) {
            this.questions = data
            return
          }
        }

        // 回退：管理后台本地编辑缓存
        const adminCache = JSON.parse(localStorage.getItem('turecareer_admin_data') || 'null')
        if (adminCache?.questions?.length) {
          this.questions = adminCache.questions
        }
      } catch (err) {
        console.warn('使用本地题库（远程拉取失败）', err)
        this.error = err.message
      } finally {
        this.loading = false
        this.hydrated = true
      }
    },

    selectOption(option) {
      if (!this.currentQuestion) return false

      this.answers[this.currentIndex] = {
        questionId: this.currentQuestion.id,
        key: option.key,
        trait: option.trait,
        text: option.text,
      }

      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex += 1
        this.persist()
        return false
      }

      this.persist()
      return true
    },

    goToQuestion(index) {
      if (index >= 0 && index < this.questions.length) {
        this.currentIndex = index
        this.persist()
      }
    },

    setQuestions(list) {
      this.questions = list
    },
  },
})
