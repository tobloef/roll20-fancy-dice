const shorterLoadingScreen = {
    find: `"You will join the game shortly..."),i=6e4)`,
    replace: `"You will join the game shortly..."),i=1000)`,
};

const exposeD20 = {
    find: "getPointer,degreesToRadians;",
    replace: "getPointer,degreesToRadians;window.d20=d20;window.exports=exports;",
    urlIncludes: "assets/app.js",
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
    exposeD20
]