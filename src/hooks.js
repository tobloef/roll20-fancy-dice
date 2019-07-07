const jsonReady = {
    name: "jsonReady",
    urlIncludes: "https://app.roll20.net/v2/js/jquery-1.9.1.js",
    find: "jQuery.ready.promise().done( fn );",
    replace: `
        if(!window.r20esChrome) window.r20esChrome = {};
        if(!window.r20esChrome.readyCallbacks) window.r20esChrome.readyCallbacks = [];
        window.r20esChrome.readyCallbacks.push(fn);
    `,
};

const threeJSAllowCrossOrigin = {
    name: "threeJSAllowCrossOrigin",
    urlIncludes: "https://app.roll20.net/assets/app.js",
    find: `var e=new THREE.JSONLoader,t="js/models/";`,
    replace: `var e=new THREE.JSONLoader,t="js/models/";e.crossOrigin="";`,
};

const exposeD20 = {
    name: "exposeD20",
    urlIncludes: "https://app.roll20.net/assets/app.js",
    find: "getPointer,degreesToRadians;",
    replace: "getPointer,degreesToRadians;window.d20=d20;window.exports=exports;",
};

const disableDiceColors = {
    name: "disableDiceColors",
    urlIncludes: "https://app.roll20.net/assets/app.js",
    find: `s.material.materials[d].color=l,s.material.materials[d].ambient=l,`,
    replace: ``,
};

export default [
    jsonReady,
    threeJSAllowCrossOrigin,
    exposeD20,
    disableDiceColors,
]