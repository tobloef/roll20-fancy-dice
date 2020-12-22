import logger from "../shared/logger.js";
import {testString} from "../shared/utils.js";
import preliminarySetup from "./hooks/preliminary-setup.js";
import mainSetup from "./hooks/main-setup.js";
import jqueryReady from "./hooks/jquery-ready.js";
import exposeD20 from "./hooks/expose-d20.js";
import createShape from "./hooks/create-shape.js";
import addRollEventToCreateShapeCall from "./hooks/add-roll-event-to-create-shape-call.js";
import addRollEventToQueue from "./hooks/add-roll-event-to-queue.js";

/**
 * Hooks to inject
 */
const hooks = [
    addRollEventToCreateShapeCall,
    addRollEventToQueue,
    createShape,
    jqueryReady,
    mainSetup,
    exposeD20,
    preliminarySetup,
];

/**
 * Load scripts and inject hooks into them, then insert them on the page.
 */
export async function hookAndInsertScripts(scriptsUrls) {
    for (const scriptUrl of scriptsUrls) {
        const hooksForScript = getHooksForScript(hooks, scriptUrl);
        const response = await fetch(scriptUrl);
        let scriptSource = await response.text();
        scriptSource = injectHooks(scriptSource, hooksForScript, scriptUrl);
        const blob = new Blob([scriptSource]);
        const hookedScriptBlobUrl = URL.createObjectURL(blob);
        const scriptElement = document.createElement("script");
        scriptElement.async = false;
        scriptElement.src = hookedScriptBlobUrl;
        scriptElement.id = scriptUrl;
        document.body.appendChild(scriptElement);
    }
}

/**
 * Get which hooks should be injected into a given script
 */
export function getHooksForScript(hooks, scriptUrl) {
    let hooksToUse = [];
    for (let hook of hooks) {
        if (shouldUseHookForScript(hook, scriptUrl)) {
            hooksToUse.push(hook);
        }
    }
    return hooksToUse;
}

/**
 * Check whether a hook should injected into a given script
 */
function shouldUseHookForScript(hook, scriptUrl) {
    if (hook.enabled === false) {
        return false;
    }
    if (!hook.scriptUrls.some(url => testString(url, scriptUrl))) {
        return false;
    }
    return true;
}

/**
 * Inject a list of hooks into the source code of a script
 */
export function injectHooks(source, hooks, url) {
    for (let hook of hooks) {
        let hookSuccessful = false;
        hookSuccessful = testString(hook.find, source);
        source = source.replace(hook.find, hook.replaceWith);
        if (hookSuccessful) {
            logger.debug(`Hook "${hook.name}" successfully injected on file ${url}.`);
        } else {
            logger.error(`Hook "${hook.name}" failed to inject, no matching pattern in file ${url}.`);
        }
    }
    return source;
}

/**
 * Inject and run a script once on the page.
 */
export function injectScript(url) {
    const scriptElement = document.createElement("script");
    scriptElement.async = false;
    scriptElement.src = chrome.extension.getURL(url);
    scriptElement.onload = () => {
        scriptElement.remove();
    };
    document.head.appendChild(scriptElement);
}
