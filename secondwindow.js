let { BrowserWindow } = require("electron");
const path = require("path");

const secondaryWindows = new Set();
let win;
function createSecondaryWindow(url) {
  win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    title: "Qspiders-Training-App",
    icon: path.join(__dirname, "./assests/icon.png"),

    // fullscreen: true,
    // kiosk: true,
    webPreferences: {
      menu: null,
      frame: false,
      autoHideMenuBar: true,
      contextIsolation: true,
      nodeIntegration: true,
      allowPopups: false,
      devTools: false,
    },
  });
  win.setMenu(null);
  win.once("ready-to-show", () => win.show());
  win.loadURL(url, { userAgent: "Chrome" }); // Replace this URL with your desired URL
  win.setContentProtection(true);

  win.on("focus", () => {
    win.setContentProtection(true);

    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      console.log("Focused window title:", focusedWindow.getTitle());
      win.setContentProtection(true);
    }
  });

  win.webContents.setWindowOpenHandler((details) => {
    return { action: "deny" };
  });

  win.setContentProtection(true);

  win.on("closed", () => {
    // showErrorDialog("child window closed")

    secondaryWindows.delete(win);
    win = null;
  });

  secondaryWindows.add(win);
}

function closeSecondaryWindow() {
  secondaryWindows.forEach((window) => {
    if (!window.isDestroyed()) {
      window.close();
    }
  });

  secondaryWindows.clear();
}

module.exports = {
  createSecondaryWindow,
  secondaryWindows,
  closeSecondaryWindow,
};
