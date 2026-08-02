/** 维度对：前者为高分侧字母 */
export const DIMENSION_PAIRS = [
  { key: 'EI', high: 'E', low: 'I', highLabel: '外向 E', lowLabel: '内向 I' },
  { key: 'SN', high: 'S', low: 'N', highLabel: '实感 S', lowLabel: '直觉 N' },
  { key: 'TF', high: 'T', low: 'F', highLabel: '理性 T', lowLabel: '情感 F' },
  { key: 'JP', high: 'J', low: 'P', highLabel: '计划 J', lowLabel: '随性 P' },
]

/**
 * @param {Array<{trait: string}>} answers - 每题选中的 option
 * @returns {{ type: string, scores: Record<string, number>, percentages: Record<string, number>, bars: Array }}
 */
export function calculateMbti(answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

  answers.forEach((answer) => {
    if (answer?.trait && scores[answer.trait] !== undefined) {
      scores[answer.trait] += 1
    }
  })

  const type = DIMENSION_PAIRS.map(({ high, low }) => (scores[high] >= 2 ? high : low)).join('')

  const percentages = {}
  const bars = DIMENSION_PAIRS.map(({ high, low, highLabel, lowLabel }) => {
    const highScore = scores[high]
    const pct = Math.round((highScore / 4) * 100)
    percentages[high] = pct
    percentages[low] = 100 - pct
    return {
      high,
      low,
      highLabel,
      lowLabel,
      highScore,
      lowScore: scores[low],
      highPercent: pct,
      dominant: scores[high] >= 2 ? high : low,
    }
  })

  return { type, scores, percentages, bars }
}
