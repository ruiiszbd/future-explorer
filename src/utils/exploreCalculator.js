import {
  HOLLAND_CODES,
  HOLLAND_TYPES,
  isHollandCode,
  isStyleCode,
  isValueCode,
  STYLE_LETTER_NAMES,
  VALUE_CODES,
  WORK_VALUES,
} from '../data/scale'

const hollandOrder = Object.fromEntries(HOLLAND_CODES.map((code, index) => [code, index]))
const valueOrder = Object.fromEntries(VALUE_CODES.map((code, index) => [code, index]))
const hollandByCode = Object.fromEntries(HOLLAND_TYPES.map((item) => [item.code, item]))
const valueByCode = Object.fromEntries(WORK_VALUES.map((item) => [item.code, item]))
const STYLE_LETTERS = Object.keys(STYLE_LETTER_NAMES)
const STYLE_PAIRS = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P'],
]

function emptyScores(codes) {
  return Object.fromEntries(codes.map((code) => [code, 0]))
}

function addScore(bucket, counts, code, score) {
  if (bucket[code] === undefined || !Number.isFinite(score)) return false
  bucket[code] += score
  counts[code] += 1
  return true
}

/**
 * @param {Array<{ trait?: string, score?: number }>} answers
 * @param {Array<{ type: string, typeName?: string, description?: string, careers?: Array, majors?: Array }>} profiles
 */
export function calculateExplore(answers, profiles = []) {
  const interestScores = emptyScores(HOLLAND_CODES)
  const interestCounts = emptyScores(HOLLAND_CODES)
  const valueScores = emptyScores(VALUE_CODES)
  const valueCounts = emptyScores(VALUE_CODES)
  const styleScores = emptyScores(STYLE_LETTERS)

  for (const answer of answers || []) {
    const score = Number(answer?.score)
    const dimension = answer?.dimension
    if (!Number.isFinite(score) || !dimension) continue
    if (isHollandCode(dimension)) addScore(interestScores, interestCounts, dimension, score)
    else if (isValueCode(dimension)) addScore(valueScores, valueCounts, dimension, score)
    else if (isStyleCode(dimension) && styleScores[answer.trait] !== undefined) {
      styleScores[answer.trait] += score
    }
  }

  const rankedInterest = HOLLAND_CODES.map((code) => ({ code, score: interestScores[code] })).sort(
    (a, b) => b.score - a.score || hollandOrder[a.code] - hollandOrder[b.code],
  )
  const primary = rankedInterest[0]
  const secondary = rankedInterest[1]
  const primaryMax = Math.max(interestCounts[primary.code] * 2, 1)
  const secondaryMax = Math.max(interestCounts[secondary.code] * 2, 1)
  const useSecondary = secondary.score >= Math.ceil(secondaryMax * 0.35)
  const tied = useSecondary && primary.score - secondary.score <= 2
  const lowInterest = primary.score * 2 <= primaryMax
  const styleLetters = clearStyleLetters(styleScores)
  const styleCodes = new Set(styleLetters.map((item) => item.code))

  const rankedValues = VALUE_CODES.map((code) => ({
    code,
    name: valueByCode[code].name,
    score: valueScores[code],
  })).sort((a, b) => b.score - a.score || valueOrder[a.code] - valueOrder[b.code])
  const topValues = rankedValues.filter((item) => item.score > 0).slice(0, 2)
  const activeValueCodes = new Set(topValues.map((item) => item.code))

  const profileMap = Object.fromEntries((profiles || []).map((item) => [item.type, item]))
  const primaryProfile = profileMap[primary.code]
  const secondaryProfile = profileMap[secondary.code]
  const primaryName = hollandByCode[primary.code].activity
  const secondaryName = hollandByCode[secondary.code].activity
  const primaryBlurb = primaryProfile?.description || hollandByCode[primary.code].blurb
  const secondaryBlurb = secondaryProfile?.description || hollandByCode[secondary.code].blurb

  let typeName
  let description
  if (lowInterest && useSecondary) {
    typeName = `${primaryName}与${secondaryName}只是起点`
    description =
      '这几类活动你都还没特别想做。可以先参加实训或职业体验，再看哪一类做起来更起劲。下面两类只是了解的起点。'
  } else if (lowInterest) {
    typeName = `${primaryName}只是起点`
    description =
      '这几类活动你都还没特别想做。可以先参加实训或职业体验，再看哪一类做起来更起劲。下面只是了解的起点。'
  } else if (tied) {
    typeName = `${primaryName}与${secondaryName}都明显`
    description = `${primaryBlurb}${secondaryBlurb}`
  } else if (useSecondary) {
    typeName = `${primaryName}为主，其次${secondaryName}`
    description = `${primaryBlurb}其次，${secondaryName}的活动也值得看：${secondaryBlurb}`
  } else {
    typeName = `${primaryName}为主`
    description = primaryBlurb
  }

  let valueNote = ''
  if (!topValues.length) {
    valueNote = '这几项工作条件你都还不太在意，下面的排序只按活动兴趣。'
  } else {
    valueNote = `你更在意：${topValues.map((item) => item.name).join('、')}。`
  }

  const secondProfile = useSecondary ? secondaryProfile : null
  const careers = rankItems(primaryProfile, secondProfile, tied, activeValueCodes, styleCodes, 'careers', 4)
  const majors = rankItems(primaryProfile, secondProfile, tied, activeValueCodes, styleCodes, 'majors', 3)
  const valueGap = topValues.length > 0 && careers.every((item) => item.valueOverlap === 0)
  if (valueGap) {
    valueNote += '这些方向主要对应活动兴趣，和你更在意的条件重叠不多，建议只作了解。'
  }

  const bars = HOLLAND_TYPES.map((item) => {
    const max = Math.max(interestCounts[item.code] * 2, 1)
    const score = interestScores[item.code]
    return {
      code: item.code,
      label: hollandByCode[item.code].activity,
      score,
      max,
      percent: Math.round((score / max) * 100),
      active: item.code === primary.code || (useSecondary && item.code === secondary.code),
    }
  })

  return {
    type: useSecondary ? `${primary.code} + ${secondary.code}` : primary.code,
    primary: primary.code,
    secondary: secondary.code,
    typeName,
    description,
    lowInterest,
    tied,
    valueNote,
    styleNote: styleNoteFrom(styleLetters),
    styleLetters,
    topValues,
    bars,
    scores: { ...interestScores, ...valueScores },
    careers: careers.map(stripRank),
    majors: majors.map(stripRank),
  }
}

function clearStyleLetters(styleScores) {
  return STYLE_PAIRS.flatMap(([left, right]) => {
    if (styleScores[left] === styleScores[right]) return []
    if (Math.max(styleScores[left], styleScores[right]) < 2) return []
    const code = styleScores[left] > styleScores[right] ? left : right
    return [{ code, name: STYLE_LETTER_NAMES[code] }]
  })
}

function styleNoteFrom(styleLetters) {
  if (!styleLetters.length) {
    return '做事方式两边都接近，排序主要看活动兴趣。它不单独决定专业。'
  }
  return `做事方式：${styleLetters.map((item) => item.name).join('、')}。它只用来在同类职业里排序，不单独决定专业。`
}

function rankItems(primaryProfile, secondaryProfile, tied, activeValueCodes, styleCodes, field, limit) {
  const decorate = (profile, fromPrimary) =>
    (profile?.[field] || []).map((item, index) => {
      const valueOverlap = (item.valueTags || []).filter((code) => activeValueCodes.has(code)).length
      const styleOverlap = (item.styleTags || []).filter((code) => styleCodes.has(code)).length
      return {
        ...item,
        interestLabel: tied ? '两个兴趣都相近' : fromPrimary ? '主要兴趣' : '其次兴趣',
        valueOverlap,
        styleOverlap,
        order: index,
      }
    })

  const primaryItems = decorate(primaryProfile, true).sort(byFit)
  if (tied) {
    return [...primaryItems, ...decorate(secondaryProfile, false)]
      .filter((item, index, list) => item.name && list.findIndex((other) => other.name === item.name) === index)
      .sort(byFit)
      .slice(0, limit)
  }

  const secondaryItems = decorate(secondaryProfile, false).sort(byFit)
  if (!secondaryItems.length) return primaryItems.slice(0, limit)
  return [...primaryItems.slice(0, limit - 1), secondaryItems[0]].slice(0, limit)
}

function byFit(a, b) {
  const score = (item) => item.valueOverlap * 2 + item.styleOverlap
  return score(b) - score(a) || a.order - b.order
}

function stripRank(item) {
  const copy = { ...item }
  delete copy.rankScore
  delete copy.order
  delete copy.valueOverlap
  delete copy.styleOverlap
  delete copy.match
  return copy
}
