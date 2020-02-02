import React, { Component } from "react"
import "./main.css"
import MatchResult from "./components/MatchResult"

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
        return (
            <div>
                Games summary <b>{this.state.lorOpen ? "online" : "offline"}</b>
                <br />
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
        )
    }
}

export default App
