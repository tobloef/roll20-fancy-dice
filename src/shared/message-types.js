/**
 * Types of messages that can be sent between the background and foreground thread.
 */
const MessageTypes = {
    DOM_READY: "DOM_READY",
    SCRIPTS_TO_INJECT: "SCRIPTS_TO_INJECT",
    CAMPAIGN_TITLE: "CAMPAIGN_TITLE",
    CAMPAIGN_ID: "CAMPAIGN_ID",
    SYNC: "SYNC",
};

export default MessageTypes;