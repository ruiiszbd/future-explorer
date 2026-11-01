/** 霍兰德六型与职业锚里高职学生最常碰到的六条工作条件。 */

export const HOLLAND_TYPES = [
  {
    code: 'R',
    name: '现实型',
    activity: '修理和动手',
    blurb: '你更愿意做修理、装配和现场操作。常见的工作日是在车间或设备旁边处理具体问题。',
  },
  {
    code: 'I',
    name: '研究型',
    activity: '查清原因',
    blurb: '你更愿意把原理搞清楚，并排查技术或数据问题。常见的工作日是对着系统、资料或实验反复核对。',
  },
  {
    code: 'A',
    name: '艺术型',
    activity: '做成作品',
    blurb: '你更愿意把想法做成看得见的作品。常见的工作日是设计、拍摄、写作或按审美布置。',
  },
  {
    code: 'S',
    name: '社会型',
    activity: '照顾人和讲解',
    blurb: '你更愿意照顾人、把事情讲明白，或在别人遇到困难时提供支持。常见的工作日要直接和人打交道。',
  },
  {
    code: 'E',
    name: '企业型',
    activity: '说服和组织',
    blurb: '你更愿意说服别人、组织活动或盯住经营目标。常见的工作日节奏快，结果要看得到。',
  },
  {
    code: 'C',
    name: '常规型',
    activity: '核对和整理',
    blurb: '你更愿意按表格和制度把事务核对清楚。常见的工作日是记录、整理和减少差错。',
  },
]

export const WORK_VALUES = [
  { code: 'ST', name: '稳定' },
  { code: 'IN', name: '收入' },
  { code: 'HD', name: '动手' },
  { code: 'HP', name: '助人' },
  { code: 'AU', name: '自主' },
  { code: 'MS', name: '做专' },
]

export const HOLLAND_CODES = HOLLAND_TYPES.map((item) => item.code)
export const VALUE_CODES = WORK_VALUES.map((item) => item.code)

export const STYLE_PAIRS = [
  { code: 'EI', letters: ['E', 'I'] },
  { code: 'SN', letters: ['S', 'N'] },
  { code: 'TF', letters: ['T', 'F'] },
  { code: 'JP', letters: ['J', 'P'] },
]

export const STYLE_LETTER_NAMES = {
  E: '一起做事',
  I: '独自深入',
  S: '按步骤',
  N: '看整体',
  T: '对事说清楚',
  F: '先顾及感受',
  J: '先定计划',
  P: '边做边调整',
}

export const INTEREST_CHOICES = [
  { key: 'A', text: '愿意经常做', score: 2 },
  { key: 'B', text: '都可以', score: 1 },
  { key: 'C', text: '不太想做', score: 0 },
]

export const VALUE_CHOICES = [
  { key: 'A', text: '很在意', score: 2 },
  { key: 'B', text: '有一点在意', score: 1 },
  { key: 'C', text: '不太在意', score: 0 },
]

export const DIMENSION_OPTIONS = [
  ...HOLLAND_TYPES.map((item) => ({ code: item.code, label: `${item.name} ${item.code}` })),
  ...WORK_VALUES.map((item) => ({ code: item.code, label: `${item.name} ${item.code}` })),
  { code: 'EI', label: '做事方式 一起做事/独自深入' },
  { code: 'SN', label: '做事方式 按步骤/看整体' },
  { code: 'TF', label: '做事方式 对事说清楚/先顾及感受' },
  { code: 'JP', label: '做事方式 先定计划/边做边调整' },
]

const styleByCode = Object.fromEntries(STYLE_PAIRS.map((item) => [item.code, item]))

const hollandByCode = Object.fromEntries(HOLLAND_TYPES.map((item) => [item.code, item]))

export function hollandActivity(code) {
  return hollandByCode[code]?.activity || ''
}

/** 结果页用日常说法，不把 R、I、A、S、E、C 直接放在标题上。 */
export function interestHeadline(type, { tied = false, lowInterest = false } = {}) {
  const activities = String(type || '')
    .split('+')
    .map((part) => hollandActivity(part.trim()))
    .filter(Boolean)
  if (!activities.length) return { label: '你更愿意做的事', title: '', note: '' }
  if (lowInterest) {
    return {
      label: '可以先了解的活动',
      title: activities[0],
      note: activities[1] ? `另一类也可以看看：${activities[1]}` : '',
    }
  }
  if (activities.length === 1) return { label: '你更愿意做的事', title: activities[0], note: '' }
  if (tied) {
    return {
      label: '你更愿意做的事',
      title: `${activities[0]}，${activities[1]}`,
      note: '这两类都比较明显',
    }
  }
  return {
    label: '你更愿意做的事',
    title: activities[0],
    note: `其次也愿意：${activities[1]}`,
  }
}
const valueByCode = Object.fromEntries(WORK_VALUES.map((item) => [item.code, item]))

export function isValueCode(code) {
  return Boolean(valueByCode[code])
}

export function isHollandCode(code) {
  return Boolean(hollandByCode[code])
}

export function isStyleCode(code) {
  return Boolean(styleByCode[code])
}

export function dimensionLabel(code) {
  return hollandByCode[code]?.name || valueByCode[code]?.name || (isStyleCode(code) ? '做事方式' : code)
}

export function sectionOf(code) {
  if (isValueCode(code)) return 'value'
  if (isStyleCode(code)) return 'style'
  return 'interest'
}

export function promptFor(code) {
  if (isValueCode(code)) return '只看这件事本身，你有多在意？'
  if (isStyleCode(code)) return '换成你，你更可能怎么做？'
  return '你愿意经常过这样的一段工作或上课时间吗？'
}

export function choicesFor(code) {
  if (isStyleCode(code)) {
    const [a, b] = styleByCode[code].letters
    return [
      { key: 'A', text: '', trait: a, score: 2 },
      { key: 'B', text: '', trait: b, score: 2 },
      { key: 'C', text: '两种都可能', trait: '', score: 0 },
    ]
  }
  return (isValueCode(code) ? VALUE_CHOICES : INTEREST_CHOICES).map((option) => ({
    ...option,
    trait: code,
  }))
}

export function unpackQuestion(question) {
  const raw = question?.options
  if (raw && !Array.isArray(raw) && Array.isArray(raw.items)) {
    return { ...question, image: raw.image || question.image || '', options: raw.items }
  }
  return { ...question, image: question.image || '', options: Array.isArray(raw) ? raw : [] }
}

export function packOptions(question) {
  const items = question.options || []
  if (!question.image) return items
  return { image: question.image, items }
}

export function normalizeQuestionList(list) {
  return (list || []).map(unpackQuestion)
}

function optionsLookScored(question) {
  const options = unpackQuestion(question).options
  return options.length > 0 && options.every((option) => typeof option.score === 'number')
}

export function isLegacyQuestionList(list) {
  if (!Array.isArray(list) || !list.length) return true
  return list.some((question) => !optionsLookScored(question))
}

/** 用来识别这一版更具体的情境。旧题库即使题量够，也改用内置新题。 */
const CURRENT_BANK_HINT = '质检室'

/** 当前题库每型 6 道兴趣题，并含做事方式。更短或更早的题库改用内置新题。 */
export function isCurrentQuestionList(list) {
  if (!Array.isArray(list) || isLegacyQuestionList(list)) return false
  const counts = {}
  let hasRevision = false
  for (const question of list) {
    const unpacked = unpackQuestion(question)
    counts[unpacked.dimension] = (counts[unpacked.dimension] || 0) + 1
    if (String(unpacked.question_text || '').includes(CURRENT_BANK_HINT)) hasRevision = true
  }
  const interestReady = HOLLAND_CODES.every((code) => (counts[code] || 0) >= 6)
  const styleReady = STYLE_PAIRS.every((pair) => (counts[pair.code] || 0) >= 2)
  return interestReady && styleReady && hasRevision
}

/** 远程或导入数据必须六型齐全，缺一型就不用，避免和本地档案混用。 */
export function filterHollandProfiles(list) {
  if (!Array.isArray(list)) return []
  const usable = list.filter((item) => HOLLAND_CODES.includes(item?.type))
  const codes = new Set(usable.map((item) => item.type))
  if (HOLLAND_CODES.some((code) => !codes.has(code))) return []
  return HOLLAND_CODES.map((code) => usable.find((item) => item.type === code))
}
