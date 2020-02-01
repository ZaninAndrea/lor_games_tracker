const { DeckEncoder } = require("runeterra")
const fs = require("fs")
const userHome = require("user-home")

function deckToFactions(deckCode) {
    const deck = DeckEncoder.decode(deckCode)
    const factions = [...new Set(deck.map(card => card.faction.shortCode))]

    return factions
}
function secondsToString(seconds) {
    var numminutes = Math.floor(seconds / 60)
    var numseconds = seconds % 60

    return numminutes + " minutes and " + numseconds + " seconds"
}

const GAMES_LOG = userHome + "/lorgameslog.csv"
const data = fs.readFileSync(GAMES_LOG, "utf8")
const lines = data.split("\n").slice(1, -1)

const matches = lines.map(line => {
    const [
        won,
        timestamp,
        deckCode,
        gameDuration,
        playerName,
        opponentName,
    ] = line.split(",")

    return {
        won: won === "true",
        timestamp: parseInt(timestamp),
        deckCode,
        gameDuration: parseInt(gameDuration),
        playerName,
        opponentName,
    }
})

let deckBasedAggregates = matches.reduce((acc, curr) => {
    if (!acc[curr.deckCode])
        acc[curr.deckCode] = {
            code: curr.deckCode,
            wins: 0,
            losses: 0,
            gameDurations: [],
        }

    if (curr.won) acc[curr.deckCode].wins += 1
    else acc[curr.deckCode].losses += 1

    acc[curr.deckCode].gameDurations.push(curr.gameDuration)

    return acc
}, {})

deckBasedAggregates = Object.values(deckBasedAggregates).map(
    ({ code, wins, losses, gameDurations }) => ({
        code,
        "average winrate": Math.floor((wins / (wins + losses)) * 10000) / 100,
        "average game duration": secondsToString(
            Math.floor(
                gameDurations.reduce((a, b) => a + b, 0) / gameDurations.length
            )
        ),
        factions: deckToFactions(code),
    })
)

console.table(deckBasedAggregates)
