window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
})


// const { contextBridge, ipcRenderer } = require("electron");
// const { readFileSync, readdirSync, existsSync } = require("fs");

// contextBridge.exposeInMainWorld("electronAPI", {
//  openWindow: () => ipcRenderer.invoke("test")
// })

// const fs = {
//   readFileSync,
//   readdirSync,
//   existsSync
// }
// contextBridge.exposeInMainWorld("fs", fs);
