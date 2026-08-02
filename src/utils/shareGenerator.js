import html2canvas from 'html2canvas'

/**
 * 将 DOM 节点渲染为 PNG DataURL
 * @param {HTMLElement} element
 * @returns {Promise<string>}
 */
export async function captureShareImage(element) {
  if (!element) throw new Error('分享节点不存在')

  const canvas = await html2canvas(element, {
    backgroundColor: '#1a1040',
    scale: Math.min(2, window.devicePixelRatio || 2),
    useCORS: true,
    logging: false,
  })

  return canvas.toDataURL('image/png')
}

/**
 * 触发下载
 * @param {string} dataUrl
 * @param {string} filename
 */
export function downloadDataUrl(dataUrl, filename = 'turecareer-result.png') {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}
