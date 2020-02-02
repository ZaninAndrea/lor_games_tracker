import React, { Component } from "react"
import "./main.css"
import MatchResult from "./components/MatchResult"
import AddDeck from "./components/AddDeck"
import DeckSummary from "./components/DeckSummary"

const electron = window.require("electron") // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            updateReady: false,
            lorOpen: null,
            matches: [],
            deckMap: {},
            page: "matches",
        }

        ipcRenderer.send("requestUserData")
        ipcRenderer.on("userData", (event, matches) => {
            this.setState({ matches })
        })
        ipcRenderer.on("deckMap", (event, deckMap) => {
            this.setState({ deckMap })
        })
        ipcRenderer.on("lorOpen", (event, lorOpen) => {
            this.setState({ lorOpen })
        })
        ipcRenderer.on("newGame", (event, newGame) => {
            this.setState(({ matches }) => ({ matches: [newGame, ...matches] }))
        })
    }

    render() {
        let deckCodes = [
            ...new Set([
                ...Object.keys(this.state.deckMap),
                ...this.state.matches.map(match => match.deckCode),
            ]),
        ]

        return (
            <div className="main">
                {/* Games summary <b>{this.state.lorOpen ? "online" : "offline"}</b> */}
                <div className="header">
                    <div
                        className={
                            this.state.page === "matches" ? "active" : ""
                        }
                        onClick={() => this.setState({ page: "matches" })}
                    >
                        Matches
                    </div>
                    <div
                        className={this.state.page === "decks" ? "active" : ""}
                        onClick={() => this.setState({ page: "decks" })}
                    >
                        Decks
                    </div>
                </div>
                {this.state.page === "matches" && (
                    <div className="matches">
                        {this.state.matches.map(
                            ({
                                won,
                                timestamp,
                                deckCode,
                                gameDuration,
                                playerName,
                                opponentName,
                            }) => (
                                <MatchResult
                                    won={won}
                                    timestamp={timestamp}
                                    deckCode={deckCode}
                                    gameDuration={gameDuration}
                                    playerName={playerName}
                                    opponentName={opponentName}
                                    deckMap={this.state.deckMap}
                                />
                            )
                        )}
                    </div>
                )}
                {this.state.page === "decks" && (
                    <div className="decks">
                        {deckCodes.map(code => (
                            <DeckSummary
                                code={code}
                                matches={this.state.matches}
                                deckMap={this.state.deckMap}
                            />
                        ))}
                        <AddDeck />
                    </div>
                )}
            </div>
        )
    }
}

export default App
