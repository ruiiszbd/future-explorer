# 未来探索者 · TureCareer Explorer

面向高三、中职毕业生与高职/职业本科意向学生的游戏化性格—专业匹配网页应用。

- 前端：Vue 3 + Vite + Pinia + Vue Router + GSAP
- 院校数据：教育部《全国普通高等学校名单》（截至 2026-06-17，2952 所）
- 云端：可选 Supabase（题库与推荐同步）
- 部署：Netlify（亦可 Vercel）
- 分享：html2canvas 长图

## 功能概览

1. 首页 → 16 题测试 → 加载 → 结果 → 职业/专业推荐
2. 推荐页可按**省份**优先展示本省院校，并标注**专科 / 本科（含职业本科）**
3. 推荐校名已对齐官方名单；结果页/推荐页含免责声明
4. 测完可做「有用/一般/没用」反馈（先存 localStorage）
5. 管理后台：题库、推荐、JSON 备份、同步 Supabase

## 快速开始

```bash
npm install
npm run dev
```

未配置 Supabase 时，使用 `src/data/` 内置题库、推荐与院校名单。

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_PASSWORD=请改成强密码
```

**安全提示**：上线后务必在 Netlify 环境变量中设置强 `VITE_ADMIN_PASSWORD`，不要使用弱默认密码。

## 院校数据

- 源文件：`院校名单.xls`（全国普通高等学校名单）
- 生成模块：`src/data/schools.js`
- 重新生成：

```bash
python scripts/generate-schools.js.py
```

（需先有 `_schools_raw.json`；可用解析脚本从 xls 导出。）

## Supabase

1. 执行 `supabase/schema.sql`
2. 配置环境变量
3. 打开 `/admin` →「同步到 Supabase」

## 部署（Netlify）

1. 连接 GitHub 仓库并部署（`netlify.toml` 已配置 `npm run build` → `dist`）
2. 配置上述环境变量
3. **关闭访客密码保护**，确保公网可打开  
   详见：`docs/deploy-checklist.md`

当前生产示例域名以你的 Netlify 项目为准（如 `*.netlify.app`）。

## 文档

- `docs/deploy-checklist.md` — 上线与公开访问检查
- `docs/school-partnership.md` — 高职/职业大学招生合作一页纸

## 产品边界

- 趣味性格倾向参考，**非心理诊断**
- 院校信息以公开名单为准，报考以招生章程为准
- 薪资/就业率为公开区间参考，非承诺

## 脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览构建产物 |
