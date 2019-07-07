import {injectScript} from "../utils/misc-utils";
import {
    MESSAGE_KEY_CHROME_INJECTION_DONE,
    MESSAGE_KEY_DOM_LOADED,
    MESSAGE_KEY_LOAD_MODULES
} from "../constants";
import {getHooks, injectHooks} from "../utils/hook-utils";
import hooks from "../hooks.js";
import logger from "../logger.js";

logger.debug("content-scripts.js");
window.hasInjectedModules = false;
window.addEventListener("message", handleMessage);
waitForReady();

function waitForReady() {
    if (document.readyState !== "complete") {
        setTimeout(waitForReady, 10);
        return;
    }
    chrome.runtime.sendMessage({
        [MESSAGE_KEY_DOM_LOADED]: true,
    }, handleNewRedirectQueue);
}

function injectModules() {
    if (window.hasInjectedModules) {
        return;
    }
    window.hasInjectedModules = true;
}

function handleMessage(e) {
    if (e.data[MESSAGE_KEY_LOAD_MODULES]) {
        window.injectWebsiteOK = true;
    }
    if (e.data[MESSAGE_KEY_CHROME_INJECTION_DONE]) {
        window.injectBackgroundOK = true;
    }
    if (window.injectBackgroundOK && window.injectWebsiteOK) {
        injectModules();
    }
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
