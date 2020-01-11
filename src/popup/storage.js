import {sync} from "./sync.js";

export function setDiceChoices(diceChoices) {
    chrome.storage.sync.set({
        ["dice-choices"]: JSON.stringify(diceChoices)
    }, sync);
}

export function setUseSelectedDiceGlobally(value) {
    chrome.storage.sync.set({
        ["use-selected-dice-globally"]: value
    }, sync);
}

export function setUseDiceColorOverride() {
    chrome.storage.sync.set({
        ["use-dice-color-override"]: value
    }, sync);
}

export function setDiceOverrideColor(value) {
    chrome.storage.sync.set({
        ["dice-color-override"]: value
    }, sync);
}

export function setUseIndividualDice(value) {
    chrome.storage.sync.set({
        ["use-individual-dice"]: value
    }, sync);
}