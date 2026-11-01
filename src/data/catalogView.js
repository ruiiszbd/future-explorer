import { majorCategories, majorClasses } from './majorCatalog'
import { occupationMids } from './occupationCatalog'
import {
  careerMids,
  interestMajorCategories,
  interestOccupationMids,
  majorExamples,
} from './catalogLinks'

export const EXAMPLE_NOTE = '下面是这些类别中的例子，不是该类的全部专业或职业。'

const categoryByCode = Object.fromEntries(majorCategories.map((item) => [item.code, item]))
const classByCode = Object.fromEntries(majorClasses.map((item) => [item.code, item]))
const midByCode = Object.fromEntries(occupationMids.map((item) => [item.code, item]))

function uniquePush(list, code) {
  if (code && !list.includes(code)) list.push(code)
}

export function buildCatalogView(result) {
  const codes = [result.primary].filter(Boolean)
  if (String(result.type || '').includes('+') && result.secondary && result.secondary !== result.primary) {
    codes.push(result.secondary)
  }

  const majorCodes = []
  const midCodes = []
  codes.forEach((code) => {
    ;(interestMajorCategories[code] || []).forEach((id) => uniquePush(majorCodes, id))
    ;(interestOccupationMids[code] || []).forEach((id) => uniquePush(midCodes, id))
  })

  const majorLimit = codes.length > 1 ? 4 : 3
  const midLimit = codes.length > 1 ? 5 : 4

  return {
    majorCategories: majorCodes
      .slice(0, majorLimit)
      .map((code) => categoryByCode[code])
      .filter(Boolean),
    occupationMids: midCodes
      .slice(0, midLimit)
      .map((code) => midByCode[code])
      .filter(Boolean),
    careers: (result.careers || []).map((career) => {
      const mid = midByCode[careerMids[career.name]]
      return {
        ...career,
        occupationMidCode: mid?.code || '',
        occupationMidName: mid?.name || '',
      }
    }),
    majors: (result.majors || []).map((major) => {
      const link = majorExamples[major.name]
      const majorClass = link ? classByCode[link.classCode] : null
      const category = majorClass ? categoryByCode[majorClass.category] : null
      return {
        ...major,
        majorCode: link?.code || '',
        majorClassName: majorClass?.name || '',
        majorCategoryName: category?.name || '',
        catalogName: link?.catalogName && link.catalogName !== major.name ? link.catalogName : '',
      }
    }),
  }
}
