import React, { useEffect, useRef } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/dist/excalidraw.css'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { createPreviewSVG } from './preview'
import { uploadFile, getSignedUrl, downloadFile } from './supabase'

export default function App() {
  const excaliRef = useRef(null)

  useEffect(() => {
    const ydoc = new Y.Doc()

    // derive dynamic ids and endpoints
    const params = new URLSearchParams(window.location.search)
    const projectId = params.get('project') || 'demo-project'
    const roomId = params.get('room') || projectId
    const ywsUrl = import.meta.env.VITE_YWS_URL || 'ws://localhost:9134'

    // local persistence keyed per project
    new IndexeddbPersistence(projectId, ydoc)

    // attempt to preload last snapshot from Supabase
    ;(async () => {
      try {
        const blob = await downloadFile('projects', `snapshots/${projectId}.bin`)
        const buf = await blob.arrayBuffer()
        Y.applyUpdate(ydoc, new Uint8Array(buf))
        console.log('Loaded snapshot for', projectId)
      } catch (e) {
        console.log('No snapshot to preload (ok for first run):', e?.message || e)
      }
    })()

    // realtime provider
    const provider = new WebsocketProvider(ywsUrl, roomId, ydoc)
    provider.on('status', event => console.log('WS status:', event.status))

    // periodic upload: preview.svg + snapshot
    const interval = setInterval(async () => {
      try {
        if (!excaliRef.current) return
        const elements = excaliRef.current.getSceneElements()
        const meta = {
          projectId,
          files: [
            { name: 'snapshot', path: `snapshots/${projectId}.bin` },
            { name: 'preview', path: `previews/${projectId}.svg` }
          ]
        }
        const svg = createPreviewSVG(elements, meta)

        // upload preview.svg
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const filePath = `previews/${projectId}.svg`
        await uploadFile('projects', filePath, blob)
        const signed = await getSignedUrl('projects', filePath)
        console.log('Preview uploaded. Signed URL:', signed)

        // serialize Y.Doc state snapshot
        const snapshot = Y.encodeStateAsUpdate(ydoc)
        const bin = new Blob([snapshot], { type: 'application/octet-stream' })
        await uploadFile('projects', `snapshots/${projectId}.bin`, bin)
        console.log('Snapshot uploaded.')
      } catch (err) {
        console.error('Periodic upload error:', err)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{height: '100vh'}}>
      <Excalidraw ref={excaliRef} />
    </div>
  )
}
