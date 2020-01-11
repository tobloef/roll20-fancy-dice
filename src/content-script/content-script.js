import MessageTypes from "../shared/message-types.js";
import {hookAndInsertScripts, injectScript} from "./hooking.js";
import {useMessageHandlers} from "../shared/handle-messages.js";

let backgroundPort;
let popupPort;
let roll20Ready = false;
let campaignInfo = {
    title: null,
    id: null
};

function main() {
    if (window.fancyDice == null) {
        window.fancyDice = {};
    }
    setupBackgroundConnection();
    setupPopupConnection();
    waitForDomReady(domReady);
}

function setupBackgroundConnection() {
    backgroundPort = chrome.runtime.connect(fancyDice.extensionId);
    backgroundPort.onMessage.addListener(useMessageHandlers(backgroundPort, {
        [MessageTypes.SCRIPTS_TO_INJECT]: handleScriptsToInject,
        [MessageTypes.CAMPAIGN_ID]: handleCampaignId,
        [MessageTypes.ROLL20_READY]: handleRoll20Ready,
    }));
}

function setupPopupConnection() {
    chrome.runtime.onConnect.addListener((port) => {
        popupPort = port;
        popupPort.onDisconnect.addListener((disconnectedPort) => {
            if (popupPort === disconnectedPort) {
                popupPort = null;
            }
        });
        popupPort.onMessage.addListener(useMessageHandlers(popupPort, {
            [MessageTypes.GET_ROLL20_READY]: handleGetRoll20Ready,
            [MessageTypes.GET_CAMPAIGN_INFO]: handleGetCampaignInfo,
        }));
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

function getCampaignTitle() {
    const titleElement = document.querySelector("title");
    const title = titleElement.textContent;
    const campaignTitle = title.split("|")[0];
    return campaignTitle.trim();
}

main();