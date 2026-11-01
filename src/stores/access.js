import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '../config/storage'
import { redeemAccessCode, resumeAccessCode } from '../services/accessCodes'

const TOKEN_KEY = STORAGE_KEYS.accessToken
let pendingRestore = null

export const useAccessStore = defineStore('access', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    unlocked: false,
    restored: false,
    restoring: false,
  }),

  actions: {
    async ensureRestored() {
      if (this.restored) return
      if (pendingRestore) return pendingRestore
      pendingRestore = this.restore().finally(() => {
        pendingRestore = null
      })
      return pendingRestore
    },

    async restore() {
      this.restoring = true
      let status = 'invalid'
      try {
        if (!this.token) {
          this.unlocked = false
          status = 'invalid'
          return
        }
        status = await resumeAccessCode(this.token)
        if (status === 'ok') {
          this.unlocked = true
          return
        }
        if (status === 'invalid') {
          this.token = ''
          this.unlocked = false
          localStorage.removeItem(TOKEN_KEY)
        }
      } finally {
        this.restoring = false
        if (status !== 'offline') this.restored = true
      }
    },

    async redeem(raw) {
      const result = await redeemAccessCode(raw)
      if (!result.ok) return result
      this.token = result.token
      this.unlocked = true
      this.restored = true
      localStorage.setItem(TOKEN_KEY, result.token)
      return result
    },
  },
})
