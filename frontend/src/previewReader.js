// Utilities to parse preview.svg metadata

export function parseSvgMetadata(svgText) {
  try {
    const match = svgText.match(/<metadata[^>]*>([\s\S]*?)<\/metadata>/i)
    if (!match) return null
    const jsonText = match[1].trim()
    return JSON.parse(jsonText)
  } catch (e) {
    return null
  }
}

export async function fetchAndParsePreview(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch preview: ${res.status}`)
  const text = await res.text()
  return parseSvgMetadata(text)
}
