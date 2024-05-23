const { exec } = require("child_process");
let { closeSecondaryWindow } = require("./secondwindow");
let axios = require("axios");
const os = require("os");
const fs = require("fs");

let ofappnames = [
  "Safari Google",
  "QuickTime Player",
  "screencaptureui",
  "ScreenRecording",
  "RDP Clipboard Monitor",
  "rdpclip",
  "ApowerREC",
  "IceCream Screen Recorder",
  "Camtasia 2023",
  "ShareX",
  "Aqua Demo",
  "Movavi Screen Recorder",
  "Wondershare UniConverter",
  "Wondershare Filmora",
  "OBS Studio",
  "Loom",
  "Bandicam",
  "Free Cam",
  "Vidmore",
  "FonePaw screen recorder",
  "Eassiy",
  "Snagit",
  "Zight",
  "Wistia",
  "Descript",
  "Vmaker",
  "Slack",
  "Anydesk",
  "Chrome remote desktop",
  "G-Meet",
  "Zoom",
  "Skype",
  "Team viewer",
  "Webex",
  "ScreenCastify",
  "Awesome ChatGPT Screenshot and Screenrecorder",
  "Amazing Screen Recorder",
  "Scrnli Screen Recorder and Screen Capture app",
  "Chrome Remote Desktop",
  "Screen Recorder for Google Chrome",
  "ApowerMirror",
  "AirDroid",
];

let dataofappnames;

async function downloadfile() {
  try {
    let { data } = await axios.get(
      "https://electrondata.qspiders.com/apps/getapps_name"
    );

    let serverapps = data ? (data.Appname.length > 0 ? data.Appname : []) : [];

    let combine = ofappnames.concat(serverapps.map((x) => x.appname));
    dataofappnames = [...new Set(combine)];
  } catch (error) {
    // console.log(error);
    dataofappnames = ofappnames;
  }
}
downloadfile();

async function checkAndTerminateApps(mainWindow, clearIntvPshell) {
  mainWindow.setContentProtection(true);
  // ps - ax - o comm | tail - n + 2 | xargs - n 1 basename
  // ps aux | grep screencapture | grep - v grep   (screencapture)

  const getAppDetailsCommand = `
  pgrep -x -l ${dataofappnames.map((name) => `"${name}"`).join(" ")}
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

    console.log(`Details of Processes:\n${out}`);

    if (out) {
      const matchedApps = [];
      const regex = /^(\d+)\s+(.*)$/gm;
      let match;

      while ((match = regex.exec(out)) !== null) {
        const pid = match[1];
        const appName = match[2].trim();
        matchedApps.push({ pid, appName });
      }

      console.log(
        `Matched Applications: ${matchedApps
          .map((app) => app.appName)
          .join(", ")}`
      );

      if (matchedApps.length > 0) {
        clearInterval(clearIntvPshell);
        mainWindow.webContents.setAudioMuted(true);
        mainWindow.loadFile("blank.html");
        mainWindow.show();
        mainWindow.focus();
        closeSecondaryWindow();

        mainWindow.webContents.on("did-finish-load", () => {
          mainWindow.webContents.send(
            "data-to-renderer",
            matchedApps.map((app) => app.appName)
          );
        });
      }
    }
  });
}

function funWinRemoteDsktop(app, showErrorDialog) {
  let winRemoteDsktop = setInterval(() => {
    try {
      console.log("Remote desktop checking");

      exec("netstat -an | grep 5900", (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing command:", error);
          return;
        }

        if (stderr) {
          console.error("Standard error output:", stderr);
          return;
        }

        const lines = stdout.split("\n");

        // Check for any line indicating an ESTABLISHED connection on port 5900
        const isEstablished = lines.some((line) =>
          line.includes("ESTABLISHED")
        );

        if (isEstablished) {
          console.log(
            "Is Remote Desktop Connection--------------------------====>:",
            isEstablished
          );
          clearInterval(winRemoteDsktop);
          showErrorDialog(
            "Detected Remote Desktop in your System. Please close it and run the app."
          );

          // app.quit();
        }
      });
    } catch (error) {
      console.error("Error detecting Remote Desktop:", error);
      // mainWindow.webContents.send('remote-desktop-error', error.message);
    }
  }, 10000);

  let DualDsktop = setInterval(() => {
    try {
      // const command = 'Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorBasicDisplayParams | Measure-Object | Select-Object -ExpandProperty Count';

      // @(Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorBasicDisplayParams).Length
      console.log("dual screen  checking");

      const command = "system_profiler SPDisplaysDataType | grep Resolution";

      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing the command: ${error}`);
          return;
        }

        if (stderr) {
          console.error(`Error reported by command: ${stderr}`);
          return;
        }
        const displayCount = stdout.trim().split("\n").length;

        if (displayCount > 1) {
          try {
            // console.log(
            //   `Detected Multiple Displays in your System Please Close it and run app count, ${stdout.toString()}, --- ${typeof stdout}`
            // );

            let { data } = await axios.get(
              "https://electrondata.qspiders.com/apps/get_systemips"
            );
            const networkInterfaces = os.networkInterfaces();
            const defaultInterface =
              networkInterfaces["Ethernet"] ||
              networkInterfaces["Wi-Fi"] ||
              networkInterfaces["eth0"] ||
              null;
            let deviceId = defaultInterface
              ? defaultInterface[0].mac.toUpperCase()
              : os.arch() + "-" + os.userInfo().username;
            let findsystemip = data.SystemIp.filter(
              (x) => x.systemip == deviceId
            )[0];

            if (findsystemip ? findsystemip.permission : false) {
              console.log(`stdout: ${stdout} , ${findsystemip}`);
              clearInterval(DualDsktop);
              return;
            } else {
              clearInterval(DualDsktop);
              showErrorDialog(
                "Detected Multiple Displays in your System, Please Close it and run app"
              );
            }

            clearInterval(DualDsktop);
            showErrorDialog(
              "Detected Multiple Displays in your System, Please Close it and run app"
            );
          } catch (error) {
            console.log(error);
            clearInterval(DualDsktop);
            showErrorDialog(
              "Something error in fetching apis in your System , Please Close it and run app"
            );
          }
        }
      });
    } catch (error) {
      console.error("Error detecting Remote Desktop:", error);
      // mainWindow.webContents.send('remote-desktop-error', error.message);
    }
  }, 10000);

  let screen_inmac = setInterval(() => {
    try {
      console.log(" screencapture in mac checking");

      const command = "ps aux | grep screencapture | grep -v grep";

      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing the command: ${error}`);
          return;
        }

        if (stderr) {
          console.error(`Error reported by command: ${stderr}`);
          return;
        }
        const displayCount = stdout.trim().split("\n").length;

        if (displayCount > 1) {
          try {
            console.log(
              `Detected screen capture in your System Please Close it and run app count, ${stdout.toString()}, --- ${typeof stdout}`
            );

            clearInterval(screen_inmac);
            showErrorDialog(
              "Detected ScreenCapture in your System, Please Close it and run app"
            );
          } catch (error) {
            console.log(error);
            clearInterval(screen_inmac);
            showErrorDialog(
              "Something error in fetching apis in your System screencapture , Please Close it and run app"
            );
          }
        }
      });
    } catch (error) {
      console.error("Error detecting Remote Desktop:", error);
      // mainWindow.webContents.send('remote-desktop-error', error.message);
    }
  }, 10000);

  //   let browser_tabCheck = setInterval(() => {
  //     try {
  //       console.log(" browser_tab Check in mac checking");

  //       const command = `cat ~/Library/Application\\ Support/Google/Chrome/Default/History | sqlite3 -separator ' ' -list | grep 'http' | awk '{print $1}'`;

  // exec(command, async (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing the command: ${error.message}`);
  //     return;
  //   }

  //   if (stderr) {
  //     console.error(`Error reported by command: ${stderr}`);
  //     return;
  //   }

  //   const urls = stdout.trim().split('\n');
  //   console.log(urls);
  // });

  //     } catch (error) {
  //       console.error("Error detecting Remote Desktop:", error);
  //       // mainWindow.webContents.send('remote-desktop-error', error.message);
  //     }
  //   }, 10000);
}

module.exports = {
  funWinRemoteDsktop,
  checkAndTerminateApps,
  dataofappnames: dataofappnames ? dataofappnames : ofappnames,
};
