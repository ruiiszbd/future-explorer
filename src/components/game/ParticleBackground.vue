<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
let raf = 0
let particles = []

function resize(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function createParticles() {
  const count = Math.min(60, Math.floor(window.innerWidth / 18))
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.2 + 0.6,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    a: Math.random() * 0.5 + 0.2,
  }))
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = window.innerWidth
  const h = window.innerHeight

  const gradient = ctx.createLinearGradient(0, 0, w, h)
  gradient.addColorStop(0, '#12082b')
  gradient.addColorStop(0.45, '#1c0f45')
  gradient.addColorStop(1, '#0f172a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  // soft nebula blobs
  ;[
    ['rgba(168,85,247,0.22)', w * 0.2, h * 0.25, 180],
    ['rgba(59,130,246,0.18)', w * 0.75, h * 0.3, 200],
    ['rgba(244,114,182,0.14)', w * 0.5, h * 0.8, 220],
  ].forEach(([color, x, y, r]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, color)
    g.addColorStop(1, 'transparent')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  })

  particles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy
    if (p.x < 0) p.x = w
    if (p.x > w) p.x = 0
    if (p.y < 0) p.y = h
    if (p.y > h) p.y = 0
    ctx.beginPath()
    ctx.fillStyle = `rgba(255,255,255,${p.a})`
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  })

  raf = requestAnimationFrame(draw)
}

function onResize() {
  if (!canvasRef.value) return
  resize(canvasRef.value)
  createParticles()
}

onMounted(() => {
  resize(canvasRef.value)
  createParticles()
  draw()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-bg" aria-hidden="true" />
</template>

<style scoped>
.particle-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
