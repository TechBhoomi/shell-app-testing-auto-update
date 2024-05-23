const { exec } = require("child_process");
let { closeSecondaryWindow } = require("./secondwindow");
let axios = require("axios");
const os = require("os");
const fs = require("fs");

let ofappnames = [
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
            "http://125.99.241.230:8080/apps/getapps_name"
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
    const getAppDetailsCommand = `
  ps -A -o pid,command --no-headers | 
  awk 'IGNORECASE=1 { 
    cmd = ""; 
    for (i=2; i<=NF; i++) { 
      cmd = cmd $i " "; 
      if ($i ~ /${dataofappnames.join("|")}/) { 
        print $1,cmd; 
        break; 
      } 
    } 
  }' 
`;

    const { exec } = require("child_process");

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
            const appListMessage = dataofappnames
                .map((app, index) => {
                    if (out.toLowerCase().includes(app.toLowerCase())) {
                        return `${index + 1}) ${app} \n`;
                    }
                    return null;
                })
                .filter(Boolean)
                .join("");

            clearInterval(clearIntvPshell);
            mainWindow.webContents.setAudioMuted(true);
            mainWindow.loadFile("blank.html");
            mainWindow.show();
            mainWindow.focus();
            closeSecondaryWindow();

            mainWindow.webContents.on("did-finish-load", () => {
                mainWindow.webContents.send("data-to-renderer", appListMessage);
            });
        }
    });
}

function funWinRemoteDsktop(app, showErrorDialog) {
    let winRemoteDsktop = setInterval(() => {
        try {
            console.log("remote desktop checking");

            const output = exec("quser");
            // const lines = output.split('\n');
            // console.log('secandary window lines:', lines);

            output.stdout.on("data", (data) => {
                console.log("stdout", data);
                const lines = data.toString().split("\n");
                // Check for lines indicating RDP sessions
                const isRemoteSession = lines.some((line) =>
                    line.toLowerCase().includes("rdp-tcp")
                );

                if (isRemoteSession) {
                    console.log(
                        "Is Remote Desktop Connection--------------------------====>:",
                        isRemoteSession
                    );
                    clearInterval(winRemoteDsktop);
                    showErrorDialog(
                        "Detected Remote Desktop in your System Please Close it and run app"
                    );

                    // app.quit();
                }
                return;
            });

            output.stderr.on("data", (data) => {
                console.log("stderr", data);
                return;
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

                    const command = `powershell -Command "@(Get-CimInstance -Namespace ${String.raw`root\wmi`} -ClassName WmiMonitorBasicDisplayParams).Length"`;

      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing the command: ${error}`);
          return;
        }

        if (stderr) {
          console.error(`Error reported by command: ${stderr}`);
          return;
        }

        if (stdout > 1) {
          try {
            console.log(
              `Detected Multiple Displays in your System Please Close it and run app count, ${stdout.toString()}, --- ${typeof stdout}`
            );

            let { data } = await axios.get(
              "http://125.99.241.230:8080/apps/get_systemips"
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
            let findsystemip = data?.SystemIp.filter(
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
}

module.exports = {
  funWinRemoteDsktop,
  checkAndTerminateApps,
  dataofappnames,
};