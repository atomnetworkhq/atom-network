import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {confirmFolder, confirmUserProfile, completeSetup, fetchUserData,fetchDockerCompose,isDockerInstalled,getRunningContainers,runDocker} from './libs/index'
import { homedir } from 'os'
import path from 'path'
const fs = require('fs')
import { exec } from 'child_process'
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'site-per-process');


function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('confirmFolder', async() => confirmFolder());
  ipcMain.handle('confirmUserProfile', async() => confirmUserProfile());
  ipcMain.handle('completeSetup',async(_,...args)=>completeSetup(...args));
  ipcMain.handle('fetchUserData',async()=>fetchUserData());
  ipcMain.handle('fetchDockerCompose',async(_,...args)=>fetchDockerCompose(...args));
  ipcMain.handle('getRunningContainers',async()=>getRunningContainers());
  ipcMain.handle('isDockerInstalled',async()=>isDockerInstalled());
  ipcMain.handle('runDocker',async(_,...args)=>runDocker(...args));



  const mainWindow = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  const getRootDir = () => {
    console.log(homedir());
    return `${homedir()}\\atomnetwork-provider`
  }

  async function zrok_starter() {
    console.log('hullllllllllllllllllu')
    let rootDir = getRootDir()
    const userProfilePath = path.join(rootDir, 'userprofile.json');
    let data = await fs.readFileSync(userProfilePath, 'utf8');

    let values = JSON.parse(data);
    console.log(values);
    let profile= { "node-name": values["name"], "user-id": values["uuid"], 'public-key': values["walletPub"],'zrok-url':values["zrok_url"],'zrok-token':values["zrok_token"],'protonId':values["protonConfig"]["protonUUID"] }
      const child = exec('zrok share reserved '+profile['zrok-token']).on('error', function (err) { throw err })
    child.stdout.on('data', (data) => {
      console.log(data)
    });
    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }

  const http = require('http');

  const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('GET request handled');
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        console.log(body);
        mainWindow.webContents.send('get-commit-consent', body);
      });
      req.on('end', () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('POST request handled');
      });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not found');
    }
  });
  
  const port = 3009;
  server.listen(port, () => {
    console.log("Server running at http://localhost:3009");
    zrok_starter();
  });


})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
