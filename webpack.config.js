const path = require("path");

const webpack = require("webpack");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const MODE = process.env.NODE_ENV || 'development'; // production || development
const ROOT_PATH = path.join(__dirname, "/");
const BUILD_DIR_PATH = path.join(__dirname, '/build');
const publicPath = MODE === 'production' ? '/build/' : '/build/';

module.exports = [
    {
        name: "App",
        mode: MODE,
        entry: './src/app.js',
        output: {
            path: BUILD_DIR_PATH,
            publicPath,
            filename: "App.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, "src"),
                'src': path.join(__dirname, "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store"),
                'plugin': path.join(__dirname, "src/plugin"),
                'abi': path.join(__dirname, "protocol/abi"),
            }
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: "vue-loader"
                },
                {
                    test: /\.(scss|css)$/,
                    use: [
                        "style-loader",
                        "vue-style-loader",
                        "css-loader",
                        "sass-loader"
                    ]
                },
                {
                    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                    loader: 'url-loader',
                },
                {
                    test: /\.svg$/,
                    loader: 'svg-inline-loader'
                }
            ]
        },
        plugins: [
            new VueLoaderPlugin(),
            new webpack.DefinePlugin({
                ROOT_PATH: JSON.stringify('/'),
                PACKAGE_JSON_PATH: JSON.stringify('package.json'),
            }),
        ],
        devServer: {
            contentBase: ROOT_PATH,
            publicPath,
            compress: true,
            port: 8090,
        }
    },
];
