import ScriptUrls from "../../script-urls.js";

/**
 * Do setup needed for various other hooks to function.
 */
const initialSetup = {
    name: "initialSetup",
    scriptUrls: [ScriptUrls.JQUERY, ScriptUrls.APP],
    find: "",
    replaceWith: `
        if (window.fancyDice == null) {
            window.fancyDice = {};
        }
        if (window.fancyDice.postInjectionCallbacks == null) {
            window.fancyDice.postInjectionCallbacks = [];
        }
        if (window.fancyDice.assetsUrl == null) {
            window.fancyDice.assetsUrl = "${chrome.runtime.getURL("assets")}";
        }
    `
};

export default initialSetup;