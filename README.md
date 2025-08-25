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

## Docker

1. Skopiuj `.env.example` do `.env` (w root) i uzupełnij `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
2. Zbuduj i uruchom:
   - `make docker-build`
   - `make docker-up`
3. Wejdź na: `http://localhost:8080/?project=my-project&room=my-room`
4. Backend (Yjs ws): `ws://localhost:1234`

Uwaga: `VITE_YWS_URL` w `docker-compose.yml` domyślnie wskazuje na `ws://backend:1234` (wewnątrz sieci dockerowej).

## Electron (desktop)

Opcja A (korzysta z dev serwerów):
- `make electron-install`
- Upewnij się, że frontend działa (np. `make dev-frontend`) lub Docker (`make docker-up`).
- Uruchom: `ELECTRON_APP_URL=http://localhost:8080 make electron-start`

Opcja B (statyczne pliki):
- `make frontend-build`
- `make electron-install && make electron-start`

W menu File → Open Preview SVG… możesz wskazać `preview.svg`. Aplikacja odczyta `<metadata>` i załaduje projekt (przez `?project=...`).

## Backend: Preview Metadata API

Endpointy pomocne przy wycenie i integracjach:
- GET `/preview/metadata?url=<URL_DO_SVG>`
- POST `/preview/metadata` (body: cały SVG, `Content-Type: image/svg+xml`)

Przykłady:
```
curl "http://localhost:1234/preview/metadata?url=https://.../preview.svg"
curl -X POST -H "Content-Type: image/svg+xml" --data-binary @preview.svg http://localhost:1234/preview/metadata
```

## Makefile skróty

- `make dev-backend` / `make dev-frontend`
- `make docker-build` / `make docker-up` / `make docker-down` / `make docker-logs`
- `make frontend-build`
- `make electron-install` / `make electron-start`

## Notes
- This is a minimal starting point. For production:
  - add sanitization (DOMPurify) before rendering uploaded SVGs
  - secure Supabase keys and rules
  - replace periodic snapshot with event-driven saves
