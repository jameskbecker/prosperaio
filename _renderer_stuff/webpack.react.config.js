const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        mainFields: ['main', 'module', 'browser'],
    },
    entry: './renderer/app.tsx',
    target: 'electron-renderer',

    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader'
            }
        }]
    },
    devServer: {
        contentBase: path.join(__dirname, '../build/renderer'),
        historyApiFallback: true,
        compress: true,
        hot: true,
        port: 4000,
        disableHostCheck: true,
        publicPath: '/'
    },
    output: {
        path: __dirname + '/dist',
        filename: 'js/react.js',
        publicPath: './'
    },
    plugins: [
        new HtmlWebpackPlugin()
    ]
}