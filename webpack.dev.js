const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const fs = require('fs');

module.exports = env => {
    const appDirectory = fs.realpathSync(process.cwd());
    const devConfig = {
        mode: "development",
        devtool: "inline-source-map",
        devServer:  {
            contentBase: path.resolve(appDirectory, "public"),
            compress: true,
            hot: true,
            open: true
        }
    };
    return merge(common, devConfig);
};