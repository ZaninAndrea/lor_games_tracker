const fs = require("fs")
const userHome = require("user-home")
require("isomorphic-fetch")

const sleep = ms =>
    new Promise((resolve, reject) => setTimeout(() => resolve(true), ms))

const timeout = (promise, ms) =>
    new Promise((resolve, reject) => {
        let done = false
        promise.then(res => {
            if (!done) {
                resolve([res, false])
                done = true
            }
        })
        sleep(ms).then(() => {
            if (!done) {
                resolve([null, true])
                done = true
            }
        })
    })

let deckCode = null
let previousGameID = null
const GAMES_LOG = userHome + "/lorgameslog.csv"
let gameStartDate = null

if (!fs.existsSync(GAMES_LOG)) {
    fs.writeFileSync(
        GAMES_LOG,
        "won,timestamp,deckCode,gameDuration,playerName,opponentName\n"
    )
}

async function main() {
    while (true) {
        const [activeDeck, notInGame] = await timeout(
            fetch("http://localhost:21337/static-decklist").then(res =>
                res.json()
            ),
            1000
        )
        const [gameResult, lorClosed] = await timeout(
            fetch("http://localhost:21337/game-result").then(res => res.json()),
            1000
        )
        const [gameWindowsStatus, _] = await timeout(
            fetch("http://localhost:21337/positional-rectangles").then(res =>
                res.json()
            ),
            1000
        )

        if (lorClosed) {
            await sleep(5000)
            yield
        }

        if (!notInGame) {
            deckCode = activeDeck.DeckCode
            gameStartDate = gameStartDate === null ? new Date() : gameStartDate
        }

        if (previousGameID === null) previousGameID = gameResult.GameID
        if (gameResult.GameID !== previousGameID) {
            previousGameID = gameResult.GameID
            const gameDuration = Math.floor((new Date() - gameStartDate) / 1000)
            fs.appendFileSync(
                GAMES_LOG,
                `${
                    gameResult.LocalPlayerWon
                },${+new Date()},${deckCode},${gameDuration},${
                    gameWindowsStatus.PlayerName
                },${gameWindowsStatus.OpponentName}\n`
            )
            gameStartDate = null
        }
        await sleep(1000)
    }
}

main()
    .then(() => console.log("Clean shutdown"))
    .catch(e => console.log(e))
