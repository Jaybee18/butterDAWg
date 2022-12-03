const { app, BrowserWindow, ipcRenderer, ipcMain } = require('electron')
const path = require('path')

const createWindow = () => {
    const win = new BrowserWindow({
      width: 1800,
      height: 1000,
      autoHideMenuBar: true,
      fullscreen: false, // just for debugging TODO
      frame: true, // just for debugging
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
        titleBarOverlay: {
            color: '#2f3241',
            symbolColor: '#74b1be'
        }
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        return {action: 'allow',
    overrideBrowserWindowOptions: {
        frame: false,
        autoHideMenuBar: true,
    }};
    });
  
    win.loadFile('index.html')
}

app.whenReady().then(() => {
    ipcMain.handle("test", openWindow)

    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

function openWindow(event, title, options) {
    const tmp = new BrowserWindow(options);
    tmp.setTitle(title);
}