import ScriptUrls from "../../shared/script-urls.js";

const createShape = {
    name: "Custom createShape function declaration",
    scriptUrls: [ScriptUrls.APP],
    find: /d20\.tddice\.createShape=[\w\W]+?var .;(.)=!1;var .=\[\];[\w\W]+?THREE.Mesh\((.)[\w\W]+?THREE.MeshFaceMaterial\((.)\[[\w\W]+?(.).replace\("#",""\)[\w\W]+?value\.anisotropy=(.)[\w\W]+?body.material=(.)[\w\W]+?body.position.set\(.+?(.)\(\)[\w\W]+?.body.isPlayingSound=!0,(.+?)\([\w\W]+?,(.)\.add\(.\),(.)\.push[\w\W]+?;var (.)={}/,
    // language=JavaScript
    replaceWith: `        
    d20.tddice.createShape = function (rollEvent, diceToRoll, coord1, coord2, coord3, coord4, prom) {
        let playerColorString = $4;
        let diceGeometries = $2;
        let diceMaterials = $3;
        let anisotropy = $5;
        let bodyMaterial = $6;
        let scene = $9;
        let dice = $10;
        
        $1 = false;
        const allDiceToRoll = "d100" === diceToRoll ? ["dpct10s", "dpct1s"] : [diceToRoll];
        _.each(allDiceToRoll, (diceToRoll) => {
            const playerColor = new THREE.Color(+("0x" + playerColorString.replace("#", "")));
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
            if (diceSettings != null) {
                if (diceSettings.useDiceColorOverride && diceSettings.diceOverrideColors != null) {
                    const diceType = diceSettings.useIndividualDice ? diceToRoll : "all";
                    const diceOverrideColor = diceSettings.diceOverrideColors[diceType];
                    if (diceOverrideColor != null) {
                        color = new THREE.Color(+("0x" + diceOverrideColor.replace("#", "")));
                    } else {
                        color = new THREE.Color("black");
                    }
                }
            }
            if (customDice != null && customDice[diceToRoll] != null) {
                geometry = customDice[diceToRoll].geometry;
                materials = customDice[diceToRoll].materials;
                if (!customDice.useColor) {
                    color = white;
                }
            } else {
                window.fancyDice.logger.warn("No custom", diceToRoll, "found for player", rollEvent.player);
                geometry = diceGeometries[diceToRoll];
                materials = diceMaterials[diceToRoll];
            }
            const diceModel = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            diceModel.castShadow = false;
            for (let d = 0; d < diceModel.material.materials.length; d++) {
                diceModel.material.materials[d].color = color;
                diceModel.material.materials[d].ambient = color;
                if (diceModel.material.materials[d].uniforms) {
                    diceModel.material.materials[d].uniforms.tDiffuse.value.anisotropy = anisotropy;
                }
            }
            diceModel.promise = prom;
            if ("d6" === diceToRoll) {
                diceModel.scale.set(1.4, 1.4, 1.4);
            } else {
                diceModel.scale.set(1.7, 1.7, 1.7);
            }
            diceModel.dicetype = diceToRoll;
            diceModel.maxroll = parseInt(diceToRoll.replace("d", ""), 10);
            const vertices = geometry.vertices;
            const faces = geometry.faces;
            const cannons = [];
            const faceSomethings = [];
            for (let b = 0; b < vertices.length; b++) {
                cannons.push(new CANNON.Vec3(
                    vertices[b].x * diceModel.scale.x,
                    vertices[b].y * diceModel.scale.y,
                    vertices[b].z * diceModel.scale.z
                ));
            }
            for (let b = 0; b < faces.length; b++) {
                faceSomethings.push([faces[b].a, faces[b].b, faces[b].c]);
            }
            diceModel.body = new CANNON.Body({
                mass: 1e3
            });
            diceModel.body.material = bodyMaterial;
            const polyhedron = new CANNON.ConvexPolyhedron(cannons, faceSomethings);
            diceModel.body.addShape(polyhedron, 0);
            diceModel.body.position.set(coord1.x + (20 * $7() - 10), coord1.y, coord1.z + (20 * $7() - 10));
            diceModel.body.quaternion.setFromAxisAngle(new CANNON.Vec3(coord4.x, coord4.y, coord4.z), coord4.a * Math.PI * 2);
            diceModel.body.angularVelocity.set(coord3.x, coord3.y, coord3.z);
            diceModel.body.velocity.set(coord2.x, coord2.y, coord2.z);
            diceModel.body.linearDamping = 0.25;
            diceModel.body.angularDamping = 0.25;
            diceModel.body.isPlayingSound = false;
            diceModel.body.addEventListener("collide", (collideEvent) => {
                const diceid = collideEvent.contact.bj.id;
                const colidedwithid = collideEvent.contact.bi.id;
                const maxvel = Math.max(Math.abs(coord2.x), Math.abs(coord2.y));
                if (!diceModel.body.isPlayingSound) {
                    diceModel.body.isPlayingSound = true;
                    $8(diceid, diceModel.dicetype, colidedwithid, maxvel)
                }
            });
            diceModel.visible = false;
            scene.add(diceModel);
            dice.push(diceModel);
            d20.tddice.world.add(diceModel.body);
        })
    };
    var $11 = {}
    `,
};

export default createShape;