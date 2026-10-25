import { defineStore } from 'pinia'

const PREF_KEY = 'turecareer_prefs'
const FEEDBACK_KEY = 'turecareer_feedback'

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || '{}')
  } catch {
    return {}
  }
}

export const usePrefsStore = defineStore('prefs', {
  state: () => {
    const prefs = loadPrefs()
    return {
      province: prefs.province || '',
      feedbackByType: JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '{}'),
    }
  },

  actions: {
    setProvince(province) {
      this.province = province || ''
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({
          province: this.province,
        }),
      )
    },

    setFeedback(mbtiType, value) {
      if (!mbtiType || !value) return
      this.feedbackByType = {
        ...this.feedbackByType,
        [mbtiType]: {
          value,
          at: new Date().toISOString(),
        },
      }
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(this.feedbackByType))
    },

    getFeedback(mbtiType) {
      return this.feedbackByType?.[mbtiType]?.value || ''
    },
  },
})
