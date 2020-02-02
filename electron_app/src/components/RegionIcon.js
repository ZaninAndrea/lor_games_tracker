import React, { Component } from "react"

import DemaciaIcon from "../img/regions/icon-demacia.png"
import FreljordIcon from "../img/regions/icon-freljord.png"
import IoniaIcon from "../img/regions/icon-ionia.png"
import NoxusIcon from "../img/regions/icon-noxus.png"
import PiltoverZaunIcon from "../img/regions/icon-piltoverzaun.png"
import ShadowIslesIcon from "../img/regions/icon-shadowisles.png"

function regionCodeToImage(code) {
    switch (code) {
        case "DE":
            return DemaciaIcon
        case "FR":
            return FreljordIcon
        case "IO":
            return IoniaIcon
        case "NX":
            return NoxusIcon
        case "PZ":
            return PiltoverZaunIcon
        case "SI":
            return ShadowIslesIcon
    }
}

export default ({ code }) => (
    <img src={regionCodeToImage(code)} className="regionIcon" />
)
