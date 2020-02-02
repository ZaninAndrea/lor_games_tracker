import React from "react"
import { DeckEncoder } from "./runeterra/index.js"
import RegionIcon from "./RegionIcon"

const electron = window.require("electron")
const clipboard = electron.clipboard

function deckCodeToName(code, deckMap) {
    return deckMap[code] || code.slice(0, 5) + "..." + code.slice(-5)
}

export default class DeckSummary extends React.Component {
    state = {
        justCopied: false,
    }

    copyCode = () => {
        clipboard.writeText(this.props.code)

        this.setState({ justCopied: true })
        setTimeout(() => this.setState({ justCopied: false }), 3000)
    }

    render() {
        const { code, matches, deckMap } = this.props
        const deck = DeckEncoder.decode(code)
        const factions = [...new Set(deck.map(card => card.faction.shortCode))]
        const winrate = matches.filter(match => match.deckCode === code)
        const wins = winrate.filter(match => match.won).length
        const losses = winrate.filter(match => !match.won).length

        return (
            <div className="deckSummary" onClick={this.copyCode}>
                <div className="deckSummary-factions">
                    {factions.map(code => (
                        <RegionIcon code={code} />
                    ))}
                </div>
                <div
                    className="deckSummary-deckName"
                    contentEditable={true}
                    onInput={e => console.log(e.target.value)}
                >
                    {deckCodeToName(code, deckMap)}
                </div>
                <div className="deckSummary-copy">
                    {this.state.justCopied
                        ? "copied to clipboard"
                        : "click to copy deck code"}
                </div>
                <div className="deckSummary-winrate">
                    {Math.round((wins / (wins + losses)) * 100)}% ({wins}/
                    {wins + losses})
                </div>
            </div>
        )
    }
}
