/** 专业层次展示文案（不依赖院校全量库） */
export function formatMajorLevel(majorLevel) {
  if (!majorLevel) return '层次待核验'
  if (majorLevel.includes('专科')) return '专科专业'
  if (majorLevel.includes('本科')) return '本科专业'
  return majorLevel
}
