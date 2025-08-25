import express from 'express'
import { WebSocketServer } from 'ws'
import setupWSConnection from 'y-websocket/bin/utils.js'
import * as http from 'http'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.text({ type: ['image/svg+xml', 'text/plain', 'application/xml', 'text/xml'] }))

app.get('/', (req, res) => res.send('Yjs collab backend alive'))

function parseSvgMetadata(svgText) {
  try {
    const match = svgText.match(/<metadata[^>]*>([\s\S]*?)<\/metadata>/i)
    if (!match) return null
    const jsonText = match[1].trim()
    return JSON.parse(jsonText)
  } catch (e) {
    return null
  }
}

// GET /preview/metadata?url=https://.../preview.svg
app.get('/preview/metadata', async (req, res) => {
  try {
    const url = req.query.url
    if (!url) return res.status(400).json({ error: 'Missing url query param' })
    const r = await fetch(url)
    if (!r.ok) return res.status(502).json({ error: `Fetch failed: ${r.status}` })
    const text = await r.text()
    const meta = parseSvgMetadata(text)
    if (!meta) return res.status(400).json({ error: 'No <metadata> JSON found in SVG' })
    return res.json({ metadata: meta })
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) })
  }
})

// POST /preview/metadata (body: SVG text)
app.post('/preview/metadata', async (req, res) => {
  try {
    const svgText = typeof req.body === 'string' ? req.body : ''
    if (!svgText) return res.status(400).json({ error: 'Expected SVG text body' })
    const meta = parseSvgMetadata(svgText)
    if (!meta) return res.status(400).json({ error: 'No <metadata> JSON found in SVG' })
    return res.json({ metadata: meta })
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) })
  }
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req)
})

const PORT = process.env.PORT || 1234
server.listen(PORT, () => console.log('Backend running on :' + PORT))
