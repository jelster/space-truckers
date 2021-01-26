const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const fs = require('fs');

module.exports = env => {
    const prodConfig = {
        mode: "production",
        devtool: "source-map"
    };
    return merge(common, prodConfig);
};