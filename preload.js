window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
})


//const { contextBridge, ipcRenderer } = require("electron");

// !! some importand ipc shit !!
//contextBridge.exposeInMainWorld("electronAPI", {
//  openWindow: () => ipcRenderer.invoke("test")
//})