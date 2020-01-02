import ScriptUrls from "../script-urls.js";

/**
 * Replace the calling the callback when the DOM is ready with our own call after injections completed.
 */
const interceptJqueryReady =  {
    name: "interceptJqueryReady",
    scriptUrls: [ScriptUrls.JQUERY],
    find: "jQuery.ready.promise().done( fn );",
    replaceWith: `window.fancyDice.postInjectionCallbacks.push(fn);`,
};

export default interceptJqueryReady;