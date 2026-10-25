import { findSchoolByName, resolveSchoolName, schoolProvinces } from '../data/schools'

export { schoolProvinces }

/**
 * 将推荐校名解析为官方信息，并按所选省份优先排序
 * @param {string[]} schoolNames
 * @param {string} [province]
 */
export function enrichRecommendedSchools(schoolNames = [], province = '') {
  const enriched = schoolNames
    .map((name) => {
      const officialName = resolveSchoolName(name)
      const meta = findSchoolByName(officialName)
      return {
        name: officialName,
        level: meta?.level || '未知',
        levelLabel: meta?.level === '本科' ? '本科（含职业本科）' : meta?.level === '专科' ? '专科' : '待核验',
        province: meta?.province || '',
        city: meta?.city || '',
        inProvince: Boolean(province && meta?.province === province),
        verified: Boolean(meta),
      }
    })
    .filter((s) => s.name)

  if (!province) return enriched
  return [...enriched].sort((a, b) => Number(b.inProvince) - Number(a.inProvince))
}

/**
 * 专业层次展示：保留原专业层次，并补充院校层次说明
 */
export function formatMajorLevel(majorLevel) {
  if (!majorLevel) return '层次待核验'
  if (majorLevel.includes('专科')) return '专科专业'
  if (majorLevel.includes('本科')) return '本科专业'
  return majorLevel
}
