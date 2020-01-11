import logger from "../shared/logger.js";

export function useMessageHandlers(port, handlers) {
    return (message) => {
        logger.debug(`Got message:`, message);
        const handler = handlers[message.type];
        if (handler != null) {
            handler(message, port);
        } else {
            logger.warn("Got message with no valid handler.", message);
        }
    }
}