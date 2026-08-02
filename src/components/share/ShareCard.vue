<script setup>
defineProps({
  type: String,
  typeName: String,
  description: String,
  careers: { type: Array, default: () => [] },
  majors: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="share-card">
    <div class="share-card__brand">未来探索者 · TureCareer</div>
    <div class="share-card__type">{{ type }}</div>
    <div class="share-card__name">{{ typeName }}</div>
    <p class="share-card__desc">{{ description }}</p>

    <section>
      <h3>Top 职业推荐</h3>
      <ul>
        <li v-for="(c, i) in careers.slice(0, 3)" :key="`c-${i}`">
          <strong>{{ i + 1 }}. {{ c.name }}</strong>
          <span>{{ c.salary }}</span>
        </li>
      </ul>
    </section>

    <section>
      <h3>Top 专业推荐</h3>
      <ul>
        <li v-for="(m, i) in majors.slice(0, 3)" :key="`m-${i}`">
          <strong>{{ i + 1 }}. {{ m.name }}</strong>
          <span>{{ m.level }} · {{ m.employmentRate }}</span>
        </li>
      </ul>
    </section>

    <footer>扫码/打开链接开启你的职业冒险 ✨</footer>
  </div>
</template>

<style scoped>
.share-card {
  width: 360px;
  padding: 28px 24px;
  color: #fff;
  background: linear-gradient(160deg, #2e1065, #1e3a8a 55%, #831843);
  font-family: 'Nunito', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.share-card__brand {
  font-weight: 800;
  opacity: 0.9;
  margin-bottom: 18px;
}

.share-card__type {
  font-size: 56px;
  font-weight: 900;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, #fbbf24, #f472b6, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
}

.share-card__name {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 800;
}

.share-card__desc {
  margin: 14px 0 22px;
  font-size: 14px;
  line-height: 1.55;
  opacity: 0.9;
}

section + section {
  margin-top: 16px;
}

h3 {
  font-size: 15px;
  margin-bottom: 8px;
  color: #fde68a;
}

ul {
  list-style: none;
  display: grid;
  gap: 8px;
}

li {
  display: grid;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
}

li span {
  font-size: 12px;
  opacity: 0.85;
}

footer {
  margin-top: 22px;
  font-size: 12px;
  opacity: 0.8;
  text-align: center;
}
</style>
