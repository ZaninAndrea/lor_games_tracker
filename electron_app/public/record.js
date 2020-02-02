const fs = require("fs")
const userHome = require("user-home")
require("isomorphic-fetch")

const sleep = ms =>
    new Promise((resolve, reject) => setTimeout(() => resolve(true), ms))

const timeout = (promise, ms) =>
    new Promise((resolve, reject) => {
        let done = false
        promise
            .then(res => {
                if (!done) {
                    resolve([res, false])
                    done = true
                }
            })
            .catch(() => {
                if (!done) {
                    resolve([null, true])
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

async function recordGames(newGameCallback, lorOpenCallback) {
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
            lorOpenCallback(false)
            await sleep(5000)
            continue
        }
        lorOpenCallback(true)

        if (!notInGame) {
            deckCode = activeDeck.DeckCode
            gameStartDate = gameStartDate === null ? new Date() : gameStartDate
        }

        if (previousGameID === null) previousGameID = gameResult.GameID
        if (gameResult.GameID !== previousGameID) {
            previousGameID = gameResult.GameID
            const gameDuration = Math.floor((new Date() - gameStartDate) / 1000)
            const newGame = {
                won: gameResult.LocalPlayerWon,
                timestamp: +new Date(),
                deckCode,
                gameDuration,
                playerName: gameWindowsStatus.PlayerName,
                opponentName: gameWindowsStatus.OpponentName,
            }
            fs.appendFileSync(
                GAMES_LOG,
                `${newGame.won},${newGame.timestamp},${newGame.deckCode},${newGame.gameDuration},${newGame.playerName},${newGame.opponentName}\n`
            )
            newGameCallback(newGame)
            gameStartDate = null
        }
        await sleep(1000)
    }
}

module.exports = {
    recordGames,
}
