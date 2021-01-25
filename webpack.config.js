const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = env => {
    const appDirectory = fs.realpathSync(process.cwd());
    const isProduction = env.production;
    return {
        entry: path.resolve(appDirectory, "src/index.js"),
        output: {
            filename: "js/babylonBundle.js",
            path: path.resolve("./dist")
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: path.resolve("public/index.html"),
                inject: true
            })
        ]
    };
};