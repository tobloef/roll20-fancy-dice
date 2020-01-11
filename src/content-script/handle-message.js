import MessageTypes from "../shared/message-types.js";
import logger from "../shared/logger.js";

/**
 * Map of message types to handlers.
 */
const messageHandlers = {
    [MessageTypes.REQUEST_CAMPAIGN_INFO]: handleRequestCampaignInfo,
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
function handleRequestCampaignInfo(msg, sender, sendResponse) {
    const campaignInfo = {
        id: window.fancyDice.campaignId,
        title: window.fancyDice.campaignTitle,
    };
    sendResponse(campaignInfo);
}