import React, { Component } from "react"

const electron = window.require("electron") // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer

function secondsToString(seconds) {
    var numminutes = Math.floor(seconds / 60)
    var numseconds = seconds % 60

    return numminutes + "m " + numseconds + "s"
}

function deckCodeToName(code, deckMap) {
    return deckMap[code] || code.slice(0, 5) + "..." + code.slice(-5)
}

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
                Games summary {this.state.lorOpen ? "online" : "offline"}
                <br />
                <table>
                    <tr>
                        <th>Result</th>
                        <th>Opponent</th>
                        <th>Deck</th>
                        <th>Duration</th>
                    </tr>
                    {this.state.matches.map(
                        ({
                            won,
                            timestamp,
                            deckCode,
                            gameDuration,
                            playerName,
                            opponentName,
                        }) => (
                            <tr>
                                <td>{won ? "win" : "lose"}</td>
                                <td>{opponentName}</td>
                                <td>
                                    {deckCodeToName(
                                        deckCode,
                                        this.state.deckMap
                                    )}
                                </td>
                                <td>{secondsToString(gameDuration)}</td>
                            </tr>
                        )
                    )}
                </table>
            </div>
        )
    }
}

export default App
