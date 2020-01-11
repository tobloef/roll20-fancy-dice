import ScriptUrls from "../../shared/script-urls.js";

const jqueryReady = {
    name: "Modify the jQuery ready function to let us manually call the callback",
    scriptUrls: [ScriptUrls.JQUERY],
    find: "jQuery.ready.promise().done( fn );",
    // language=JavaScript
    replaceWith: `window.fancyDice.postInjectionCallbacks.push(fn);`,
};

export default jqueryReady;