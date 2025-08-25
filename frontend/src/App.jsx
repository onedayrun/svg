import React, { useEffect, useRef } from 'react'
import Excalidraw from '@excalidraw/excalidraw'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { createPreviewSVG } from './preview'
import { uploadFile, getSignedUrl } from './supabase'

export default function App() {
  const excaliRef = useRef(null)

  useEffect(() => {
    const ydoc = new Y.Doc()
    new IndexeddbPersistence('demo-project', ydoc)

    const provider = new WebsocketProvider('ws://localhost:1234', 'demo-room', ydoc)
    provider.on('status', event => console.log('WS status:', event.status))

    // periodic upload: preview.svg + snapshot
    const interval = setInterval(async () => {
      try {
        if (!excaliRef.current) return
        const elements = excaliRef.current.getSceneElements()
        const svg = createPreviewSVG(elements)

        // upload preview.svg
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const filePath = `previews/demo-project.svg`
        await uploadFile('projects', filePath, blob)
        const signed = await getSignedUrl('projects', filePath)
        console.log('Preview uploaded. Signed URL:', signed)

        // serialize Y.Doc state snapshot
        const snapshot = Y.encodeStateAsUpdate(ydoc)
        const bin = new Blob([snapshot], { type: 'application/octet-stream' })
        await uploadFile('projects', `snapshots/demo-project.bin`, bin)
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
