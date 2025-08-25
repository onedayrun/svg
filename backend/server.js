import express from 'express'
import { WebSocketServer } from 'ws'
import setupWSConnection from 'y-websocket/bin/utils.js'
import * as http from 'http'
import cors from 'cors'

const app = express()
app.use(cors())

app.get('/', (req, res) => res.send('Yjs collab backend alive'))

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req)
})

const PORT = process.env.PORT || 1234
server.listen(PORT, () => console.log('Backend running on :' + PORT))
