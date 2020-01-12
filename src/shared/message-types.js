/**
 * Types of messages that can be sent between the background and foreground thread.
 */
const MessageTypes = {
    DOM_READY: "DOM_READY",
    SCRIPTS_TO_INJECT: "SCRIPTS_TO_INJECT",
    CAMPAIGN_TITLE: "CAMPAIGN_TITLE",
    CAMPAIGN_ID: "CAMPAIGN_ID",
    DICE_SETTINGS: "DICE_SETTINGS",
    GET_DICE_SETTINGS: "GET_DICE_SETTINGS",
    GET_ROLL20_READY: "GET_ROLL20_READY",
    ROLL20_READY: "ROLL20_READY",
    CAMPAIGN_INFO: "CAMPAIGN_INFO",
    GET_CAMPAIGN_INFO: "GET_CAMPAIGN_INFO",
    PLAYER_ID: "PLAYER_ID",
};

export default MessageTypes;