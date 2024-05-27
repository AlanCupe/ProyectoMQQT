const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000'); // Cambia esto a la URL de tu aplicación
}

app.whenReady().then(() => {
  // Inicia tu servidor backend aquí
  exec('npm start', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error al iniciar el servidor: ${err}`);
      return;
    }
    console.log(`Servidor iniciado: ${stdout}`);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
