# Collab MVP Repo
Minimal collaboration MVP with:
- backend: Node + y-websocket (WebSocket server for Yjs)
- frontend: Vite + React + Excalidraw + Yjs + Supabase storage integration
- periodic upload of preview.svg and Y.Doc snapshot to Supabase Storage

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
   - npm run dev

3. Supabase
   - create a storage bucket named `projects`
   - optionally set it public or keep private (signed URLs used for preview)

## Notes
- This is a minimal starting point. For production:
  - add sanitization (DOMPurify) before rendering uploaded SVGs
  - secure Supabase keys and rules
  - replace periodic snapshot with event-driven saves
