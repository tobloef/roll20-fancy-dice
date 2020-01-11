import ScriptUrls from "../../shared/script-urls.js";
import logger from "../../shared/logger.js";

const preliminarySetup = {
    name: "Preliminary setup",
    scriptUrls: [
        ScriptUrls.APP,
        ScriptUrls.JQUERY,
        ScriptUrls.STARTJS
    ],
    find: "",
    // language=JavaScript
    replaceWith: `
            fancyDice = window.fancyDice || {};
            window.fancyDice = fancyDice;
            fancyDice.extensionId = "${chrome.runtime.id}";
            fancyDice.postInjectionCallbacks = fancyDice.postInjectionCallbacks || [];
            fancyDice.logger = fancyDice.logger || {
                debug: (...args) => console.debug("${logger.prefix}", ...args),
                info: (...args) => console.info("${logger.prefix}", ...args),
                warn: (...args) => console.warn("${logger.prefix}", ...args),
                error: (...args) => console.error("${logger.prefix}", ...args),
            };
        `
};

export default preliminarySetup;
