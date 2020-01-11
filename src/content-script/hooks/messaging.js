import ScriptUrls from "../../shared/script-urls.js";

const messaging = {
    name: "Chrome messaging",
        scriptUrls: [ScriptUrls.APP],
    find: "",
    // language=JavaScript
    replaceWith: `
            // hooking.js
            const port = chrome.runtime.connect(fancyDice.extensionId);
            port.onMessage.addListener((message) => {
                
            });
        `,
};

export default messaging;