let {
    app,
    BrowserWindow,
    screen,
    dialog,
    Menu,
    ipcMain,
    session,
    webContents,
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
} = require("./checkingbg.js");
const { exec } = require("child_process");
const { autoUpdater } = require("electron-updater");
const jwt = require("jsonwebtoken");

const path = require("path");

let benchurlL = "http://192.168.0.203:4007/"; //student
let benchurlG = "https://alpha.qspiders.com/"; // manager

app.commandLine.appendSwitch("disable-features", "IOSurfaceCapturer");
app.disableHardwareAcceleration();
app.disableHardwareAcceleration();

autoUpdater.setFeedURL({
    provider: "github",
    repo: "shell-app-testing-auto-update",
    owner: "TechBhoomi",
    private: false,
    token: "",
});

const networkInterfaces = os.networkInterfaces();
const defaultInterface =
    networkInterfaces["Ethernet"] ||
    networkInterfaces["Wi-Fi"] ||
    networkInterfaces["eth0"] ||
    null;

const SHELL_TOKEN = jwt.sign({
        DeviceId: defaultInterface ?
            defaultInterface[0].mac.toUpperCase() : os.arch() + "-" + os.userInfo().username,
        AppVersion: app.getVersion(),
    },
    "SHELL_APP", {
        expiresIn: "30d",
    }
);

let mainWindow;

const log = require("electron-log");
log.transports.file.level = "info";

let checkInertnet = require("dns");
const { desktopCapturer } = require("electron/main");

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
        title: "Bench-App",
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
                .then(async(cookies) => {
                    console.log(cookies[0]);
                    if (cookies.length > 0) {
                        try {
                            let decodetokendata = jwt_decode(cookies[0].value);
                            // console.log(decodetokendata);
                            let aa = await axios.post(
                                "http://125.99.241.230:8080/apps/createsystemip/", {
                                    systemip: defaultInterface ?
                                        defaultInterface[0].mac.toUpperCase() : os.arch() + "-" + os.userInfo().username,
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

    mainWindow.loadURL(benchurlG);

    mainWindow.setContentProtection(true);

    mainWindow.webContents.on("did-fail-load", () => {
        mainWindow.loadFile("index.html");
    });

    mainWindow.on("focus", () => {
        mainWindow.setContentProtection(true);

        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
            console.log("Focused window title:", focusedWindow.getTitle());
            focusedWindow.setContentProtection(true);

            checkInertnet.resolve("www.google.com", function(err) {
                if (err) {
                    mainWindow.loadFile("index.html"); // Load a local HTML file indicating offline status
                } else {
                    console.log("internet connectin is working");
                }
            });
        }
    });
    const mainMenuTemplate = [{
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
            submenu: [{
                    label: "Manager",
                    click: () => {
                        mainWindow.loadURL(benchurlG);
                    },
                },
                {
                    label: "Student",
                    click: async() => {
                        mainWindow.loadURL(benchurlL);
                    },
                },
            ],
        },
        {
            label: "Help",
            submenu: [{
                    label: "Check For Update",
                    click: async() => {
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

    ipcMain.on("send-data-to-main", async(event, data) => {
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

                    const getAppDetailsCommand = `
            pgrep -x -l ${dataofappnames.map((name) => `${name}`).join(" ")}
          `;
      exec(getAppDetailsCommand, (err, out, stdErr) => {
        if (err) {
          console.error(`Error getting process details: ${err.message}`);
          return;
        }
        if (stdErr) {
          console.error(`stderr: ${stdErr}`);
          return;
        }

        if (out) {
          const matchedApps = [];
          const regex = /^(\d+)\s+(.*)$/gm;
          let match;

          while ((match = regex.exec(out)) !== null) {
            const pid = match[1];
            const appName = match[2].trim();
            matchedApps.push({ pid, appName });
          }

          if (matchedApps.length > 0) {
            // Terminating the matched applications
            const pidsToKill = matchedApps.map((app) => app.pid).join(" ");
            const killCommand = `kill ${pidsToKill}`;
            exec(killCommand, (err, out, stdErr) => {
              if (err) {
                console.error(`Error killing processes: ${err.message}`);
                return;
              }
              if (stdErr) {
                console.error(`stderr: ${stdErr}`);
                return;
              }
              console.log("Processes terminated successfully.");
            });
          }
        }
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
    // autoUpdater.checkForUpdates();
    autoUpdater.checkForUpdates();

    autoUpdater.autoDownload = false;

    // autoUpdater.autoInstallOnAppQuit = true;
    await autoUpdater.on("update-available", async ({ files }) => {
      await autoUpdater.downloadUpdate();
    });

    await autoUpdater.on("update-downloaded", () => {
      dialog
        .showMessageBox(mainWindow, {
          type: "info",
          title: "Update Ready",
          defaultId: 0,
          message:
            "Update downloaded. It will be installed on restart. Restart now ?",
          buttons: ["Yes"],
        })
        .then((response) => {
          if (response.response === 0) {
            autoUpdater.quitAndInstall();
          } else {
            closeSecondaryWindow();
            app.quit();
          }
        })
        .catch((err) => {
          console.error("Error showing dialog:", err);
        });
    });

    await autoUpdater.on("update-not-available", () => {
      // Show a dialog when the current version is up-to-date
      console.log("update-not-available");

      dialog.showMessageBox({
        type: "info",
        title: "Up-to-date",
        message: "The current version is up-to-date",
      });
    });

    await autoUpdater.on("error", (message) => {
      console.error("There was a problem updating the application");
      console.error(message);

      dialog
        .showMessageBox(mainWindow, {
          type: "error",
          title: "error",
          message: `There was a problem with the application. Please contact this helpline number: 7338471266.`,
          // message: message.toString(),
        })
        .then((ress) => {
          if (ress.response == 0) {
            closeSecondaryWindow();
            app.quit();
          }
        })
        .catch((err) => {
          closeSecondaryWindow();
          app.quit();
        });
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      closeSecondaryWindow();
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
  app.on("will-finish-launching", () => {
    app.on(
      "NSApplicationDelegate.applicationSupportsSecureRestorableState",
      () => {
        return true;
      }
    );
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