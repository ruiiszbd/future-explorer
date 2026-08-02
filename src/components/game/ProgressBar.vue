<script setup>
defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
  label: { type: String, default: '探索进度' },
})
</script>

<template>
  <div class="xp-bar">
    <div class="xp-bar__meta">
      <span>{{ label }}</span>
      <span>关卡 {{ current }} / {{ total }}</span>
    </div>
    <div class="xp-bar__track">
      <div
        class="xp-bar__fill"
        :style="{ width: `${Math.min(100, Math.round((current / total) * 100))}%` }"
      >
        <span class="xp-bar__glow" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.xp-bar {
  width: 100%;
}

.xp-bar__meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-muted);
}

.xp-bar__track {
  height: 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  overflow: hidden;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.25);
}

.xp-bar__fill {
  position: relative;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #fb923c, #f472b6, #a855f7, #3b82f6);
  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.xp-bar__glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.45), transparent 55%);
}
</style>
