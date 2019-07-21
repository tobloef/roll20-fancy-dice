import tempCode from "./temp-code.js";

const appJSUrl = "https://app.roll20.net/assets/app.js";
const jqeuryJSURL = "https://app.roll20.net/v2/js/jquery-1.9.1.js";

export function generateHooks(data) {
    return [
        {
            name: "jsonReady",
            urlIncludes: jqeuryJSURL,
            find: "jQuery.ready.promise().done( fn );",
            replace: `
            if(window.fancyDice == null) {
                 window.fancyDice = {};
            }
            if(window.fancyDice.readyCallbacks == null) {
                window.fancyDice.readyCallbacks = [];
            }
            window.fancyDice.readyCallbacks.push(fn);
        `,
        },
        {
            name: "assetsURL",
            urlIncludes: appJSUrl,
            find: "",
            replace: `window.fancyDice.assetsUrl = "${data.assetsUrl}";`
        },
        {
            name: "exposeD20",
            urlIncludes: appJSUrl,
            find: `getPointer,degreesToRadians;`,
            replace: `getPointer,degreesToRadians;window.d20=d20;window.exports=exports;`,
        },
        {
            name: "logRemoteRollEvent",
            urlIncludes: appJSUrl,
            find: `console.log("remote Roll!"),`,
            replace: `console.log("remote Roll!", e),`,
        },
        {
            name: "test2",
            urlIncludes: appJSUrl,
            find: `createShape("d"+S[a].maxroll,`,
            replace: `createShape(S[a],`,
        },
        {
            name: "test4",
            urlIncludes: appJSUrl,
            find: /(doRemoteRoll.+?)S\.push\({maxroll:n\[i],callback:!1}\)/,
            replace: `$1
                S.push({
                    maxroll: n[i],
                    callback: !1,
                    player: e.player
                })`,
        },
        {
            name: "test3",
            urlIncludes: appJSUrl,
            find: `d20.tddice.createShape=function(e,t,n,o,r,a){`,
            replace: `d20.tddice.createShape=function(u1,t,n,o,r,a){var e = "d" + u1.maxroll;var playerid = u1.player;`,
        },
        {
            name: "test5",
            urlIncludes: appJSUrl,
            find: `function(){function cParticle(){`,
            replace: `function(){${tempCode}function cParticle(){`,
        },
        {
            name: "test1",
            urlIncludes: appJSUrl,
            find: `(s=new THREE.Mesh(p[e],new THREE.MeshFaceMaterial(g[e]))).castShadow=!1;for(var l=new THREE.Color(+("0x"+c.replace("#",""))),d=0;d<s.material.materials.length;d++)s.material.materials[d].color=l,s.material.materials[d].ambient=l,s.material.materials[d].uniforms&&(s.material.materials[d].uniforms.tDiffuse.value.anisotropy=u);`,
            replace: `
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
            const playerDiceColor = new THREE.Color(+("0x" + c.replace("#", ""))); 
            for (let d = 0; d < s.material.materials.length; d++) {
                if (customDice == null) {
                    s.material.materials[d].color = playerDiceColor;
                    s.material.materials[d].ambient = playerDiceColor;
                }
                s.material.materials[d].uniforms && (s.material.materials[d].uniforms.tDiffuse.value.anisotropy = u);
            }
        `,
        },
    ]
}