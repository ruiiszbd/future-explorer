-- 未来探索者 / TureCareer Explorer
-- 在 Supabase SQL Editor 中执行本脚本

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  dimension VARCHAR(2) NOT NULL CHECK (dimension IN ('EI', 'SN', 'TF', 'JP')),
  options JSONB NOT NULL,
  order_index INT NOT NULL
);

CREATE TABLE IF NOT EXISTS mbti_recommendations (
  id SERIAL PRIMARY KEY,
  mbti_type VARCHAR(4) UNIQUE NOT NULL,
  type_name VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  careers JSONB NOT NULL,
  majors JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_config (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL
);

-- 匿名可读（前台无需登录）
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read questions"
  ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read recommendations"
  ON mbti_recommendations FOR SELECT
  TO anon, authenticated
  USING (true);

-- 写入建议通过 service role 或受限后台；以下策略便于演示环境用 anon key 管理
-- 生产环境请收紧为仅 service role / 已认证管理员
CREATE POLICY "Anon upsert questions"
  ON questions FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon upsert recommendations"
  ON mbti_recommendations FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

INSERT INTO admin_config (key, value)
VALUES ('admin_note', 'Use VITE_ADMIN_PASSWORD on frontend; rotate in production')
ON CONFLICT (key) DO NOTHING;

-- 题库与推荐数据可通过管理后台「同步到 Supabase」写入，
-- 或将 src/data 中的 JSON 结构导入。
