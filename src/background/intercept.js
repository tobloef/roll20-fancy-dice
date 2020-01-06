/**
 * Urls of scripts not to intercept.
 */
import { testString } from "../shared/utils.js";
import logger from "../shared/logger.js";
import ScriptUrls from "../shared/script-urls.js";

const scriptsToIntercept = [
    ScriptUrls.JQUERY,
    ScriptUrls.JQUERY_MIGRATE,
    ScriptUrls.FEATURE_DETECT,
    ScriptUrls.PATIENCE,
    ScriptUrls.STARTJS,
    ScriptUrls.JQUERY_UI,
    ScriptUrls.LOADING,
    ScriptUrls.FIREBASE,
    ScriptUrls.BASE,
    ScriptUrls.APP,
    ScriptUrls.TUTORIAL,
    ScriptUrls.FFMPEG,
];

/**
 * Urls of scripts being intercepted.
 */
let scriptsIntercepting = [];

/**
 * Intercept a script if needed, canceling the request so another one can be made later.
 */
export function interceptScripts(req) {
    if (req.type !== "script") {
        return null;
    }
    if (!scriptsToIntercept.some(script => testString(script, req.url))) {
        return null;
    }
    logger.debug(`Intercepting script "${req.url}".`);
    scriptsIntercepting.push(req.url);
    // Cancel the request
    return {
        cancel: true
    };
}

export function getScriptsIntercepting() {
    return scriptsIntercepting;
}

export function setScriptsIntercepting(value) {
    scriptsIntercepting = value;
}
