export function createPreviewSVG(elements) {
  const shapes = elements.map(el => {
    if (el.type === 'rectangle') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" stroke="black" fill="none"/>`
    } else if (el.type === 'ellipse') {
      const cx = el.x + (el.width||0)/2
      const cy = el.y + (el.height||0)/2
      return `<ellipse cx="${cx}" cy="${cy}" rx="${(el.width||0)/2}" ry="${(el.height||0)/2}" stroke="black" fill="none"/>`
    } else if (el.type === 'text') {
      const txt = (el.text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
      return `<text x="${el.x}" y="${el.y+16}" font-family="Arial" font-size="14">${txt}</text>`
    }
    return ''
  }).join('\n')

  const metadata = {
    version: new Date().toISOString(),
    elementsCount: elements.length
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">\n  ${shapes}\n  <metadata>${JSON.stringify(metadata)}</metadata>\n</svg>`
}
