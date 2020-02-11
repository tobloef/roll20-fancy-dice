import {getState} from "../popup/state.js";
import DiceTypes from "./dice-types.js";

function keyWithCampaignPrefix(key, campaignId) {
    if (campaignId == null) {
        const {campaignInfo} = getState();
        if (campaignInfo == null) {
            return key;
        }
        campaignId = campaignInfo.id;
    }
    if (campaignId == null) {
        return key;
    }
    return `${campaignId}-${key}`;
}

export function setDiceChoices(diceChoices) {
    chrome.storage.sync.set({
        [keyWithCampaignPrefix("dice-choices")]: JSON.stringify(diceChoices)
    });
}


export function selectDiceChoices(data, campaignToUse) {
    return data[keyWithCampaignPrefix("dice-choices", campaignToUse)];
}

export function setCampaignToUseGlobally(value) {
    chrome.storage.sync.set({
        ["campaign-to-use-globally"]: value
    });
}

export function selectCampaignToUseGlobally(data) {
    return data["campaign-to-use-globally"];
}

export function setUseDiceColorOverride(value) {
    chrome.storage.sync.set({
        [keyWithCampaignPrefix("use-dice-color-override")]: value
    });
}

export function selectUseDiceColorOverride(data, campaignToUse) {
    return data[keyWithCampaignPrefix("use-dice-color-override", campaignToUse)];
}

export function setDiceOverrideColor(value, diceType) {
    chrome.storage.sync.set({
        [keyWithCampaignPrefix(`dice-color-override-${diceType}`)]: value
    });
}

export function selectDiceOverrideColor(data, campaignToUse, diceType) {
    return data[keyWithCampaignPrefix(`dice-color-override-${diceType}`, campaignToUse)];
}

export function setUseIndividualDice(value) {
    chrome.storage.sync.set({
        [keyWithCampaignPrefix("use-individual-dice")]: value
    });
}

export function selectUseIndividualDice(data, campaignToUse) {
    return data[keyWithCampaignPrefix("use-individual-dice", campaignToUse)];
}