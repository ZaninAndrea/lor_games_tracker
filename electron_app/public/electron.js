const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const isDev = require("electron-is-dev")
const { getData, getDeckMap } = require("./data.js")
const { recordGames } = require("./record.js")

const { autoUpdater } = require("electron-updater")

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
        },
    })
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    ) // load the react app
    mainWindow.on("closed", () => (mainWindow = null))
}

// when the app is loaded create a BrowserWindow and check for updates
app.on("ready", function() {
    createWindow()
    if (!isDev) autoUpdater.checkForUpdates()
})

let shouldUpdate = false
// on MacOS leave process running also with no windows
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        if (!shouldUpdate) {
            app.quit()
        } else {
            autoUpdater.quitAndInstall()
        }
    }
})

// if there are no windows create one
app.on("activate", () => {
    if (mainWindow === null) {
        createWindow()
    }
})

function onNewGame(newGame) {
    mainWindow.webContents.send("newGame", newGame)
}
function onLorOpenChange(lorOpen) {
    mainWindow.webContents.send("lorOpen", lorOpen)
}

recordGames(onNewGame, onLorOpenChange).catch(e => {
    console.log("Game record crashed")
    console.log(e)
})

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
autoUpdater.on("update-downloaded", info => {
    mainWindow.webContents.send("updateReady")
})

ipcMain.on("requestUserData", (event, arg) => {
    mainWindow.webContents.send("userData", getData())
    mainWindow.webContents.send("deckMap", getDeckMap())
})

ipcMain.on("quitAndInstall", (event, arg) => {
    shouldUpdate = true
})
