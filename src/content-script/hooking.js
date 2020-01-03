import logger from "../logger.js";

import initialSetup from "./hooks/initial-setup.js";
import { testString } from "../utils.js";
import ScriptUrls from "../script-urls.js";

/**
 * Hooks to inject
 */
const hooks = [
    {
        name: "Setup initial objects and global variables",
        scriptUrls: [ScriptUrls.JQUERY, ScriptUrls.APP],
        find: "",
        replaceWith: `
        if (window.fancyDice == null) {
            window.fancyDice = {};
        }
        if (window.fancyDice.postInjectionCallbacks == null) {
            window.fancyDice.postInjectionCallbacks = [];
        }
        if (window.fancyDice.assetsUrl == null) {
            window.fancyDice.assetsUrl = "${chrome.runtime.getURL("assets")}";
        }
    `
    },
    {
        name: `Test hook to check that everything it's working`,
        scriptUrls: [ScriptUrls.APP],
        find: ``,
        replaceWith: `console.info("${logger.prefix}", "Hooking succeeded");`,
    },
    {
        name: "Modify the jQuery ready function to let us manually call the callback",
        scriptUrls: [ScriptUrls.JQUERY],
        find: "jQuery.ready.promise().done( fn );",
        replaceWith: `window.fancyDice.postInjectionCallbacks.push(fn);`,
    },

    {
        name: `Setup remove excessiveL logging when messaging bugs out`,
        scriptUrls: [ScriptUrls.APP],
        find: ``,
        replaceWith: `window.didItTimes = 0;`,
    },
    {
        name: "Remove excessiveL logging when messaging bugs out",
        scriptUrls: [ScriptUrls.APP],
        find: `console.log("MESSAGE RECEIVED"),console.log(t),`,
        replaceWith: `(() => {
            window.didItTimes++;
            if (window.didItTimes === 200) {
                console.warn("FANCYDICE MESSAGE RECEIVED hit max", t);
            }
        })(),`,
    },
    {
        name: "Log remote roll event",
        scriptUrls: [ScriptUrls.APP],
        find: `console.log("remote Roll!"),`,
        replaceWith: `window.fancyDice.logger.debug("Remote Roll:", e),`,
    },
    {
        name: "Custom createShape function declaration",
        scriptUrls: [ScriptUrls.APP],
        find: `d20\\.tddice\\.createShape=[\\w\\W]+?;var L=\\{\\}`,
        // language=JavaScript
        replaceWith: `
            d20.tddice.createShape = function (roll, diceType, t, n, o, r, a) {
                window.fancyDice.logger.debug("createShape", "roll", roll);
                var diceModel;
                P = false;
                var allDiceToRoll = "d100" === diceType ? ["dpct10s", "dpct1s"] : [diceType];
                _.each(allDiceToRoll, function (diceToRoll) {
                    diceModel = new THREE.Mesh(p[diceToRoll], new THREE.MeshFaceMaterial(g[diceToRoll]));
                    diceModel.castShadow = false;
                    var color = new THREE.Color(+("0x" + c.replace("#", "")));
                    for (var d = 0; d < diceModel.material.materials.length; d++) {
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
                    var h = p[diceToRoll].vertices;
                    var f = p[diceToRoll].faces;
                    var m = [];
                    var y = [];
                    for (var b = 0; b < h.length; b++) {
                        m.push(new CANNON.Vec3(h[b].x * diceModel.scale.x, h[b].y * diceModel.scale.y, h[b].z * diceModel.scale.z));
                    }
                    for (b = 0; b < f.length; b++) {
                        y.push([f[b].a, f[b].b, f[b].c]);
                    }
                    diceModel.body = new CANNON.Body({
                        mass: 1e3
                    });
                    diceModel.body.material = M;
                    var w = new CANNON.ConvexPolyhedron(m, y);
                    diceModel.body.addShape(w, 0);
                    diceModel.body.position.set(t.x + (20 * k() - 10), t.y, t.z + (20 * k() - 10));
                    diceModel.body.quaternion.setFromAxisAngle(new CANNON.Vec3(r.x, r.y, r.z), r.a * Math.PI * 2);
                    diceModel.body.angularVelocity.set(o.x, o.y, o.z);
                    diceModel.body.velocity.set(n.x, n.y, n.z);
                    diceModel.body.linearDamping = .25;
                    diceModel.body.angularDamping = .25;
                    diceModel.body.isPlayingSound = !1;
                    diceModel.body.addEventListener("collide", function (e) {
                        diceid = e.contact.bj.id;
                        colidedwithid = e.contact.bi.id;
                        vel = e.contact.bj.velocity;
                        maxvel = Math.max(Math.abs(n.x), Math.abs(n.y));
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
    {
        name: "Add roll event to createShape call",
        scriptUrls: [ScriptUrls.APP],
        find: `createShape("d"+S[a].maxroll,`,
        replaceWith: `createShape(e,"d"+S[a].maxroll,`,
    },



    /*
    {
        name: "test5",
        scriptUrls: ["https://app.roll20.net/assets/app.js"],
        find: `function(){function cParticle(){`,
        replaceWith: `function(){${tempCode}function cParticle(){`,
    },
    {
        name: "test1",
        scriptUrls: ["https://app.roll20.net/assets/app.js"],
        find: `(s=new THREE.Mesh(p[e],new THREE.MeshFaceMaterial(g[e]))).castShadow=!1;for(var l=new THREE.Color(+("0x"+c.replace("#",""))),d=0;d<s.material.materials.length;d++)s.material.materials[d].color=l,s.material.materials[d].ambient=l,s.material.materials[d].uniforms&&(s.material.materials[d].uniforms.tDiffuse.value.anisotropy=u);`,
        replaceWith: `
            let geometry = p[e];
            let materials = g[e];
            let customDice = null;
            try {
                customDice = window.fancyDice.getCustomDiceByPlayerId(playerid);
                if (customDice != null && customDice[e] != null) {
                    geometry = customDice[e].geometry;
                    materials = customDice[e].materials;
                }
            } catch (error) {
                console.error("Error loading custom dice.", error);
            }
            (s=new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))).castShadow=!1;
            //const playerDiceColor = new THREE.Color(+("0x" + c.replace("#", "")));
            const playerDiceColor = new THREE.Color(c); 
            const white = new THREE.Color("white"); 
            for (let d = 0; d < s.material.materials.length; d++) {
                if (customDice == null) {
                    s.material.materials[d].color = playerDiceColor;
                    s.material.materials[d].ambient = playerDiceColor;
                } else {
                    s.material.materials[d].color = white;
                    s.material.materials[d].ambient = white;
                }
                s.material.materials[d].uniforms && (s.material.materials[d].uniforms.tDiffuse.value.anisotropy = u);
            }
        `,
    },
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
