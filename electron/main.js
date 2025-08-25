const { app, BrowserWindow, Menu, dialog } = require('electron')
const fs = require('fs')
const path = require('path')

function extractMetadata(svgString) {
  try {
    const match = svgString.match(/<metadata[^>]*>([\s\S]*?)<\/metadata>/i)
    if (!match) return null
    const jsonText = match[1].trim()
    return JSON.parse(jsonText)
  } catch (e) {
    return null
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const appUrl = process.env.ELECTRON_APP_URL || null
  const distIndex = path.join(__dirname, '..', 'frontend', 'dist', 'index.html')

  function loadApp(projectId) {
    if (appUrl) {
      const url = projectId ? `${appUrl}?project=${encodeURIComponent(projectId)}` : appUrl
      win.loadURL(url)
    } else if (fs.existsSync(distIndex)) {
      win.loadFile(distIndex, { search: projectId ? `?project=${encodeURIComponent(projectId)}` : '' })
    } else {
      const devUrl = 'http://localhost:5173/'
      const url = projectId ? `${devUrl}?project=${encodeURIComponent(projectId)}` : devUrl
      win.loadURL(url)
    }
  }

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Preview SVG…',
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog(win, {
              title: 'Open preview.svg',
              filters: [{ name: 'SVG', extensions: ['svg'] }],
              properties: ['openFile']
            })
            if (canceled || !filePaths[0]) return
            try {
              const content = fs.readFileSync(filePaths[0], 'utf-8')
              const meta = extractMetadata(content)
              const projectId = meta?.projectId
              if (projectId) {
                loadApp(projectId)
              } else {
                dialog.showErrorBox('No projectId in metadata', 'Selected SVG does not contain projectId in <metadata>.')
              }
            } catch (e) {
              dialog.showErrorBox('Error opening SVG', String(e.message || e))
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  loadApp() // initial load without projectId
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
