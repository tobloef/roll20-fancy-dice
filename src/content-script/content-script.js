import MessageTypes from "../shared/message-types.js";
import { hookAndInsertScripts, injectScript } from "./hooking.js";
import logger from "../shared/logger.js";

function main() {
    if (window.fancyDice == null) {
        window.fancyDice = {};
    }
    waitForDomReady(notifyDomReady);

    // background.js
    const port = chrome.runtime.connect(fancyDice.extensionId);
    port.onMessage.addListener((message) => {
        console.debug("content-script.js 1", message);
        if (message.content === "ping") {
            port.postMessage({
                content: "pong",
                from: "content-script.js 1",
            });
        }
    });
    port.postMessage({
        content: "ping",
        from: "content-script.js 1",
    });

    // popup.js
    chrome.runtime.onConnect.addListener((port) => {
        port.onMessage.addListener((message) => {
            logger.debug("content-script.js 2", message);
            if (message.content === "ping") {
                port.postMessage({
                    content: "pong",
                    from: "content-script.js 2",
                });
            }
        });
        port.postMessage({
            content: "ping",
            from: "content-script.js 2",
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
    const message = {
        type: MessageTypes.DOM_READY
    };
    chrome.runtime.sendMessage(message, handleScriptsToInject);
}

/**
 * Handle new list of scripts have been intercepted.
 */
async function handleScriptsToInject(scriptUrls) {
    logger.debug("handleScriptsToInject", scriptUrls);
    if (scriptUrls != null) {
        await hookAndInsertScripts(scriptUrls);
        injectScript("post-injection.js");
    }
}

function setCampaignTitle() {
    const titleElement = document.querySelector("title");
    if (titleElement == null) {
        logger.warn("Failed to get campaign title. Page title element was null.");
        return;
    }
    const title = titleElement.textContent;
    if (title == null) {
        logger.warn("Failed to get campaign title. Page title text was null.");
        return;
    }
    const campaignTitle = title.split("|")[0];
    if (campaignTitle == null) {
        logger.warn("Failed to get campaign title. Campaign title part of page title was null.");
        return;
    }
    window.fancyDice.campaignTitle = campaignTitle.trim();
}

main();