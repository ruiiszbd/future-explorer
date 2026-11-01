-- 已有 Supabase 项目执行一次。
-- 放宽 questions.dimension，允许六种职业兴趣和工作条件代码。
-- mbti_type 列名保持不变，同步后里面改为 R/I/A/S/E/C。

ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_dimension_check;

ALTER TABLE questions
  ADD CONSTRAINT questions_dimension_check
  CHECK (dimension IN ('R', 'I', 'A', 'S', 'E', 'C', 'ST', 'IN', 'HD', 'HP', 'AU', 'MS', 'EI', 'SN', 'TF', 'JP'));
