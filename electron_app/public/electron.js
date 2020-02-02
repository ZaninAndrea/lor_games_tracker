const { app, BrowserWindow, ipcMain, Menu, Tray } = require("electron")
const path = require("path")
const isDev = require("electron-is-dev")
const { getData, getDeckMap } = require("./data.js")
const { recordGames } = require("./record.js")
const AutoLaunch = require("auto-launch")
const { autoUpdater } = require("electron-updater")

if (!isDev) {
    var autoLauncher = new AutoLaunch({
        name: "Legends of Runeterra Game Tracker",
    })

    autoLauncher.enable()
}

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
    )
    mainWindow.on("closed", e => {
        mainWindow = null
    })

    if (!isDev) {
        mainWindow.setMenuBarVisibility(false)
    }
}

let tray = null
let shouldUpdate = false
app.on("ready", function() {
    tray = new Tray(path.join(__dirname, "./icon.ico"))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "exit",
            click: () =>
                shouldUpdate ? autoUpdater.quitAndInstall() : app.quit(),
        },
    ])
    tray.setToolTip("Legends of Runeterra Game Tracker")
    tray.setContextMenu(contextMenu)
    tray.on("click", () => {
        if (!mainWindow) createWindow()
    })

    // createWindow()
    if (!isDev) autoUpdater.checkForUpdates()
})

app.on("window-all-closed", () => {
    // catch the event to override the default behaviour
    // of closing the app
})

function onNewGame(newGame) {
    if (mainWindow) {
        mainWindow.webContents.send("newGame", newGame)
    }
}
function onLorOpenChange(lorOpen) {
    if (mainWindow) {
        mainWindow.webContents.send("lorOpen", lorOpen)
    }
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
