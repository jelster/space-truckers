const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const appDirectory = __dirname;

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "js/babylonBundle.js",
        path: path.resolve(appDirectory, "dist"),
        assetModuleFilename: 'assets/[name][ext][query]'
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
                test: /\.(png|jpg|gif|env|glb|gltf|env|stl|m4a|mp3|css|dds|wav|ttf|woff|woff2|svg)$/i,
                type: "asset/resource"
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(appDirectory, "public/index.html"),
            inject: true
        }),
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            maximumFileSizeToCacheInBytes: 18388608,
        }),
        new CopyPlugin({
            patterns: [
                { from: path.resolve(appDirectory, 'public/assets/icons'), to: path.resolve(appDirectory, 'dist/assets/icons') },
                { from: path.resolve(appDirectory, 'public/manifest.json'), to: path.resolve(appDirectory, 'dist/manifest.webmanifest') }
            ]
        })
    ]
};