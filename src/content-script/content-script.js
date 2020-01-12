import MessageTypes from "../shared/message-types.js";
import {hookAndInsertScripts, injectScript} from "./hooking.js";
import {useMessageHandlers} from "../shared/handle-messages.js";
import {
    selectCampaignToUseGlobally,
    selectDiceChoices,
    selectDiceOverrideColor,
    selectUseDiceColorOverride
} from "../shared/storage.js";

let backgroundPort;
let popupPort;
let roll20Ready = false;
let campaignInfo = {
    title: null,
    id: null,
};
let playerId;

function main() {
    if (window.fancyDice == null) {
        window.fancyDice = {};
    }
    setupBackgroundConnection();
    setupPopupConnection();
    waitForDomReady(domReady);
    setupStorageListener();
}

function setupBackgroundConnection() {
    backgroundPort = chrome.runtime.connect(fancyDice.extensionId);
    backgroundPort.onMessage.addListener(useMessageHandlers(backgroundPort, {
        [MessageTypes.SCRIPTS_TO_INJECT]: handleScriptsToInject,
        [MessageTypes.CAMPAIGN_ID]: handleCampaignId,
        [MessageTypes.ROLL20_READY]: handleRoll20Ready,
        [MessageTypes.PLAYER_ID]: handlePlayerId,
        [MessageTypes.GET_DICE_SETTINGS]: handleGetDiceSettings,
    }));
}

function setupPopupConnection() {
    chrome.runtime.onConnect.addListener((port) => {
        popupPort = port;
        popupPort.onDisconnect.addListener(() => {
            popupPort = null;
        });
        popupPort.onMessage.addListener(useMessageHandlers(popupPort, {
            [MessageTypes.GET_ROLL20_READY]: handleGetRoll20Ready,
            [MessageTypes.GET_CAMPAIGN_INFO]: handleGetCampaignInfo,
        }));
    });
}

function setupStorageListener() {
    chrome.storage.onChanged.addListener(() => {
        sendDiceSettings(backgroundPort);
    });
}

async function syncDiceSettings(diceSettings) {
    // TODO: WS
}

/**
 * Wait for the DOM to be ready to be modified.
 */
function waitForDomReady(callback) {
    const interval = setInterval(() => {
        if (document.readyState === "complete") {
            clearInterval(interval);
            callback();
        }
    }, 100);
}

/**
 * Notify the background thread that the DOM is ready to be modified.
 */
function domReady() {
    backgroundPort.postMessage({
        type: MessageTypes.DOM_READY
    });
    campaignInfo.title = getCampaignTitle();
}

/**
 * Handle new list of scripts have been intercepted.
 */
async function handleScriptsToInject(message, port) {
    await hookAndInsertScripts(message.scriptUrls);
    injectScript("post-injection.js");
}

function handleGetDiceSettings(message, port) {
    sendDiceSettings(port);
}

function sendDiceSettings(port) {
    chrome.storage.sync.get(null, async (data) => {
        const campaignToUseGlobally = selectCampaignToUseGlobally(data);
        const campaignToUse = campaignToUseGlobally || campaignInfo.id;
        let diceChoices = selectDiceChoices(data, campaignToUse);
        const useDiceColorOverride = selectUseDiceColorOverride(data, campaignToUse);
        const diceOverrideColor = selectDiceOverrideColor(data, campaignToUse);
        if (diceChoices != null) {
            diceChoices = JSON.parse(diceChoices);
        }
        const diceSettings = {
            [playerId]: {
                diceChoices,
                useDiceColorOverride,
                diceOverrideColor
            }
        };
        await syncDiceSettings(diceSettings);
        port.postMessage({
            type: MessageTypes.DICE_SETTINGS,
            diceSettings,
        });
    });
}

function handleCampaignId(message, port) {
    campaignInfo.id = message.campaignId;
}

function handleRoll20Ready(message, port) {
    roll20Ready = true;
    if (popupPort != null) {
        popupPort.postMessage(message);
    }
}

function handleGetCampaignInfo(message, port) {
    port.postMessage({
        type: MessageTypes.CAMPAIGN_INFO,
        campaignInfo,
    });
}

function handleGetRoll20Ready(message, port) {
    port.postMessage({
        type: MessageTypes.ROLL20_READY,
        roll20Ready,
    });
}

function handlePlayerId(message, port) {
    playerId = message.playerId;
}

function getCampaignTitle() {
    const titleElement = document.querySelector("title");
    const title = titleElement.textContent;
    const campaignTitle = title.split("|")[0];
    return campaignTitle.trim();
}

main();