# 上线与公开访问检查清单

## Netlify 公开访问（顾客能打开）

1. 打开 Netlify 项目 → **Project configuration / Site configuration**
2. 找到 **Visitor access / Password protection / Access control**
3. 关闭密码保护，设为 **Public / No password**
4. 用手机流量或无痕窗口打开生产域名，确认：
   - 能看到首页「未来探索者」
   - **不会**出现「没有权限 / 401」

## 环境变量（Netlify → Environment variables）

必须配置：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_PASSWORD`（请使用强密码，不要用弱默认值）

修改环境变量后需要 **重新部署** 才会生效。

## 数据同步

1. 本地或线上打开 `/admin`，用管理密码登录
2. 确认题库与推荐数据无误
3. 点击 **同步到 Supabase**
4. 在 Supabase Table Editor 核对 `questions`、`mbti_recommendations`

## 功能冒烟

- [ ] 完成 16 题并出结果
- [ ] 推荐页可选择省份，本省院校有「本省优先」标记
- [ ] 院校显示办学层次标签
- [ ] 可见免责声明
- [ ] 反馈按钮可点击并保留状态
- [ ] 分享长图可生成
