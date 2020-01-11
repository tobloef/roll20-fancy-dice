import MessageTypes from "../shared/message-types.js";
import { hookAndInsertScripts, injectScript } from "./hooking.js";
import logger from "../shared/logger.js";
import {useMessageHandlers} from "../shared/handle-messages.js";

let backgroundPort;
let popupPort;

function main() {
    if (window.fancyDice == null) {
        window.fancyDice = {};
    }
    waitForDomReady(notifyDomReady);
    setupBackgroundConnection();
    setupPopupConnection();
}

function setupBackgroundConnection() {
    backgroundPort = chrome.runtime.connect(fancyDice.extensionId);
    backgroundPort.onMessage.addListener(useMessageHandlers(backgroundPort, {
        [MessageTypes.SCRIPTS_TO_INJECT]: handleScriptsToInject,
    }));
}

function setupPopupConnection() {
    chrome.runtime.onConnect.addListener((port) => {
        popupPort = port;
        popupPort.onMessage.addListener({
            // TODO
        });
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
function notifyDomReady() {
    backgroundPort.postMessage({
        type: MessageTypes.DOM_READY
    });
}

/**
 * Handle new list of scripts have been intercepted.
 */
async function handleScriptsToInject(message, port) {
    await hookAndInsertScripts(message.scriptUrls);
    injectScript("post-injection.js");
}

function getCampaignTitle() {
    const titleElement = document.querySelector("title");
    const title = titleElement.textContent;
    const campaignTitle = title.split("|")[0];
    return campaignTitle.trim();
}

main();