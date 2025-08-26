import express from 'express'
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'
import * as http from 'http'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.text({ type: ['image/svg+xml', 'text/plain', 'application/xml', 'text/xml'] }))
app.use(express.raw({ type: ['application/octet-stream'], limit: '20mb' }))

// Ensure local storage directories exist
const SNAPSHOTS_DIR = path.join(process.cwd(), 'snapshots')
const PREVIEWS_DIR = path.join(process.cwd(), 'previews')
for (const dir of [SNAPSHOTS_DIR, PREVIEWS_DIR]) {
  try { fs.mkdirSync(dir, { recursive: true }) } catch {}
}

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

// GET snapshot binary
app.get('/snapshots/:project', async (req, res) => {
  const project = req.params.project
  const filePath = path.join(SNAPSHOTS_DIR, `${project}.bin`)
  try {
    await fs.promises.access(filePath, fs.constants.R_OK)
  } catch {
    return res.status(404).json({ error: 'Snapshot not found' })
  }
  res.type('application/octet-stream')
  return res.sendFile(filePath)
})

// PUT snapshot binary
app.put('/snapshots/:project', async (req, res) => {
  const project = req.params.project
  const filePath = path.join(SNAPSHOTS_DIR, `${project}.bin`)
  try {
    const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body)
    await fs.promises.writeFile(filePath, buf)
    return res.status(204).end()
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) })
  }
})

// GET preview SVG
app.get('/previews/:project', async (req, res) => {
  const project = req.params.project
  const filePath = path.join(PREVIEWS_DIR, `${project}.svg`)
  try {
    await fs.promises.access(filePath, fs.constants.R_OK)
  } catch {
    return res.status(404).json({ error: 'Preview not found' })
  }
  res.type('image/svg+xml')
  return res.sendFile(filePath)
})

// PUT preview SVG (body is text/svg)
app.put('/previews/:project', async (req, res) => {
  const project = req.params.project
  const filePath = path.join(PREVIEWS_DIR, `${project}.svg`)
  try {
    const svgText = typeof req.body === 'string' ? req.body : ''
    if (!svgText) return res.status(400).json({ error: 'Expected SVG text body' })
    await fs.promises.writeFile(filePath, svgText, 'utf-8')
    return res.status(204).end()
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
