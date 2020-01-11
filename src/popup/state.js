let state = {
    currentDiceTypeToSelect: null,
    diceChoices: {},
    campaignInfo: null,
    roll20Ready: false,
};

export function setState(updates) {
    state = {
        ...state,
        ...updates
    }
}

export function getState() {
    return state;
}