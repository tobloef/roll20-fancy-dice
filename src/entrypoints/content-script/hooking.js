import logger from "../../logger.js";

import tempCode from "../../temp-code.js";
import interceptJqueryReady from "./hooks/intercept-jquery-ready.js";
import initialSetup from "./hooks/initial-setup.js";
import { testString } from "../../utils.js";

/**
 * Hooks to inject
 */
const hooks = [
    initialSetup,
    interceptJqueryReady,
    /*{
        name: "exposeD20",
        scriptUrls: ["https://app.roll20.net/assets/app.js"],
        find: `getPointer,degreesToRadians;`,
        replaceWith: `getPointer,degreesToRadians;window.d20=d20;window.exports=exports;`,
    },*/
    /*
    {
        name: "logRemoteRollEvent",
        scriptUrls: ["https://app.roll20.net/assets/app.js"],
        find: `console.log("remote Roll!"),`,
        replaceWith: `console.log("remote Roll!", e),`,
    },
    {
        name: "test2",
        scriptUrls: ["https://app.roll20.net/assets/app.js"],
        find: `createShape("d"+S[a].maxroll,`,
        replaceWith: `createShape(S[a],`,
    },
    {
        name: "test4",
        scriptUrls: ["https://app.roll20.net/assets/app.js"],
        find: /(doRemoteRoll.+?)S\.push\({maxroll:n\[i],callback:!1}\)/,
        replaceWith: `$1
                S.push({
                    maxroll: n[i],
                    callback: !1,
                    player: e.player
                })`,
    },
    {
        name: "test3",
        scriptUrls: ["https://app.roll20.net/assets/app.js"],
        find: `d20.tddice.createShape=function(e,t,n,o,r,a){`,
        replaceWith: `d20.tddice.createShape=function(u1,t,n,o,r,a){var e = "d" + u1.maxroll;var playerid = u1.player;`,
    },
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
    return hook.scriptUrls.some(url => testString(url, scriptUrl));
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
            logger.debug(`Hook ${hook.name} successfully injected on file ${url}.`);
        } else {
            logger.warn(`Hook ${hook.name} failed to inject, no matching pattern in file ${url}.`);
        }
    }
    return source;
}

/**
 * Inject and run a script once on the page.
 */
export function injectScript(url) {
    const s = document.createElement("script");
    s.async = false;
    s.src = chrome.extension.getURL(url);
    s.onload = () => {
        s.remove();
    };
    document.head.appendChild(s);
}
