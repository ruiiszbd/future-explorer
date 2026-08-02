<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  disabled: Boolean,
  block: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})

defineEmits(['click'])
</script>

<template>
  <button
    class="game-btn"
    :class="[`is-${variant}`, `is-${size}`, { 'is-block': block }]"
    :disabled="disabled"
    type="button"
    @click="$emit('click', $event)"
  >
    <span class="game-btn__shine" />
    <span class="game-btn__label"><slot /></span>
  </button>
</template>

<style scoped>
.game-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 16px;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  overflow: hidden;
  transform: translateY(0);
  transition: transform 0.12s ease, filter 0.12s ease, opacity 0.2s ease;
  box-shadow:
    0 8px 0 rgba(0, 0, 0, 0.25),
    0 12px 28px rgba(99, 102, 241, 0.35);
}

.game-btn.is-md {
  min-height: 52px;
  padding: 0 28px;
  font-size: 1.05rem;
}

.game-btn.is-lg {
  min-height: 60px;
  padding: 0 34px;
  font-size: 1.2rem;
}

.game-btn.is-sm {
  min-height: 40px;
  padding: 0 16px;
  font-size: 0.9rem;
  border-radius: 12px;
}

.game-btn.is-block {
  width: 100%;
}

.game-btn.is-primary {
  background: linear-gradient(135deg, #a855f7, #3b82f6 55%, #22d3ee);
}

.game-btn.is-secondary {
  background: linear-gradient(135deg, #fb923c, #f472b6);
}

.game-btn.is-ghost {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.18);
}

.game-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-2px);
}

.game-btn:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow:
    0 2px 0 rgba(0, 0, 0, 0.25),
    0 6px 16px rgba(99, 102, 241, 0.3);
}

.game-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.game-btn__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.28), transparent 70%);
  transform: translateX(-120%);
  animation: shine 3.2s ease-in-out infinite;
}

.game-btn__label {
  position: relative;
  z-index: 1;
}

@keyframes shine {
  0%,
  60% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(120%);
  }
}
</style>
