import logger from "../shared/logger.js";
import { testString } from "../shared/utils.js";
import ScriptUrls from "../shared/script-urls.js";
import CustomDiceTypes from "../shared/custom-dice-types.js";
import DiceTypes from "../shared/dice-types.js";

/**
 * Hooks to inject
 */
const hooks = [
    {
        name: "Preliminary setup",
        scriptUrls: [ScriptUrls.APP, ScriptUrls.JQUERY],
        find: "",
        // language=JavaScript
        replaceWith: `
            fancyDice = window.fancyDice || {};
            window.fancyDice = fancyDice;
            fancyDice.postInjectionCallbacks = fancyDice.postInjectionCallbacks || [];
            fancyDice.logger = fancyDice.logger || {
                debug: (...args) => console.debug("${logger.prefix}", ...args),
                info: (...args) => console.info("${logger.prefix}", ...args),
                warn: (...args) => console.warn("${logger.prefix}", ...args),
                error: (...args) => console.error("${logger.prefix}", ...args),
            };
        `
    },
    {
        name: "Main app setup",
        scriptUrls: [ScriptUrls.APP],
        find: "function(){function cParticle(){",
        // language=JavaScript
        replaceWith: `
            function() {
            fancyDice.logger.info("Setting up...");
            fancyDice.customDiceTypes = JSON.parse('${JSON.stringify(CustomDiceTypes)}');
            fancyDice.diceTypes = JSON.parse('${JSON.stringify(DiceTypes)}');
            fancyDice.assetsUrl = "${chrome.runtime.getURL("assets")}";
            fancyDice.playersCustomDiceChoice = {};
            fancyDice.customDiceCache = {};
            fancyDice.getCustomDice = function(playerId, diceType) {
                const customDiceChoice = fancyDice.playersCustomDiceChoice[playerId];
                if (customDiceChoice == null) {
                    return null;
                }
                return fancyDice.customDiceCache[customDiceChoice];
            };
            fancyDice.updateCustomDiceChoices = (newChoices) => {
                if (newChoices == null) {
                    return;
                }
                for (const [playerId, choice] of Object.entries(newChoices)) {
                    fancyDice.playersCustomDiceChoice[playerId] = choice;
                }
            };
            fancyDice.fetchCustomDiceChoices = (playerIds, callback) => {
                // TODO: Fetch
                const playersCustomDiceChoice = {
                    "-LjCgFYxbhdFfpfdfvQ2": "${CustomDiceTypes.PEARLESCENT.key}",
                    "-LjDGvUKjsDkMPjUZkxj": "${CustomDiceTypes.FANCY.key}",
                };
                callback(playersCustomDiceChoice);
            };
            const getNewPlayers = function() {
                if (fancyDice.d20 == null) {
                    return;
                }
                if (fancyDice.d20.Campaign == null) {
                    return;
                }
                const playerIds = fancyDice.d20.Campaign.players.models.map(p => p.id);
                const newPlayerIds = playerIds.filter(id => !Object.keys(fancyDice.playersCustomDiceChoice).includes(id));
                if (newPlayerIds) {
                    fancyDice.fetchCustomDiceChoices(newPlayerIds, fancyDice.updateCustomDiceChoices);
                } 
            };
            getNewPlayers();
            setInterval(getNewPlayers, 1000);
            // Load custom dice cache
            const cacheCustomDice = async () => {
                const loader = new THREE.JSONLoader();
                loader.crossOrigin = "";
                for (const customDiceType of Object.values(fancyDice.customDiceTypes)) {
                    const customDice = {
                        ...customDiceType
                    };
                    for (const diceType of Object.keys(fancyDice.diceTypes)) {
                        const url = fancyDice.assetsUrl + "/custom-dice/" + customDiceType.key + "/" + diceType + "/" + diceType + "tex.json";
                        try {
                            const response = await fetch(url);
                            if (!response.ok) {
                                throw new Error("Response not OK.");
                            }
                            customDice[diceType] = await new Promise((resolve, reject) => {
                                setTimeout(() => reject(new Error("Loading model timed out (" + url + ").")), 1000);
                                loader.load(url, (geometry, materials) => resolve({geometry, materials}));
                            });
                        } catch (error) {
                            //fancyDice.logger.error("Error fetching dice texture info.", error);
                        }
                    }
                    fancyDice.customDiceCache[customDiceType.key] = customDice;
                }
            };
            cacheCustomDice();
            function cParticle() {
        `
    },
    {
        name: "Modify the jQuery ready function to let us manually call the callback",
        scriptUrls: [ScriptUrls.JQUERY],
        find: "jQuery.ready.promise().done( fn );",
        // language=JavaScript
        replaceWith: `window.fancyDice.postInjectionCallbacks.push(fn);`,
    },
    {
        name: `Expose D20 globally`,
        scriptUrls: [ScriptUrls.APP],
        find: `getPointer,degreesToRadians;`,
        // language=JavaScript
        replaceWith: `getPointer,degreesToRadians;window.fancyDice.d20=d20;`,
    },
    {
        name: "Add roll event to roll queue data",
        scriptUrls: [ScriptUrls.APP],
        find: /S.push\({maxroll:n\[i\],callback:!1}\)/,
        // language=JavaScript
        replaceWith: `
            S.push({
                maxroll: n[i],
                callback: !1,
                rollEvent: e
            });
        `,
    },
    {
        name: "Add roll event to createShape call",
        scriptUrls: [ScriptUrls.APP],
        find: `createShape("d"+S[a].maxroll,`,
        // language=JavaScript
        replaceWith: `createShape(S[a].rollEvent,"d"+S[a].maxroll,`,
    },
    {
        name: "Custom createShape function declaration",
        scriptUrls: [ScriptUrls.APP],
        find: /d20\.tddice\.createShape=[\w\W]+?;var L={}/,
        // language=JavaScript
        replaceWith: `
            d20.tddice.createShape = function (rollEvent, e, t, n, o, r, a) {
                P = false;
                const allDiceToRoll = "d100" === e ? ["dpct10s", "dpct1s"] : [e];
                _.each(allDiceToRoll, (diceToRoll) => {
                    const playerColor = new THREE.Color(+("0x" + c.replace("#", "")));
                    const white = new THREE.Color("white");
                    const customDice = window.fancyDice.getCustomDice(rollEvent.player, diceToRoll);
                    let geometry;
                    let materials;
                    let color = playerColor;
                    if (customDice != null && customDice[diceToRoll] != null) {
                        window.fancyDice.logger.warn(customDice);
                        geometry = customDice[diceToRoll].geometry;
                        materials = customDice[diceToRoll].materials;
                        if (!customDice.useColor) {
                            color = white;
                        }
                    } else {
                        window.fancyDice.logger.warn("No custom", diceToRoll, "found for player", rollEvent.player);
                        geometry = p[diceToRoll];
                        materials = g[diceToRoll];
                    }
                    const diceModel = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                    diceModel.castShadow = false;
                    for (let d = 0; d < diceModel.material.materials.length; d++) {
                        diceModel.material.materials[d].color = color;
                        diceModel.material.materials[d].ambient = color;
                        if (diceModel.material.materials[d].uniforms) {
                            diceModel.material.materials[d].uniforms.tDiffuse.value.anisotropy = u;
                        }
                    }
                    diceModel.promise = a;
                    if ("d6" === diceToRoll) {
                        diceModel.scale.set(1.4, 1.4, 1.4);
                    } else {
                        diceModel.scale.set(1.7, 1.7, 1.7);
                    }
                    diceModel.dicetype = diceToRoll;
                    if ("dpct" === diceToRoll) {
                        diceModel.maxroll = 10;
                    } else {
                        diceModel.maxroll = parseInt(diceToRoll.replace("d", ""), 10);
                    }
                    const h = p[diceToRoll].vertices;
                    const f = p[diceToRoll].faces;
                    const m = [];
                    const y = [];
                    for (let b = 0; b < h.length; b++) {
                        m.push(new CANNON.Vec3(
                            h[b].x * diceModel.scale.x, 
                            h[b].y * diceModel.scale.y, 
                            h[b].z * diceModel.scale.z
                        ));
                    }
                    for (let b = 0; b < f.length; b++) {
                        y.push([f[b].a, f[b].b, f[b].c]);
                    }
                    diceModel.body = new CANNON.Body({
                        mass: 1e3
                    });
                    diceModel.body.material = M;
                    const w = new CANNON.ConvexPolyhedron(m, y);
                    diceModel.body.addShape(w, 0);
                    diceModel.body.position.set(t.x + (20 * k() - 10), t.y, t.z + (20 * k() - 10));
                    diceModel.body.quaternion.setFromAxisAngle(new CANNON.Vec3(r.x, r.y, r.z), r.a * Math.PI * 2);
                    diceModel.body.angularVelocity.set(o.x, o.y, o.z);
                    diceModel.body.velocity.set(n.x, n.y, n.z);
                    diceModel.body.linearDamping = .25;
                    diceModel.body.angularDamping = .25;
                    diceModel.body.isPlayingSound = !1;
                    diceModel.body.addEventListener("collide", (e) => {
                        const diceid = e.contact.bj.id;
                        const colidedwithid = e.contact.bi.id;
                        const maxvel = Math.max(Math.abs(n.x), Math.abs(n.y));
                        if (!diceModel.body.isPlayingSound) {
                            diceModel.body.isPlayingSound = !0;
                            W(diceid, diceModel.dicetype, colidedwithid, maxvel)
                        }
                    });
                    diceModel.visible = false;
                    i.add(diceModel);
                    v.push(diceModel);
                    d20.tddice.world.add(diceModel.body);
                })
            };
            var L = {}
        `,
    },



    /*
    {
        name: "test5",
        scriptUrls: ["https://app.roll20.net/assets/app.js"],
        find: `function(){function cParticle(){`,
        replaceWith: `function(){${tempCode}function cParticle(){`,
    }
    */
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
            logger.warn(`Hook "${hook.name}" failed to inject, no matching pattern in file ${url}.`);
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
