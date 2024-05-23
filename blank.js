const { ipcRenderer } = require("electron");

// Handle receiving data from the main process
ipcRenderer.on("data-to-renderer", (event, data) => {
  console.log("Data received in renderer process:", data);
  // Do something with the data received from the main process

  let htmlString = "<ul>";
  data.forEach((item) => {
    htmlString += `<li>${item}</li>`;
  });
  htmlString += "</ul>";

  document.getElementById("data-display").innerHTML = htmlString;

  // Optionally send data back to the main process
  ipcRenderer.send("renderer-to-main", "Data received in renderer");
});

ipcRenderer.on("data-to-render_errMesg", (event, data) => {
  console.log("Data received in renderer process:", data);
  // Do something with the data received from the main process

  let htmlString = `<h1>${data}</h1>`;

  document.getElementById("data-display").innerHTML = htmlString;

  // Optionally send data back to the main process
  ipcRenderer.send("send-data-errmsg", "Data received to errmsg in renderer");
});

let yesbutton = document.getElementById("buttonYes");
let nobutton = document.getElementById("buttonNo");
let Okbuttoun = document.getElementById("button");

yesbutton
  ? yesbutton.addEventListener("click", () => {
      console.log("ipcRenderer.send('renderer-to-main', 'yes');");
      ipcRenderer.send("send-data-to-main", "yes");
    })
  : null;

nobutton
  ? nobutton.addEventListener("click", () => {
      console.log("ipcRenderer.send('renderer-to-main', 'no');");

      ipcRenderer.send("send-data-to-main", "no");
    })
  : null;

Okbuttoun
  ? Okbuttoun.addEventListener("click", () => {
      console.log("ipcRenderer.send('renderer-to-main', 'YES');");

      ipcRenderer.send("send-data-errmsg", "YES");
    })
  : null;
