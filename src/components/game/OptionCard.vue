<script setup>
defineProps({
  optionKey: { type: String, required: true },
  text: { type: String, required: true },
  selected: Boolean,
  disabled: Boolean,
})

defineEmits(['select'])
</script>

<template>
  <button
    class="option-card"
    :class="{ 'is-selected': selected }"
    type="button"
    :disabled="disabled"
    @click="$emit('select')"
  >
    <span class="option-card__key">{{ optionKey }}</span>
    <span class="option-card__text">{{ text }}</span>
    <span class="option-card__burst" aria-hidden="true" />
  </button>
</template>

<style scoped>
.option-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
  color: #fff;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
}

.option-card:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.01);
  border-color: rgba(167, 139, 250, 0.7);
  box-shadow: 0 12px 28px rgba(124, 58, 237, 0.35);
}

.option-card:active:not(:disabled) {
  transform: scale(0.98);
}

.option-card.is-selected {
  border-color: rgba(34, 211, 238, 0.85);
  background: linear-gradient(145deg, rgba(168, 85, 247, 0.35), rgba(59, 130, 246, 0.28));
  animation: pop 0.35s ease;
}

.option-card__key {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 900;
  background: linear-gradient(135deg, #fb923c, #f472b6);
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2);
}

.option-card__text {
  font-weight: 700;
  line-height: 1.4;
  font-size: 0.98rem;
}

.option-card.is-selected .option-card__burst {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.25), transparent 45%);
  animation: flash 0.4s ease;
}

@keyframes pop {
  0% {
    transform: scale(0.96);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes flash {
  from {
    opacity: 0.9;
  }
  to {
    opacity: 0;
  }
}
</style>
