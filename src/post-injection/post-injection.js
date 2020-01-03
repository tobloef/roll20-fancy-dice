import logger from "../logger.js";

function main() {
    if (window.fancyDice == null) {
        window.fancyDice = {};
    }
    window.fancyDice.logger = logger;
    notifyBrowserThatDomLoaded();
    waitForDependencies(callPostInjectionCallbacks);
}

/**
 * Manually send an event signifying that the DOM has finished loading.
 */
function notifyBrowserThatDomLoaded() {
    const domContentLoadedEvent = document.createEvent("Event");
    domContentLoadedEvent.initEvent("DOMContentLoaded", true, true);
    window.document.dispatchEvent(domContentLoadedEvent);
}

/**
 * Call post-injection callbacks, usually created by various hooks.
 */
function callPostInjectionCallbacks() {
    if (window.fancyDice.postInjectionCallbacks == null) {
        logger.warn("postInjectionCallbacks is null");
        return;
    }
    for (const callback of window.fancyDice.postInjectionCallbacks) {
        callback();
    }
    window.fancyDice.postInjectionCallbacks = [];
}

/**
 * Wait for Roll20's dependencies to load, then execute a callback.
 */
function waitForDependencies(callback) {
    const interval = setInterval(() => {
        const hasJQuery = typeof (window.$) !== "undefined";
        const hasSoundManager = typeof (window.soundManager) !== "undefined";
        const hasD20 = typeof (window.d20) !== "undefined";
        if (!hasJQuery || !hasSoundManager || !hasD20) {
            clearInterval(interval);
            callback();
        }
    }, 100);
}
 main();