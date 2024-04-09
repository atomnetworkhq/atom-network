import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow')
}


try {
  contextBridge.exposeInMainWorld('context', {
    confirmFolder : () => ipcRenderer.invoke('confirmFolder'),
    confirmUserProfile: () => ipcRenderer.invoke('confirmUserProfile'),
    completeSetup: (...args) => ipcRenderer.invoke('completeSetup',...args),
    fetchUserData: () => ipcRenderer.invoke('fetchUserData'),
    fetchDockerCompose: (...args) => ipcRenderer.invoke('fetchDockerCompose',...args),
  })
} catch (error) {
  console.error(error)
}