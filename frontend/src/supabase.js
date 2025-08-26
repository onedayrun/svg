import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const STORAGE_MODE = (import.meta.env.VITE_STORAGE_MODE || (import.meta.env.VITE_USE_BACKEND_STORAGE ? 'backend' : '') || 'supabase').toLowerCase()
const BACKEND_HTTP_URL = (import.meta.env.VITE_BACKEND_HTTP_URL || 'http://localhost:9134').replace(/\/$/, '')

// Create Supabase client (may be unused in backend mode)
export const supabase = (STORAGE_MODE === 'supabase') ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null

function parseProjectFromPath(base, path, ext) {
  if (!path.startsWith(base + '/')) return null
  const name = path.substring(base.length + 1)
  return name.endsWith(ext) ? name.slice(0, -ext.length) : null
}

export async function uploadFile(bucket, path, file) {
  if (STORAGE_MODE === 'backend') {
    // Route to backend endpoints, ignore bucket
    const isPreview = path.startsWith('previews/')
    const isSnapshot = path.startsWith('snapshots/')
    if (!isPreview && !isSnapshot) throw new Error('Unsupported path for backend storage: ' + path)
    const project = isPreview
      ? parseProjectFromPath('previews', path, '.svg')
      : parseProjectFromPath('snapshots', path, '.bin')
    if (!project) throw new Error('Invalid storage path: ' + path)

    const url = isPreview
      ? `${BACKEND_HTTP_URL}/previews/${encodeURIComponent(project)}`
      : `${BACKEND_HTTP_URL}/snapshots/${encodeURIComponent(project)}`

    const body = file instanceof Blob ? file : new Blob([file])
    const headers = isPreview
      ? { 'Content-Type': 'image/svg+xml' }
      : { 'Content-Type': 'application/octet-stream' }

    const res = await fetch(url, { method: 'PUT', headers, body })
    if (!res.ok) throw new Error(`Backend upload failed: ${res.status}`)
    return { path }
  }

  // Supabase mode (default)
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  return data
}

export async function getSignedUrl(bucket, path) {
  if (STORAGE_MODE === 'backend') {
    const isPreview = path.startsWith('previews/')
    if (!isPreview) throw new Error('Signed URL only supported for previews in backend mode')
    const project = parseProjectFromPath('previews', path, '.svg')
    if (!project) throw new Error('Invalid preview path: ' + path)
    return `${BACKEND_HTTP_URL}/previews/${encodeURIComponent(project)}`
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function downloadFile(bucket, path) {
  if (STORAGE_MODE === 'backend') {
    const isPreview = path.startsWith('previews/')
    const isSnapshot = path.startsWith('snapshots/')
    if (!isPreview && !isSnapshot) throw new Error('Unsupported path for backend storage: ' + path)
    const project = isPreview
      ? parseProjectFromPath('previews', path, '.svg')
      : parseProjectFromPath('snapshots', path, '.bin')
    if (!project) throw new Error('Invalid storage path: ' + path)
    const url = isPreview
      ? `${BACKEND_HTTP_URL}/previews/${encodeURIComponent(project)}`
      : `${BACKEND_HTTP_URL}/snapshots/${encodeURIComponent(project)}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Backend download failed: ${res.status}`)
    return await res.blob()
  }

  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error) throw error
  return data // Blob
}
