let {
  app,
  BrowserWindow,
  screen,
  dialog,
  Menu,
  ipcMain,
  session,
  autoUpdater,
} = require("electron");
let {
  createSecondaryWindow,
  secondaryWindows,
  closeSecondaryWindow,
} = require("./secondwindow");
const os = require("os");
let {
  checkAndTerminateApps,
  funWinRemoteDsktop,
  dataofappnames,
} = require("./checkingbg-forge");
const { spawn } = require("child_process");

const jwt = require("jsonwebtoken");
let jwt_decode = require("jwt-decode");
let axios = require("axios");
const path = require("path");

// benchLocal:"http://192.168.0.203:4007/";

let benchurlL = "http://192.168.0.203:4007/"; //student
let benchurlG = "https://alpha.qspiders.com/"; // manager

// let benchurlG = "https://testalpha.qspiders.com/"; // manager

if (require("electron-squirrel-startup")) app.quit();
const server = "https://techelectron.qspiders.com/";
// const url = `${server}/update/win_64/${app.getVersion()}/stable`;
const url = `${server}/update/flavor/qspiders-training/win_64/${app.getVersion()}/stable`;
// const url = `${server}/update/flavor/bench/win_64/${app.getVersion()}/stable`;

autoUpdater.setFeedURL({ url });

autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

autoUpdater.on("update-not-available", () => {
  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Up-to-date",
    message: "The current version is up-to-date.",
  });
});

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };

  dialog.showMessageBox(mainWindow, dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
    closeSecondaryWindow();
    app.quit();
  });
});

autoUpdater.on("error", (message) => {
  console.error("There was a problem updating the application");
  console.error(message);

  // dialog
  //   .showMessageBox(mainWindow, {
  //     type: "error",
  //     title: "error",
  //     message: `There was a problem with the application. Please contact this helpline number: 7338471266.`,
  //     // message: message.toString(),
  //   })
  //   .then((ress) => {
  //     if (ress.response == 0) {
  //       closeSecondaryWindow();
  //       app.quit();
  //     }
  //   })
  //   .catch((err) => {
  //     closeSecondaryWindow();
  //     app.quit();
  //   });
});

const networkInterfaces = os.networkInterfaces();
const defaultInterface =
  networkInterfaces["Ethernet"] ||
  networkInterfaces["Wi-Fi"] ||
  networkInterfaces["eth0"] ||
  null;

const SHELL_TOKEN = jwt.sign(
  {
    DeviceId: defaultInterface
      ? defaultInterface[0].mac.toUpperCase()
      : os.arch() + "-" + os.userInfo().username,
    AppVersion: app.getVersion(),
  },
  "SHELL_APP",
  {
    expiresIn: "30d",
  }
);

let mainWindow;

let checkInertnet = require("dns");

Object.defineProperty(app, "isPackaged", {
  get() {
    return true;
  },
});

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    title: "Qspiders-Training-App",
    show: false,
    // fullscreen: true,
    // kiosk: true,
    icon: path.join(__dirname, "./assests/icon.png"),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      allowPopups: false,
      devTools: false,
      webSecurity: false,
      preload: path.join(__dirname, "blank.js"),
    },
  });
  mainWindow.maximize();
  mainWindow.center();
  // ----------------------

  const defaultSession = session.defaultSession;

  // Intercept requests and modify headers for matched URLs
  defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // Check if the URL matches the desired pattern

    if (
      details.url.startsWith("https://alphab.qspiders.com") ||
      details.url.startsWith("http://192.168.0.203:4008/")
    ) {
      const newHeaders = Object.assign({}, details.requestHeaders, {
        "X-Requested-With": SHELL_TOKEN,
      });

      callback({ requestHeaders: newHeaders });
    } else {
      // For URLs that don't match, proceed without modification
      callback({ requestHeaders: details.requestHeaders });
    }
    // console.log(details.url);
    if (
      details.url.startsWith(
        "https://alphab.qspiders.com/api/v1/get_batch?limit="
      ) ||
      details.url.startsWith(
        "https://alphab.qspiders.com/api/v1/get_course?limit="
      ) ||
      details.url == "https://alphab.qspiders.com/api/v1/login"
    ) {
      session.defaultSession.cookies
        .get({ name: "bench" })
        .then(async (cookies) => {
          console.log(cookies[0]);
          if (cookies.length > 0) {
            try {
              let decodetokendata = jwt_decode(cookies[0].value);
              // console.log(decodetokendata);
              let aa = await axios.post(
                "http://125.99.241.230:8080/apps/createsystemip/",
                {
                  systemip: defaultInterface
                    ? defaultInterface[0].mac.toUpperCase()
                    : os.arch() + "-" + os.userInfo().username,
                  username: decodetokendata.sub,
                  systemusername: os.arch() + "-" + os.userInfo().username,
                }
              );
              console.log(aa.data);
            } catch (error) {
              console.log(error);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
      // callback({});
    }
  });

  // mainWindow.webContents.session.webRequest.onHeadersReceived(
  //   (details, callback) => {
  //     callback({
  //       responseHeaders: {
  //         ...details.responseHeaders,
  //         "Content-Security-Policy": ["upgrade-insecure-requests"],
  //       },
  //     });
  //   }
  // );

  // ------title set

  // mainWindow.loadURL(benchurlL);

  mainWindow.loadURL(benchurlG).then(() => {
    mainWindow.setTitle("Qspiders-training");
  });

  mainWindow.setContentProtection(true);
  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();

    mainWindow.setTitle("Qspiders-training");
  });

  mainWindow.webContents.on("did-fail-load", () => {
    mainWindow.loadFile("index.html");
  });

  mainWindow.on("focus", () => {
    mainWindow.setContentProtection(true);
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      console.log("Focused window title:", focusedWindow.getTitle());
      focusedWindow.setContentProtection(true);

      checkInertnet.resolve("www.google.com", function (err) {
        if (err) {
          mainWindow.loadFile("index.html"); // Load a local HTML file indicating offline status
        } else {
          console.log("internet connectin is working");
        }
      });
    }
  });

  const mainMenuTemplate = [
    {
      label: "File",
      submenu: [{ label: "Exit", role: "quit" }],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },
    {
      label: "view",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
    },
    {
      label: "App",
      submenu: [
        {
          label: "Manager",
          click: () => {
            mainWindow.loadURL(benchurlG);
          },
        },
        {
          label: "Student",
          click: async () => {
            mainWindow.loadURL(benchurG);
          },
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Check For Update",
          click: async () => {
            autoUpdater.checkForUpdates();
          },
        },
        {
          label: `Version - ${app.getVersion()}`,
        },
      ],
    },
  ];

  // Create the menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // Set the application menu
  Menu.setApplicationMenu(mainMenu);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    createSecondaryWindow(details.url);
    return { action: "deny" };
  });

  let clearIntvPshell = setInterval(() => {
    checkAndTerminateApps(mainWindow, clearIntvPshell);
  }, 10000);

  funWinRemoteDsktop(app, showErrorDialog);

  mainWindow.on("closed", () => {
    mainWindow = null;
    closeSecondaryWindow();

    if (secondaryWindows.size === 0) {
      app.quit();
    }
  });

  ipcMain.on("send-data-to-main", async (event, data) => {
    console.log("Data received in main process from renderer:", data);

    if (data == "no") {
      closeSecondaryWindow();
      return app.quit();
    }

    // Testing.
    if (data === "yes") {
      mainWindow.loadURL(benchurlG);
      mainWindow.setContentProtection(true);

      mainWindow.webContents.setAudioMuted(false);

      const powershellCommand = `
      $processesToMatch = @(
        ${dataofappnames.map((name) => `'${name}'`).join(",")}
      )
      
      $processes = Get-Process | Where-Object { $processesToMatch -contains $_.ProcessName }
      
      # Stop the matched processes
      if ($processes) {
          $processes | ForEach-Object {
              Stop-Process -Id $_.Id -Force
          }
      }
      `;

      const child = spawn("powershell.exe", ["-Command", powershellCommand]);

      child.stdout.on("data", (data) => {
        console.log("stdout:", data.toString());
      });

      child.stderr.on("data", (data) => {
        console.error("stderr:", data.toString());
      });

      child.on("close", (code) => {
        console.log("Child process exited with code", code);
      });

      let clearIntvPshell1 = setInterval(() => {
        checkAndTerminateApps(mainWindow, clearIntvPshell1);
      }, 10000);
    }
  });
  ipcMain.on("send-data-errmsg", async (event, data) => {
    console.log("Data received in main error process from renderer:", data);

    if (data == "YES") {
      closeSecondaryWindow();
      return app.quit();
    }
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log("Instance already running.");
  app.quit();
} else {
  app.on("second-instance", () => {
    console.log("Second instance detected.");
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    createMainWindow();
    autoUpdater.checkForUpdates();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
      closeSecondaryWindow();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}

function showErrorDialog(message) {
  mainWindow.webContents.setAudioMuted(true);
  mainWindow.setMenu(null);
  mainWindow.loadFile("errmsg.html");
  // mainWindow.show();
  mainWindow.focus();
  closeSecondaryWindow();

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("data-to-render_errMesg", message);
  });
}

setInterval(() => {
  autoUpdater.checkForUpdates();
}, 86400000);
