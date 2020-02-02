import React, { Component } from "react"
import RegionIcon from "./RegionIcon"
import { DeckEncoder } from "./runeterra/index.js"
import cardDatabase from "../cardDatabase"
import TimeAgo from "timeago-react"

function secondsToString(seconds) {
    var numminutes = Math.ceil(seconds / 60)

    return numminutes + " mins"
}

function deckCodeToName(code, deckMap) {
    return deckMap[code] || code.slice(0, 5) + "..." + code.slice(-5)
}

export default ({
    won,
    timestamp,
    deckCode,
    gameDuration,
    playerName,
    opponentName,
    deckMap,
}) => {
    const deck = DeckEncoder.decode(deckCode)
    const factions = [...new Set(deck.map(card => card.faction.shortCode))]
    const champions = deck
        .map(card => cardDatabase[card.code])
        .filter(card => card.supertype === "Champion")

    const costs = deck
        .map(card => ({ ...cardDatabase[card.code], count: card.count }))
        .reduce(
            (acc, curr) => {
                if (curr.cost < 7) {
                    if (!acc[curr.cost.toString()]) {
                        acc[curr.cost.toString()] = curr.count
                    } else {
                        acc[curr.cost.toString()] += curr.count
                    }
                } else {
                    if (!acc["7+"]) {
                        acc["7+"] = curr.count
                    } else {
                        acc["7+"] += curr.count
                    }
                }

                return acc
            },
            { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7+": 0 }
        )

    return (
        <div className={won ? "gameResult gameWon" : "gameResult gameLost"}>
            <div className="gameResult-header">
                <div className="gameResult-players">
                    {playerName} vs {opponentName}
                </div>
                <div className="gameResult-duration">
                    {secondsToString(gameDuration)}
                </div>
            </div>
            <div className="gameResult-body">
                <div className="gameResult-factions">
                    {factions.map(code => (
                        <RegionIcon code={code} />
                    ))}
                </div>
                <div className="gameResult-deckName">
                    {deckCodeToName(deckCode, deckMap)}
                </div>
                <div className="gameResult-timeago">
                    <TimeAgo datetime={new Date(timestamp)} />
                </div>
            </div>
        </div>
    )
}
