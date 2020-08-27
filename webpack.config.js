const path = require('path');

module.exports = {
    mode: 'development',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: 'source-map',
    entry: ['@babel/polyfill', './main/index.ts'],
    target: 'electron-main',
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                use: {
                    loader: 'babel-loader',
                },
                exclude: /node_modules/
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    stats: 'errors-only'
}