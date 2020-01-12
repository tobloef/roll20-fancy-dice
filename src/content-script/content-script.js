import MessageTypes from "../shared/message-types.js";
import {hookAndInsertScripts, injectScript} from "./hooking.js";
import {useMessageHandlers} from "../shared/handle-messages.js";
import {
    selectCampaignToUseGlobally,
    selectDiceChoices,
    selectDiceOverrideColor,
    selectUseDiceColorOverride
} from "../shared/storage.js";
import {
    connect,
    registerDiceSettingsHandler,
    registerReconnectedHandler,
    syncDiceSettings
} from "./backend-connection.js";
import logger from "../shared/logger.js";

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
        port.postMessage({
            type: MessageTypes.DICE_SETTINGS,
            diceSettings,
        });
        try {
            await syncDiceSettings(playerId, campaignInfo.id, diceSettings);
        } catch (error) {
            logger.error("Error sending dice settings to server.", error);
        }
    });
}

function handleCampaignId(message, port) {
    campaignInfo.id = message.campaignId;
}

async function handleRoll20Ready(message, port) {
    roll20Ready = true;
    if (popupPort != null) {
        popupPort.postMessage(message);
    }
    try {
        await connect(playerId, campaignInfo.id);
    } catch (error) {
        logger.error("Error connecting to server.", error);
    }
    registerDiceSettingsHandler((diceSettings) => {
        backgroundPort.postMessage({
            type: MessageTypes.DICE_SETTINGS,
            diceSettings,
        });
    });
    registerReconnectedHandler(() => sendDiceSettings(backgroundPort));
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