const webpack = require('webpack');
const config = {
    entry: __dirname + '/js/index.jsx',
    output: {
        path: __dirname + '/dist', // THIS MIGHT HAVE BEEN THE DOCKER ISSUE
        filename: 'bundle.js', 
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    module: {
        rules: [
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }
        ]
    }
};

module.exports = config;
