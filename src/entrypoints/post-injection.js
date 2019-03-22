import {MESSAGE_KEY_CHROME_INJECTION_DONE} from "../constants";

{
    {
        const DOMContentLoaded_event = document.createEvent("Event");
        DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
        window.document.dispatchEvent(DOMContentLoaded_event);
    }
    const waitForDepts = () => {
        const hasJQuery = typeof(window.$) !== "undefined";
        const hasSoundManager = typeof(window.soundManager) !== "undefined";
        const hasD20 = typeof(window.d20) !== "undefined";
        if (!hasJQuery || !hasSoundManager || !hasD20) {
            setTimeout(waitForDepts, 200);
            return;
        }
        for (let i = 0; i < window.r20esChrome.readyCallbacks.length; i++) {
            window.r20esChrome.readyCallbacks[i]();
        }
        window.postMessage({
            [MESSAGE_KEY_CHROME_INJECTION_DONE]: true
        }, "https://app.roll20.net");
    };

    waitForDepts();
}