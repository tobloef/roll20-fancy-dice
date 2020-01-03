import { getScriptsIntercepting, setScriptsIntercepting, setShouldIntercept } from "./intercept.js";
import MessageTypes from "../message-types.js";
import logger from "../logger.js";

/**
 * Map of message types to handlers.
 */
const messageHandlers = {
    [MessageTypes.DOM_READY]: handleDomLoaded,
};

/**
 * Handle messages form the background thread.
 */
export function handleMessage(msg, sender, sendResponse) {
    logger.debug(`Got message:`, msg);
    const handler = messageHandlers[msg.type];
    if (handler != null) {
        handler(msg, sender, sendResponse);
    }
}

/**
 * Handle that the DOM is ready for modification.
 */
function handleDomLoaded(msg, sender, sendResponse) {
    const scriptsIntercepting = getScriptsIntercepting();
    sendResponse(scriptsIntercepting);
    setScriptsIntercepting([]);
}