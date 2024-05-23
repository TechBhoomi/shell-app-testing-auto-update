# compiler-bench-tf
{
  "name": "qspiders-training-app",
  "version": "1.0.5",
  "description": "Qspiders - training app",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "electron .",
    "dist": "electron-builder",
    "publish": "electron-builder --publish always"
  },
  "build": {
    "appId": "com.qspiders-training-app.autoupdater",
    "productName": "Qspiders-Training-App",
    "compression": "maximum",
    "publish": [
      {
        "provider": "github",
        "repo": "Bench-Shell",
        "owner": "TechBhoomi",
        "token": ""
      }
    ],
    "win": {
      "target": "nsis",
      "icon": "/assests/icon.png"
    },
    "directories": {
      "output": "dist"
    },
    "nsis": {
      "oneClick": false,
      "perMachine": false,
      "allowElevation": true,
      "allowToChangeInstallationDirectory": true,
      "deleteAppDataOnUninstall": true,
      "displayLanguageSelector": false,
      "packElevateHelper": true,
      "unicode": true,
      "shortcutName": "Bench-app",
      "warningsAsErrors": true,
      "runAfterFinish": true,
      "createDesktopShortcut": "always",
      "createStartMenuShortcut": true,
      "menuCategory": false
    }
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/TechBhoomi/Bench-Shell.git"
  },
  "keywords": [],
  "author": "Qspiders",
  "license": "ISC",
  "devDependencies": {
    "electron": "^28.1.1",
    "electron-builder": "^24.9.1"
  },
  "dependencies": {
    "axios": "^1.6.4",
    "dotenv": "^16.3.1",
    "electron-builder-squirrel-windows": "^24.11.0",
    "electron-log": "^5.0.1",
    "electron-updater": "^6.1.8",
    "jsonwebtoken": "^9.0.2",
    "react-icons": "^5.0.1"
  }
}

--------------------------------
{
  "name": "qspiders-training-app",
  "productName": "Qspiders-training-app",
  "version": "1.0.5",
  "description": "Qspiders - training app",
  "main": "main.js",
  "scripts": {
    "start": "electron-forge start",
    "package": "electron-forge package",
    "make": "electron-forge make",
    "publish": "electron-forge publish",
    "lint": "echo \"No linting configured\""
  },
  "keywords": [
    "QSpiders",
    "JSpiders",
    "PySpiders",
    "desktop",
    "application",
    "classes"
  ],
  "author": {
    "name": "Qspiders",
    "email": "techbhoomi@qspiders.com"
  },
  "license": "MIT",
  "dependencies": {
    "axios": "^1.6.7",
    "electron-log": "^5.0.3",
    "electron-squirrel-startup": "^1.0.0",
    "jsonwebtoken": "^9.0.2",
    "jwt-decode": "^3.1.2"
  },
  "devDependencies": {
    "@electron-forge/cli": "^7.2.0",
    "@electron-forge/maker-deb": "^7.2.0",
    "@electron-forge/maker-dmg": "^7.3.0",
    "@electron-forge/maker-rpm": "^7.2.0",
    "@electron-forge/maker-squirrel": "^7.2.0",
    "@electron-forge/maker-zip": "^7.2.0",
    "@electron-forge/plugin-auto-unpack-natives": "^7.2.0",
    "@electron-forge/publisher-electron-release-server": "^7.2.0",
    "electron": "28.1.2"
  },
  "config": {
    "forge": {
      "packagerConfig": {
        "asar": true,
        "icon": "./assets/icon.ico"
      },
      "makers": [
        {
          "name": "@electron-forge/maker-squirrel",
          "config": {
            "name": "Qspiders-training",
            "iconUrl": "https://api.qspiders.com/media/icon.ico",
            "setupIcon": "./assets/icon.ico"
          }
        },
        {
          "name": "@electron-forge/maker-zip",
          "platforms": [
            "darwin"
          ],
          "config": {
            "options": {
              "icon": "./assets/logo.png"
            }
          }
        },
        {
          "name": "@electron-forge/maker-deb",
          "config": {
            "options": {
              "icon": "./assets/logo.png"
            }
          }
        },
        {
          "name": "@electron-forge/maker-dmg",
          "config": {
            "icon": "./assets/icon.icns"
          }
        },
        {
          "name": "@electron-forge/maker-rpm",
          "config": {}
        }
      ],
      "plugins": [
        {
          "name": "@electron-forge/plugin-auto-unpack-natives",
          "config": {}
        }
      ],
      "publishers": [
        {
          "name": "@electron-forge/publisher-electron-release-server",
          "config": {
            "baseUrl": "https://techelectron.qspiders.com",
            "username": "admin",
            "password": "admin@qspiders123"
          }
        }
      ]
    }
  }
}
