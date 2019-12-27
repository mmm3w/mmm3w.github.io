
var path = require('path');
var glob = require('glob');

var entries = {};

glob.sync("./live2d/Framework/**/*.ts").map(
    function (file) {
        const regEx = new RegExp(`./live2d/Framework`);
        const key = file.replace(regEx, '').replace('.ts', '');
        entries[key] = file;
    }
);

module.exports = {
    mode: 'development',
    entry: entries,
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist/framework/src')
    },
    module: {
        rules: [{ test: /\.ts$/, use: 'ts-loader' }]
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts',]
    }
}