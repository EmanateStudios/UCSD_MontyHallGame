const path = require('path');

module.exports = {
    mode: 'none',
    entry: {
        app: './public/js_files/game_justChest.js'
    },
    output: {
        path: path.resolve(__dirname, 'public', 'js_files'),
        filename: 'game.bundle.js'
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env']
                }
            }]
        },
        // {
        //     test: /\.gltf?$/,
        //     use: [{
        //         loader: "gltf-webpack-loader",
        //         options:{esModule:false}
        //     }]
        // },
        {
            test: /\.(png|jpe?g|gif|glb|bin)$/i,
            use: [
                {
                    loader: 'file-loader',
                    options: { esModule: false }
                }
            ]
        },
        {
            test: /three\/examples\/js/,
            use: 'imports-loader?THREE=three'
        }
        ]
    }
}