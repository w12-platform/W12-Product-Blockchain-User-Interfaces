let path = require("path");
let webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const MODE = "development"; //production

module.exports = [
    {
        name: "ConfigDashboard",
        mode: MODE,
        entry: './src/components/ConfigDashboard.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "ConfigDashboard.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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
    {
        name: "Factory",
        mode: MODE,
        entry: './src/components/Factory.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "Factory.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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
    {
        name: "AdminDashboard",
        mode: MODE,
        entry: './src/components/AdminDashboard.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "AdminDashboard.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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
    {
        name: "ProjectDashboard",
        mode: MODE,
        entry: './src/components/ProjectDashboard.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "ProjectDashboard.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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
    {
        name: "ProjectDashboardReceiving",
        mode: MODE,
        entry: './src/components/ProjectDashboardReceiving.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "ProjectDashboardReceiving.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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
    {
        name: "ProjectDashboardTranche",
        mode: MODE,
        entry: './src/components/ProjectDashboardTranche.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "ProjectDashboardTranche.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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
    {
        name: "InvestorDashboard",
        mode: MODE,
        entry: './src/components/InvestorDashboard.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "InvestorDashboard.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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
    {
        name: "InvestorDashboardRefund",
        mode: MODE,
        entry: './src/components/InvestorDashboardRefund.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "InvestorDashboardRefund.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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
    {
        name: "InvestorDashboardExchange",
        mode: MODE,
        entry: './src/components/InvestorDashboardExchange.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "InvestorDashboardExchange.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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
    {
        name: "Home",
        mode: MODE,
        entry: './src/components/Home.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/blockchain/build/',
            filename: "Home.js"
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.join(__dirname, '..', "src"),
                'bem': path.join(__dirname, "src/bem"),
                'lib': path.join(__dirname, "src/lib"),
                'store': path.join(__dirname, "src/store")
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