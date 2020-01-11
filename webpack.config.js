const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const sourceOutputPath = path.join(path.resolve(__dirname), "build");

module.exports = () => {
    const entry = {};
    const staticFiles = {};

    // Helper functions
    const addStaticFile = (sourcePath, mappedName) => staticFiles[mappedName] = sourcePath;
    const addEntryPoint = (sourcePath, mappedName) => entry[mappedName] = sourcePath;
    const addStaticFolder = (sourcePath, mappedName) => {
        if (!sourcePath.endsWith("/")) {
            sourcePath += "/";
        }
        if (mappedName == null) {
            mappedName = sourcePath;
        }
        if (!mappedName.endsWith("/")) {
            mappedName += "/";
        }
        fs.readdirSync(sourcePath).forEach(f => {
            const subSourcePath = sourcePath + f;
            const subMappedName = mappedName + f;
            if (fs.lstatSync(subSourcePath).isDirectory()) {
                addStaticFolder(subSourcePath, subMappedName);
                return;
            }
            addStaticFile(subSourcePath, subMappedName);
        });
    };

    addStaticFile("./src/manifest.json", "manifest.json");
    addStaticFile("./src/popup/popup.html", "./popup/popup.html");
    addStaticFile("./src/popup/popup.css", "./popup/popup.css");
    addStaticFolder("./src/welcome/", "./welcome/");
    addStaticFolder("./assets/");
    addEntryPoint("./src/background/background.js", "background.js");
    addEntryPoint("./src/content-script/content-script.js", "content-script.js");
    addEntryPoint("./src/post-injection/post-injection.js", "post-injection.js");
    addEntryPoint("./src/popup/popup.js", "./popup/popup.js");

    return {
        mode: "development",
        context: __dirname,
        node: {__filename: true, __dirname: true},
        target: "web",
        entry: entry,
        output: {
            path: sourceOutputPath,
            filename: "[name]",
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: "babel-loader",
                    }],
                }
            ],
        },
        resolve: {
            extensions: [".js"],
            modules: [
                "src",
                "node_modules",
            ],
        },
        plugins: [
            new CopyWebpackPlugin(Object.keys(staticFiles).reduce((accum, mappedName) => {
                accum.push({
                    from: staticFiles[mappedName],
                    to: path.join(sourceOutputPath, mappedName)
                });
                return accum;
            }, [])),
        ],
        devtool: "sourcemap"
    };
};
