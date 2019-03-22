const shorterLoadingScreen = {
    find: `"You will join the game shortly..."),i=6e4)`,
    replace: `"You will join the game shortly..."),i=1000)`,
};

const threeJSAllowCrossOrigin = {
    find: `var e=new THREE.JSONLoader,t="js/models/";`,
    replace: `var e=new THREE.JSONLoader,t="js/models/";e.crossOrigin="";`,
};

const exposeD20 = {
    find: "getPointer,degreesToRadians;",
    replace: "getPointer,degreesToRadians;window.d20=d20;window.exports=exports;",
};

const jsonReady = {
    find: "jQuery.ready.promise().done( fn );",
    replace: `
        if(!window.r20esChrome) window.r20esChrome = {};
        if(!window.r20esChrome.readyCallbacks) window.r20esChrome.readyCallbacks = [];
        window.r20esChrome.readyCallbacks.push(fn);
    `,
};

export default [
    jsonReady,
    shorterLoadingScreen,
    threeJSAllowCrossOrigin,
    raiseMax3DDice,
    exposeD20,
]