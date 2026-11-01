import { defineStore } from 'pinia'
import { buildCatalogView } from '../data/catalogView'
import { defaultProfiles } from '../data/profiles'
import { filterHollandProfiles } from '../data/scale'
import { calculateExplore } from '../utils/exploreCalculator'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { STORAGE_KEYS } from '../config/storage'

const RESULT_KEY = STORAGE_KEYS.result

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(RESULT_KEY) || 'null')
  } catch {
    return null
  }
}

function mapRecommendation(row) {
  return {
    type: row.mbti_type || row.type,
    typeName: row.type_name || row.typeName,
    description: row.description,
    careers: row.careers,
    majors: row.majors,
  }
}

export const useResultStore = defineStore('result', {
  state: () => {
    const saved = readSaved()
    return {
      recommendations: defaultProfiles.map(cloneProfile),
      type: saved?.type || '',
      typeName: saved?.typeName || '',
      description: saved?.description || '',
      bars: saved?.bars || [],
      scores: saved?.scores || {},
      careers: saved?.careers || [],
      majors: saved?.majors || [],
      majorCategories: saved?.majorCategories || [],
      occupationMids: saved?.occupationMids || [],
      topValues: saved?.topValues || [],
      valueNote: saved?.valueNote || '',
      styleNote: saved?.styleNote || '',
      lowInterest: Boolean(saved?.lowInterest),
      tied: Boolean(saved?.tied),
      loading: false,
    }
  },

  getters: {
    hasResult: (state) => Boolean(state.type),
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
          majorCategories: this.majorCategories,
          occupationMids: this.occupationMids,
          topValues: this.topValues,
          valueNote: this.valueNote,
          styleNote: this.styleNote,
          lowInterest: this.lowInterest,
          tied: this.tied,
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
      this.majorCategories = []
      this.occupationMids = []
      this.topValues = []
      this.valueNote = ''
      this.styleNote = ''
      this.lowInterest = false
      this.tied = false
      localStorage.removeItem(RESULT_KEY)
    },

    async fetchRecommendations() {
      this.loading = true
      let loadedRemote = false
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.from('mbti_recommendations').select('*')
          if (error) throw error
          const usable = filterHollandProfiles((data || []).map(mapRecommendation))
          if (usable.length) {
            this.recommendations = usable.map(cloneProfile)
            loadedRemote = true
          }
        }
      } catch (err) {
        console.warn('使用本地推荐数据（远程拉取失败或仍是旧性格类型）', err)
      } finally {
        if (!loadedRemote) {
          try {
            const adminCache = JSON.parse(localStorage.getItem(STORAGE_KEYS.adminData) || 'null')
            const usable = filterHollandProfiles(adminCache?.recommendations)
            if (usable.length) this.recommendations = usable.map(cloneProfile)
          } catch {
            /* ignore */
          }
        }
        this.loading = false
      }
    },

    computeFromAnswers(answers) {
      const result = calculateExplore(answers, this.recommendations)
      const catalog = buildCatalogView(result)
      this.type = result.type
      this.typeName = result.typeName
      this.description = result.description
      this.scores = result.scores
      this.bars = result.bars
      this.careers = catalog.careers
      this.majors = catalog.majors
      this.majorCategories = catalog.majorCategories
      this.occupationMids = catalog.occupationMids
      this.topValues = result.topValues
      this.valueNote = result.valueNote
      this.styleNote = result.styleNote
      this.lowInterest = result.lowInterest
      this.tied = result.tied
      this.persist()
      return this.type
    },

    setRecommendations(list) {
      const usable = filterHollandProfiles(list)
      if (usable.length) this.recommendations = usable.map(cloneProfile)
    },
  },
})

function cloneProfile(item) {
  return {
    ...item,
    careers: (item.careers || []).map((career) => ({ ...career })),
    majors: (item.majors || []).map((major) => ({ ...major })),
  }
}
