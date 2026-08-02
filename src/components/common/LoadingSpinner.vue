<script setup>
defineProps({
  text: { type: String, default: '加载中...' },
})
</script>

<template>
  <div class="spinner-wrap">
    <div class="spinner" aria-hidden="true" />
    <p>{{ text }}</p>
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: grid;
  place-items: center;
  gap: 12px;
  color: var(--text-muted);
}

.spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #a855f7;
  border-right-color: #22d3ee;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
