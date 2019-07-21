import {injectScript} from "../misc-utils.js";
import MessageTypes from "../message-types.js";
import {getHooks, injectHooks} from "../hook-utils.js";
import logger from "../logger.js";
import {generateHooks} from "../hooks.js";

logger.debug("content-scripts.js");
window.hasInjectedModules = false;

const hookData = {
    assetsUrl: chrome.runtime.getURL("assets"),
};
const hooks = generateHooks(hookData);

waitForReady(notifyDOMLoaded);

function waitForReady(callback) {
    if (document.readyState !== "complete") {
        setTimeout(() => waitForReady(callback), 10);
        return;
    }
    callback();
}

function notifyDOMLoaded() {
    chrome.runtime.sendMessage({
        [MessageTypes.DOM_LOADED]: true,
    }, handleNewRedirectQueue);
}

function handleNewRedirectQueue(redirectQueue) {
    let numScriptsDone = 0;
    const scriptElements = [];
    for (let i = 0; i < redirectQueue.length; i++) {
        const url = redirectQueue[i];
        fetch(url)
            .then(response => response.text())
            .then(originalScriptSource => {
                {
                    let hookedData = originalScriptSource;
                    const hookQueue = getHooks(hooks, url);
                    hookedData = injectHooks(hookedData, hookQueue, url);
                    const blob = new Blob([hookedData]);
                    const hookedScriptUrl = URL.createObjectURL(blob);
                    const scriptElement = document.createElement("script");
                    scriptElement.async = false;
                    scriptElement.src = hookedScriptUrl;
                    scriptElement.id = url;
                    scriptElements[i] = scriptElement;
                }
                numScriptsDone++;
                if (numScriptsDone === redirectQueue.length) {
                    finishInjecting(scriptElements);
                }
            });
    }
}

function finishInjecting(scriptElements) {
    for (let scriptElement of scriptElements) {
        document.body.appendChild(scriptElement);
    }
    injectScript("post-injection.js");
}
