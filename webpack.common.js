const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = env => {
    const appDirectory = fs.realpathSync(process.cwd());
    return {
        entry: path.resolve(appDirectory, "src/index.js"),
        output: {
            filename: "js/babylonBundle.js",
            path: path.resolve("./dist/")
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
                    test: /\.(png|jpg|gif|env|glb|stl)$/i,
                    use: [
                        {
                            loader: "url-loader",
                            options: {
                                limit: 8192,
                            },
                        },
                    ],
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
};