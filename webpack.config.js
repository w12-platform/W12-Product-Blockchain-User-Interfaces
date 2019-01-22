const path = require("path");

const webpack = require("webpack");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const resolvePublicPath = (env) => {
    const _default = '/build/';

    switch(env) {
        case 'production':
            return (
                process.env.WEBPACK_PUBLIC_PATH_PRODUCTION
                || process.env.WEBPACK_PUBLIC_PATH
                || _default
            );
        case 'development':
            return (
                process.env.WEBPACK_PUBLIC_PATH_DEVELOPMENT
                || process.env.WEBPACK_PUBLIC_PATH
                || _default
            );
        default:
            return (
                process.env.WEBPACK_PUBLIC_PATH
                || _default
            );
    }
};
const validateBlockchainNetId = (id) => {
    if (id != 1 && id != 4 && id != 5777) throw new Error(`blockchain network id ${id} is not supported`);
};

const MODE = process.env.NODE_ENV || 'development'; // production || development
const ROOT_PATH = path.join(__dirname, "/");
const BUILD_DIR_PATH = path.join(__dirname, '/build');
const publicPath = resolvePublicPath(MODE);
const blockchainNetworkId = process.env.BLOCKCHAIN_NETWORK_ID || '4';

validateBlockchainNetId(blockchainNetworkId);

console.log('Building client for blockchain network with id: ', blockchainNetworkId);

module.exports = [
    {
        name: "App",
        mode: MODE,
        entry: './src/app.js',
        output: {
            path: BUILD_DIR_PATH,
            publicPath,
            filename: "App.js",
            chunkFilename: "[id].[contenthash].chunk.js"
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
                BLOCKCHAIN_NETWORK_ID: blockchainNetworkId,
                BLOCKCHAIN_NETWORK_1_PROVIDER: JSON.stringify(process.env.BLOCKCHAIN_NETWORK_1_PROVIDER),
                BLOCKCHAIN_NETWORK_4_PROVIDER: JSON.stringify(process.env.BLOCKCHAIN_NETWORK_4_PROVIDER),
                BLOCKCHAIN_NETWORK_5777_PROVIDER: JSON.stringify(process.env.BLOCKCHAIN_NETWORK_5777_PROVIDER),
                TRANSLATIONS_JSON_URL: JSON.stringify(process.env.TRANSLATIONS_JSON_URL)
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
