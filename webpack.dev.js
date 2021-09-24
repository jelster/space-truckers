const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

const appDirectory = __dirname;
const devConfig = {
    mode: "development",
    devtool: "inline-source-map",
    devServer:  {
        static: {
            directory: path.join(appDirectory, 'public')
        },
        hot: true,
        open: true
    }
};
module.exports = merge(common, devConfig);