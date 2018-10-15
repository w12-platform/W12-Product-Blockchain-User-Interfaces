let path = require("path");
//let webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const MODE = "development"; //production || development

module.exports = [
    {
        name: "App",
        mode: MODE,
        entry: './src/components/App.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "App.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, "src"),
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
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.scss$/,
                    use: [
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
            new VueLoaderPlugin()
        ],
        devServer: {
            contentBase: path.join(__dirname, '../'),
            publicPath: '/blockchain/build/',
            compress: true,
            port: 8090,
            proxy: {
                "/ru/api": "http://[::1]:3000"
            }
        }
    },
];