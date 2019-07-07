const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = () => {
    const entry = {};
    const staticFiles = {};

    const addStaticFile = (mappedName, sourcePath) => staticFiles[mappedName] = sourcePath;
    const addEntryPoint = (mappedName, sourcePath) => entry[mappedName] = sourcePath;
    const addStaticFolder = (root) => {
        fs.readdirSync(root).forEach(f => {
            const rootFile = root + f;
            if (fs.lstatSync(rootFile).isDirectory()) {
                return;
            }
            addStaticFile(f, rootFile);
        });
    };

    //addStaticFolder("./css/");

    addStaticFile("manifest.json", "./src/manifest.json");

    {
        const root = "./src/entrypoints/";
        fs.readdirSync(root).forEach(f => {
            const rootFile = root + f;
            if (fs.lstatSync(rootFile).isDirectory()) return;

            addEntryPoint(f, rootFile);
        });
    }

    const sourceOutputPath = path.join(path.resolve(__dirname), "build");

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
