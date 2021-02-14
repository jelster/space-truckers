const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const appDirectory = __dirname;

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "js/babylonBundle.js",
        path: path.resolve(appDirectory, "dist")
    },
    resolve: {
        extensions: [".ts", ".js"],
        fallback: {
            fs: false,
            path: false,
        },
    },
    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                loader: "source-map-loader",
                enforce: "pre",
            },
            {
                test: /\.(png|jpg|gif|env|glb|stl|m4a|mp3)$/i,
                type: "asset/resource"
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(appDirectory, "public/index.html"),
            inject: true
        })
    ]
};