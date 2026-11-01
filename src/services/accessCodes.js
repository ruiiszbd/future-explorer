import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { normalizeAccessCode } from '../utils/accessCode'

function mapRpcError(error) {
  const message = String(error?.message || '')
  if (error?.code === 'PGRST202' || message.includes('redeem_access_code') || message.includes('admin_')) {
    return '兑换码服务还没就绪。请在 Supabase 执行 supabase/access-codes.sql，并把 code_admin_secret 设成管理密码。'
  }
  return '暂时无法连接兑换服务，请稍后再试'
}

function mapResultError(error) {
  if (error === 'used') return '这个兑换码已经使用'
  if (error === 'forbidden') return '管理密码和 Supabase 里的 code_admin_secret 不一致'
  if (error === 'secret_missing') return '请先在 Supabase 把 code_admin_secret 改成至少 8 位的管理密码'
  if (error === 'count') return '一次最多生成 100 个兑换码'
  return '这个兑换码不存在'
}

export async function redeemAccessCode(raw) {
  const code = normalizeAccessCode(raw)
  if (code.length !== 8) return { ok: false, error: '请输入 8 位兑换码' }
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: '兑换服务还没连接，暂时不能核销' }
  }
  const { data, error } = await supabase.rpc('redeem_access_code', { p_code: code })
  if (error) return { ok: false, error: mapRpcError(error) }
  if (!data?.ok) return { ok: false, error: mapResultError(data?.error) }
  return { ok: true, token: data.token }
}

export async function resumeAccessCode(token) {
  if (!token || !isSupabaseConfigured || !supabase) return 'invalid'
  const { data, error } = await supabase.rpc('resume_access_code', { p_token: token })
  if (error) return 'offline'
  return data?.ok ? 'ok' : 'invalid'
}

export async function createAccessCodes(password, count) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: '还没有连接 Supabase，生成的码无法在买家手机上核销' }
  }
  const { data, error } = await supabase.rpc('admin_create_access_codes', {
    p_password: password,
    p_count: count,
  })
  if (error) return { ok: false, error: mapRpcError(error) }
  if (!data?.ok) return { ok: false, error: mapResultError(data?.error) }
  return { ok: true, codes: data.codes || [] }
}

export async function listAccessCodes(password) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: '还没有连接 Supabase' }
  }
  const { data, error } = await supabase.rpc('admin_list_access_codes', { p_password: password })
  if (error) return { ok: false, error: mapRpcError(error) }
  if (!data?.ok) return { ok: false, error: mapResultError(data?.error) }
  return { ok: true, codes: data.codes || [] }
}
