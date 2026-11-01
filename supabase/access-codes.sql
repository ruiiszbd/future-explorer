-- 已有 Supabase 项目执行一次。
-- 兑换码只通过下面的函数读写，匿名用户不能列出未使用的码。
-- 先把 code_admin_secret 改成和管理后台相同的密码，至少 8 位。

CREATE TABLE IF NOT EXISTS access_codes (
  code TEXT PRIMARY KEY,
  token UUID UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMPTZ
);

ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

INSERT INTO admin_config (key, value)
VALUES ('code_admin_secret', 'change-me')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION redeem_access_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized TEXT;
  new_token UUID;
BEGIN
  normalized := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  IF length(normalized) <> 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'missing');
  END IF;

  UPDATE access_codes
  SET redeemed_at = now(), token = gen_random_uuid()
  WHERE code = normalized AND redeemed_at IS NULL
  RETURNING token INTO new_token;

  IF new_token IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'token', new_token);
  END IF;

  IF EXISTS (SELECT 1 FROM access_codes WHERE code = normalized) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'used');
  END IF;
  RETURN jsonb_build_object('ok', false, 'error', 'missing');
END;
$$;

CREATE OR REPLACE FUNCTION resume_access_code(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_uuid UUID;
BEGIN
  BEGIN
    token_uuid := p_token::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN jsonb_build_object('ok', false);
  END;

  IF EXISTS (
    SELECT 1 FROM access_codes
    WHERE token = token_uuid AND redeemed_at IS NOT NULL
  ) THEN
    RETURN jsonb_build_object('ok', true);
  END IF;
  RETURN jsonb_build_object('ok', false);
END;
$$;

CREATE OR REPLACE FUNCTION admin_create_access_codes(p_password TEXT, p_count INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INT;
  j INT;
  raw TEXT;
  created TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF p_count IS NULL OR p_count < 1 OR p_count > 100 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'count');
  END IF;

  SELECT value INTO secret FROM admin_config WHERE key = 'code_admin_secret';
  IF secret IS NULL OR length(secret) < 8 OR secret = 'change-me' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'secret_missing');
  END IF;
  IF p_password IS DISTINCT FROM secret THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  FOR i IN 1..p_count LOOP
    LOOP
      raw := '';
      FOR j IN 1..8 LOOP
        raw := raw || substr(chars, 1 + floor(random() * length(chars))::int, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM access_codes WHERE code = raw);
    END LOOP;
    INSERT INTO access_codes (code) VALUES (raw);
    created := array_append(created, raw);
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'codes', to_jsonb(created));
END;
$$;

CREATE OR REPLACE FUNCTION admin_list_access_codes(p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret TEXT;
BEGIN
  SELECT value INTO secret FROM admin_config WHERE key = 'code_admin_secret';
  IF secret IS NULL OR length(secret) < 8 OR secret = 'change-me' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'secret_missing');
  END IF;
  IF p_password IS DISTINCT FROM secret THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'codes', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'code', code,
          'createdAt', created_at,
          'redeemedAt', redeemed_at
        )
        ORDER BY created_at DESC
      )
      FROM (
        SELECT code, created_at, redeemed_at
        FROM access_codes
        ORDER BY created_at DESC
        LIMIT 200
      ) recent
    ), '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION redeem_access_code(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION resume_access_code(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_create_access_codes(TEXT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_list_access_codes(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION redeem_access_code(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION resume_access_code(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_create_access_codes(TEXT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_list_access_codes(TEXT) TO anon, authenticated;
