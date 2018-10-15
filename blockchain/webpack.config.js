const path = require("path");

const webpack = require("webpack");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const MODE = process.env.NODE_ENV || 'development'; // production || development
const ROOT_PATH = path.resolve("../");
const BUILD_DIR_PATH = path.join(ROOT_PATH, 'blockchain/build');
const publicPath = MODE === 'production' ? '/blockchain/build/' : '/blockchain/build/'

module.exports = [
    {
        name: "App",
        mode: MODE,
        entry: './src/components/App.js',
        output: {
            path: BUILD_DIR_PATH,
            publicPath,
            filename: "App.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store"),
                'plugin': path.join(__dirname, "src/plugin")
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
                PACKAGE_JSON_PATH: JSON.stringify('/blockchain/package.json'),
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
