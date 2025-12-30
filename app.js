const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();


let win;
const dbPath = path.join(__dirname, 'database', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Handle database queries from renderer process
ipcMain.handle('query-database', async (event, query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: true,
    },
  });
  try {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/aliagri/browser/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  } catch (error) {
    console.log("the url isnt loading", error)
  }


  win.on('closed', () => {
    win = null;
  });
  win.webContents.on('did-fail-load', () => {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/aliagri/browser/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
ipcMain.on('navigate', (event, route) => {
  console.log(`Navigating to ${route}`);
  if (win) {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/aliagri/browser/index.html'),
        protocol: 'file:',
        slashes: true,
        hash: route
      })
    ).then(() => {
      console.log('Navigation successful');
    }).catch(err => {
      console.error('Navigation failed:', err);
    });
  } else {
    console.error('BrowserWindow instance is null');
  }
});
