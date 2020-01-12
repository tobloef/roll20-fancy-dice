import logger from "../shared/logger.js";

const url = "wss://server.tobloef.com/dice";
const timeout = 1000 * 10;

let ws;
let diceSettingsHandler = [];
let reconnectHandler = [];

export async function connect(playerId, campaignId) {
    return new Promise((resolve, reject) => {
        logger.debug("Connecting...");
        setTimeout(() => reject(new Error("Timed out")), timeout);
        if (ws != null) {
            ws.close();
        }
        ws = new WebSocket(url);

        const heartBeat = () => {
            logger.debug("Heartbeat");
            clearTimeout(ws.pingTimeout);
            ws.pingTimeout = setTimeout(() => {
                logger.debug("Died");
                ws.close();
                reconnect();
            }, 15 * 1000);
        };

        const reconnect = () => {
            setTimeout(async () => {
                try {
                    await connect(playerId, campaignId);
                    for (const handler of reconnectHandler) {
                        handler();
                    }
                } catch (error) {
                    reconnect();
                }
            }, 1000);
        };

        let onOpen;
        let onClose;
        let onError;
        let onMessage;
        const cleanUp = () => {
            ws.removeEventListener("open", onOpen);
            ws.removeEventListener("close", onClose);
            ws.removeEventListener("error", onError);
            ws.removeEventListener("message", onMessage);
        };
        onOpen = () => {
            heartBeat();
            logger.debug("Joining...", playerId, campaignId);
            ws.send(`join ${playerId} ${campaignId}`);
        };
        onClose = (e) => {
            clearTimeout(ws.pingTimeout);
            cleanUp();
            logger.debug("Close", e);
            reject(new Error("WebSocket closed"));
        };
        onError = (e) => {
            clearTimeout(ws.pingTimeout);
            cleanUp();
            logger.debug("Error", e);
            reject(new Error("WebSocket errored"));
        };
        onMessage = ({data}) => {
            if (data === "joined") {
                logger.debug(data);
                ws.joined = true;
                resolve();
            }
        };
        ws.addEventListener("open", onOpen);
        ws.addEventListener("close", onClose);
        ws.addEventListener("error", onError);
        ws.addEventListener("message", onMessage);

        ws.addEventListener("message", heartBeat);
        ws.addEventListener("message", ({data}) => {
            if (data === "ping") {
                ws.send("pong");
            }
        });

        let onDiceSettings;
        onDiceSettings = ({data}) => {
            if (data.startsWith("diceSettings")) {
                logger.debug(data);
                const [_, diceSettingsJson] = data.split(/ (.+)/);
                const diceSettings = JSON.parse(diceSettingsJson);
                for (const handler of diceSettingsHandler) {
                    handler(diceSettings);
                }
            }
        };
        ws.addEventListener("message", onDiceSettings);
    });
}

export async function syncDiceSettings(playerId, campaignId, diceSettings) {
    return new Promise((resolve, reject) => {
        logger.debug("Syncing...", playerId, campaignId, diceSettings);
        if (ws == null) {
            reject(new Error("WebSocket not yet connected"));
        }
        let joinedInterval;
        joinedInterval = setInterval(() => {
            if (!ws.joined) {
                return;
            }
            clearInterval(joinedInterval);
            let onClose;
            let onError;
            let onMessage;
            const cleanUp = () => {
                ws.removeEventListener("close", onClose);
                ws.removeEventListener("error", onError);
                ws.removeEventListener("message", onMessage);
            };
            onClose = (e) => {
                logger.debug("Close", e);
                cleanUp();
                reject(new Error("WebSocket closed"));
            };
            onError = (e) => {
                logger.debug("Error", e);
                cleanUp();
                reject(new Error("WebSocket errored"));
            };
            onMessage = ({data}) => {
                if (data === "synced") {
                    logger.debug(data);
                    cleanUp();
                    resolve();
                }
            };
            ws.addEventListener("close", onClose);
            ws.addEventListener("error", onError);
            ws.addEventListener("message", onMessage);
            ws.send(`diceSettings ${playerId} ${campaignId} ${JSON.stringify(diceSettings)}`);
        }, 100);
        setTimeout(() => {
            clearInterval(joinedInterval);
            reject(new Error("Timed out"));
        }, timeout);
    });
}

export function registerDiceSettingsHandler(handler) {
    diceSettingsHandler.push(handler);
}

export function registerReconnectedHandler(handler) {
    reconnectHandler.push(handler);
}