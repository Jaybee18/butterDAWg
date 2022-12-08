const { app, BrowserWindow, ipcRenderer, ipcMain } = require('electron')
const path = require('path')

var wind = null;

let subwindows = [];

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
      },
        titleBarOverlay: {
            color: '#2f3241',
            symbolColor: '#74b1be'
        }
    });

    win.addListener("close", (e) => {
        subwindows.map(v => {
            try {
                v.close();
            } catch (error) {
                console.log("already destroyed")
            }
        });
    });
  
    win.loadFile('index.html')

    wind = win;
}

app.whenReady().then(() => {
    ipcMain.handle("plugin:open", openPlugin)

    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

function openPlugin(event, name) {
    const tmp = new BrowserWindow({
        width: 600,
        height: 200,
        autoHideMenuBar: true,
        title: name,
    });
    tmp.loadFile("./"+name+"/index.html");
    subwindows.push(tmp);
}

function openWindow(event, title, options, folder) {
    const tmp = new BrowserWindow(options);
    tmp.setParentWindow(wind);
    // put those other windows in folders with index.html files too
    tmp.loadFile(folder+"/index.html");
    //tmp.webContents.send(title);
    //ipcMain.emit(this.id);
}