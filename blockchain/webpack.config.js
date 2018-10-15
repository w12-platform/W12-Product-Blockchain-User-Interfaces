const ROOT_PATH = "/";
const PACKAGE_JSON_PATH = ROOT_PATH + "blockchain/package.json";

let path = require("path");
let webpack = require("webpack");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const MODE = "development"; //production || development

module.exports = [
    {
        name: "App",
        mode: MODE,
        entry: './src/components/App.js',
        output: {
            path: path.join(ROOT_PATH, 'blockchain/build'),
            publicPath: path.join(ROOT_PATH, 'blockchain/build'),
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
                ROOT_PATH: JSON.stringify(ROOT_PATH),
                PACKAGE_JSON_PATH: JSON.stringify(PACKAGE_JSON_PATH),
            }),
        ],
        devServer: {
            contentBase: "../",
            publicPath: path.join(ROOT_PATH, 'blockchain/build/'),
            compress: true,
            port: 8090,
        }
    },
];