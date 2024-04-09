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
    getRunningContainers: () => ipcRenderer.invoke('getRunningContainers'),
    isDockerInstalled: () => ipcRenderer.invoke('isDockerInstalled'),
    getCommitConsent: (callback) => ipcRenderer.on('get-commit-consent', (_event,value) => callback(value)),
    runDocker: (...args) => ipcRenderer.invoke('runDocker',...args),
  })
} catch (error) {
  console.error(error)
}