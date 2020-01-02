/**
 * Urls of scripts not to intercept.
 */
import { testString } from "../utils.js";

const ignoredScripts = [];

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
    if (ignoredScripts.some(script => testString(script, req.url))) {
        return null;
    }
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