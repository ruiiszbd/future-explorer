# 未来探索者 · TureCareer Explorer

面向高三毕业生与专科院校学生的游戏化 MBTI 职业/专业推荐网页应用。

- 前端：Vue 3 + Vite + Pinia + Vue Router + GSAP
- 数据：本地默认题库/推荐数据，可选接入 Supabase
- 部署：Vercel
- 分享：html2canvas 生成结果长图

## 功能概览

1. 首页 → 16 题测试 → 加载动画 → 结果页 → 职业/专业推荐
2. 本地进度与结果缓存（localStorage），刷新可继续
3. 分享长图（Top3 职业 + Top3 专业）
4. 管理后台（首页底部小字入口）：题库、推荐数据、JSON 导入导出、同步 Supabase

默认管理密码：`123456`（可用环境变量 `VITE_ADMIN_PASSWORD` 覆盖）

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址即可。

未配置 Supabase 时，应用会自动使用 `src/data/questions.js` 与 `src/data/mbtiData.js` 中的内置数据。

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_PASSWORD=123456
```

## Supabase 初始化

1. 创建 Supabase 项目
2. 在 SQL Editor 执行 `supabase/schema.sql`
3. 配置前端环境变量
4. 登录管理后台，点击「同步到 Supabase」写入题库与推荐数据

> 说明：`schema.sql` 中为演示方便开放了 anon 写策略。生产环境请改为 service role / 认证管理员策略。

## Vercel 部署

1. 将仓库推送到 GitHub
2. 在 [Vercel](https://vercel.com) Import 该仓库
3. Framework Preset 选择 Vite
4. 配置环境变量（同上）
5. Deploy

`vercel.json` 已配置 SPA history fallback。

## 计分规则

- 16 题，四个维度（E/I、S/N、T/F、J/P）各 4 题
- 每题选项对应某一侧字母，计 1 分
- 某侧得分 ≥ 2 则该维度取该字母
- 百分比：该侧得分 / 4 × 100%

## 数据说明

职业与专业推荐尽量对齐：

- 教育部《职业教育专业目录》常见专科专业名称
- 公开高职“双高/示范”院校代表（作方向参考）
- 麦可思等公开就业报告中专科就业率/起薪的常见区间

薪资与就业率会随地区、年份波动，页面展示为参考区间，不构成承诺。

## 目录结构

```text
future-explorer/
├── src/
│   ├── components/     # 游戏组件、按钮、分享卡
│   ├── data/           # 默认题库与 16 型推荐
│   ├── stores/         # Pinia：测试 / 结果 / 后台
│   ├── views/          # 5 个主界面 + Admin
│   ├── utils/          # 计分与分享图
│   └── lib/supabase.js
├── supabase/schema.sql
├── vercel.json
└── package.json
```

## 脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览构建产物 |

## 许可证

仅供学习与项目实践使用。
