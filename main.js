const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const path = require('path');
const RPC = require('discord-rpc');

const CLIENT_ID = '1481389801268711554';
const REMOTE_URL = 'https://unixityyy.github.io/starlight/';
let win;
let rpc;

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      autoplayPolicy: 'no-user-gesture-required'
    }
  });

  win.setAutoHideMenuBar(true);
  win.setMenuBarVisibility(false);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('did-fail-load', (event, errorCode) => {
    if (errorCode === -106) win.loadFile('no-internet.html');
  });

  win.webContents.session.on('will-download', (event, item) => {
    const savePath = dialog.showSaveDialogSync(win, {
      title: "Starlight Song Download",
      defaultPath: item.getFilename()
    });
    if (savePath) item.setSavePath(savePath); else item.cancel();
  });

  try {
    const response = await fetch('https://raw.githubusercontent.com/Unixityyy/starlight/refs/heads/main/CNAME');
    if (!response.ok) throw new Error();
    const customDomain = (await response.text()).trim();
    win.loadURL(`https://${customDomain}`);
  } catch (e) {
    win.loadURL('https://unixityyy.github.io/starlight/');
  }
}

function initDiscord() {
  rpc = new RPC.Client({ transport: 'ipc' });

  rpc.on('ready', () => {
    console.log('Discord RPC Ready');
    updatePresence("Browsing Library", "Starlight");
  });

  rpc.login({ clientId: CLIENT_ID }).catch(() => console.log("Discord not detected."));
}

function updatePresence(details, state) {
  if (!rpc) return;
  rpc.setActivity({
    details: details,
    state: state,
    largeImageKey: 'discord_rpc',
    largeImageText: 'Starlight for Windows',
    instance: false,
  });
}

ipcMain.on('sync-discord', (event, data) => {
  updatePresence(data.title, data.artist);
});

app.whenReady().then(() => {
  createWindow();
  initDiscord();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});