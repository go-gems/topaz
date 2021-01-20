const path = require('path');

module.exports = {
    entry: ['./assets/js/index.js', './assets/scss/style.scss'],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public/dist'),
    },
    module: {
        rules: [
            {
                test: /\.s?[ac]ss$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath:"/css/",
                            name: "style.css"
                        },
                    },
                    "sass-loader"
                ],
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', {
                            targets: {
                                node: "current"
                            },
                            modules: false
                        }]],
                        plugins: ["@babel/plugin-proposal-class-properties"]
                    },

                }
            }
        ],
    },
    optimization: {
        // We no not want to minimize our code.
        minimize: false
    },
};