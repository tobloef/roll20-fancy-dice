import ScriptUrls from "../../shared/script-urls.js";

const createShape = {
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
            const diceSettings = window.fancyDice.getDiceSettings(rollEvent.player);
            if (diceSettings != null) {
                //window.fancyDice.logger.debug(\`Dice settings for player \${rollEvent.player}:\`, diceSettings);
            } else {
                window.fancyDice.logger.warn(\`No dice settings found for player \${rollEvent.player}\`);
            }
            const customDice = window.fancyDice.getCustomDice(diceSettings, diceToRoll);
            let geometry;
            let materials;
            let color = playerColor;
            if (customDice != null && customDice[diceToRoll] != null) {
                geometry = customDice[diceToRoll].geometry;
                materials = customDice[diceToRoll].materials;
                if (customDice.useColor) {
                    if (diceSettings.useDiceColorOverride && diceSettings.diceOverrideColor != null) {
                        color = new THREE.Color(+("0x" + diceSettings.diceOverrideColor.replace("#", "")));
                    }
                } else {
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
            diceModel.maxroll = parseInt(diceToRoll.replace("d", ""), 10);
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
};

export default createShape;