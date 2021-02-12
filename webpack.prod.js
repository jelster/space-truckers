const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const prodConfig = {
    mode: "production"
};
module.exports = merge(common, prodConfig);