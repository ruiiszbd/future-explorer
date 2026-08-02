import { defineStore } from 'pinia'
import { defaultMbtiData, mbtiTypeMap } from '../data/mbtiData'
import { calculateMbti } from '../utils/mbtiCalculator'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const RESULT_KEY = 'turecareer_result'

export const useResultStore = defineStore('result', {
  state: () => {
    let saved = null
    try {
      saved = JSON.parse(localStorage.getItem(RESULT_KEY) || 'null')
    } catch {
      saved = null
    }
    return {
      recommendations: [...defaultMbtiData],
      type: saved?.type || '',
      typeName: saved?.typeName || '',
      description: saved?.description || '',
      bars: saved?.bars || [],
      scores: saved?.scores || {},
      careers: saved?.careers || [],
      majors: saved?.majors || [],
      loading: false,
    }
  },

  getters: {
    hasResult: (state) => Boolean(state.type),
    recommendationMap: (state) =>
      Object.fromEntries(state.recommendations.map((item) => [item.type, item])),
  },

  actions: {
    persist() {
      localStorage.setItem(
        RESULT_KEY,
        JSON.stringify({
          type: this.type,
          typeName: this.typeName,
          description: this.description,
          bars: this.bars,
          scores: this.scores,
          careers: this.careers,
          majors: this.majors,
        }),
      )
    },

    clearResult() {
      this.type = ''
      this.typeName = ''
      this.description = ''
      this.bars = []
      this.scores = {}
      this.careers = []
      this.majors = []
      localStorage.removeItem(RESULT_KEY)
    },

    async fetchRecommendations() {
      this.loading = true
      let loadedRemote = false
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.from('mbti_recommendations').select('*')
          if (error) throw error
          if (data?.length) {
            this.recommendations = data.map((row) => ({
              type: row.mbti_type,
              typeName: row.type_name,
              description: row.description,
              careers: row.careers,
              majors: row.majors,
            }))
            loadedRemote = true
          }
        }
      } catch (err) {
        console.warn('使用本地推荐数据（远程拉取失败）', err)
      } finally {
        if (!loadedRemote) {
          try {
            const adminCache = JSON.parse(localStorage.getItem('turecareer_admin_data') || 'null')
            if (adminCache?.recommendations?.length) {
              this.recommendations = adminCache.recommendations
            }
          } catch {
            /* ignore */
          }
        }
        this.loading = false
      }
    },

    computeFromAnswers(answers) {
      const { type, scores, bars } = calculateMbti(answers)
      const profile = this.recommendationMap[type] || mbtiTypeMap[type]

      this.type = type
      this.typeName = profile?.typeName || '探索者型'
      this.description = profile?.description || '你正在探索属于自己的星图。'
      this.scores = scores
      this.bars = bars
      this.careers = [...(profile?.careers || [])].sort((a, b) => (b.match || 0) - (a.match || 0))
      this.majors = [...(profile?.majors || [])].sort((a, b) => (b.match || 0) - (a.match || 0))
      this.persist()
      return this.type
    },

    setRecommendations(list) {
      this.recommendations = list
    },
  },
})
