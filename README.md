# Collab MVP Repo
Minimal collaboration MVP with:
- backend: Node + y-websocket (WebSocket server for Yjs)
- frontend: Vite + React + Excalidraw + Yjs + Supabase storage integration
- periodic upload of preview.svg and Y.Doc snapshot to Supabase Storage

Now also supports:
- dynamic project/room IDs via URL params
- loading the latest Y.Doc snapshot from Supabase at startup
- configurable WebSocket server URL via env

## Quickstart (local)

1. Backend
   - cd backend
   - npm install
   - npm start

2. Frontend
   - cd frontend
   - npm install
   - create a `.env` file:
     VITE_SUPABASE_URL=https://<your>.supabase.co
     VITE_SUPABASE_ANON_KEY=<anon-key>
     # optional: WebSocket server (defaults to ws://localhost:1234)
     VITE_YWS_URL=ws://localhost:1234
   - npm run dev

3. Supabase
   - create a storage bucket named `projects`
   - optionally set it public or keep private (signed URLs used for preview)

## Using dynamic IDs

- Open the app with URL params to set IDs:
  - project ID (also used for local IndexedDB key): `?project=my-project`
  - room ID (for Yjs websocket room, defaults to project): `&room=my-room`

Example:
```
http://localhost:5173/?project=my-project&room=my-room
```

## Snapshot preload

- On startup, the app tries to download `snapshots/<projectId>.bin` from the `projects` bucket and applies it to the Y.Doc.
- Periodically, it uploads:
  - `previews/<projectId>.svg`
  - `snapshots/<projectId>.bin`

## Notes
- This is a minimal starting point. For production:
  - add sanitization (DOMPurify) before rendering uploaded SVGs
  - secure Supabase keys and rules
  - replace periodic snapshot with event-driven saves
