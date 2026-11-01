import { defineStore } from 'pinia'
import { defaultQuestions } from '../data/questions'
import { isCurrentQuestionList, normalizeQuestionList } from '../data/scale'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { STORAGE_KEYS } from '../config/storage'

const STORAGE_KEY = STORAGE_KEYS.testProgress

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

    applyAdminQuestions() {
      try {
        const adminCache = JSON.parse(localStorage.getItem(STORAGE_KEYS.adminData) || 'null')
        if (adminCache?.questions?.length && isCurrentQuestionList(adminCache.questions)) {
          this.questions = normalizeQuestionList(adminCache.questions)
        }
      } catch {
        /* 继续使用内置题库 */
      }
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
          if (data?.length && isCurrentQuestionList(data)) {
            this.questions = normalizeQuestionList(data)
            return
          }
        }

        this.applyAdminQuestions()
      } catch (err) {
        console.warn('使用本地题库（远程拉取失败或仍是旧性格题）', err)
        this.error = err.message
        this.applyAdminQuestions()
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
        score: Number(option.score),
        text: option.text,
        dimension: this.currentQuestion.dimension,
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
