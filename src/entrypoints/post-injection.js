import logger from "../logger.js";

logger.debug("post-injection.js");
notifyDOMLoaded();
waitForDependencies(callPostInjectionCallbacks);

function notifyDOMLoaded() {
    const DOMContentLoaded_event = document.createEvent("Event");
    DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
    window.document.dispatchEvent(DOMContentLoaded_event);
}

function callPostInjectionCallbacks() {
    for (let i = 0; i < window.fancyDice.readyCallbacks.length; i++) {
        window.fancyDice.readyCallbacks[i]();
    }
}

function waitForDependencies(callback) {
    const hasJQuery = typeof (window.$) !== "undefined";
    const hasSoundManager = typeof (window.soundManager) !== "undefined";
    const hasD20 = typeof (window.d20) !== "undefined";
    if (!hasJQuery || !hasSoundManager || !hasD20) {
        setTimeout(() => waitForDependencies(callback), 200);
        return;
    }
    callback();
}
