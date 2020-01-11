let state = {
    currentDiceTypeToSelect: null,
    diceChoices: {},
    campaignInfo: null,
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