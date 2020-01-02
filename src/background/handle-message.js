import { getScriptsIntercepting, setScriptsIntercepting } from "./intercept.js";
import MessageTypes from "../message-types.js";

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
    const handler = messageHandlers[msg.type];
    if (handler != null) {
        handler(msg, sender, sendResponse);
    }
}

/**
 * Handle that the DOM is ready for modification.
 */
function handleDomLoaded(msg, sender, sendResponse) {
    sendResponse(getScriptsIntercepting());
    setScriptsIntercepting([]);
}