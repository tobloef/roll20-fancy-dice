import MessageTypes from "../message-types.js";
import { hookAndInsertScripts, injectScript } from "./hooking.js";

function main() {
    waitForDomReady(notifyDomReady);
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
    // Send the message and expect a list of scripts to hook into and insert into the page
    chrome.runtime.sendMessage(message, async (scriptUrls) => {
        await hookAndInsertScripts(scriptUrls);
        injectScript("post-injection.js");
    });
}

main();