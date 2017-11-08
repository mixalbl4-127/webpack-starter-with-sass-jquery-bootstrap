var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var path = require('path');
var helpers = require('./helpers');

module.exports = function (env) {
    if (!env) env = { prod: false };
    return {
        devtool: env.prod ? 'source-map' : 'inline-source-map',

        output: {
            path: helpers.root('dist'),
            publicPath: '',
            filename: env.prod ? '[name].[hash].js' : '[name].js',
            chunkFilename: env.prod ? '[id].[hash].chunk.js' : '[id].chunk.js'
        },

        entry: {
            'vendor': './src/vendor.ts',
            'app': './src/main.ts'
        },

        resolve: {
            modules: [
                path.join(__dirname, "src"),
                "node_modules"
            ]
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader'
                },
                {
                    test: /\.html$/,
                    use: 'html-loader'
                },
                {
                    test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                    use: 'file-loader?name=assets/[name].[hash].[ext]'
                },
                {
                    test: /\.css$/,
                    exclude: helpers.root('src', 'app'),
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: "css-loader",
                        // publicPath: "/dist"
                    })
                },
                // For include to <style> tag!
                // {
                //     test: /\.sass/,
                //     loader: 'style!css!extract!css!sass-loader'
                // }
                // For create .css file!
                {
                    test: /\.(scss)|\.(sass)$/,
                    use:
                        ExtractTextPlugin.extract(
                            {
                                fallback: "style-loader",
                                use: [
                                    {
                                        loader: 'css-loader', // translates CSS into CommonJS modules
                                        options: {
                                            sourceMap: true
                                        }
                                    }, {
                                        loader: 'postcss-loader', // Run post css actions
                                        options: {
                                            sourceMap: true,
                                            plugins: function () { // post css plugins, can be exported to postcss.config.js
                                                return [
                                                    require('precss'),
                                                    require('autoprefixer')
                                                ];
                                            }
                                        }
                                    }, {
                                        loader: 'sass-loader', // compiles SASS to CSS
                                        options: {
                                            sourceMap: true
                                        }
                                    }
                                ],
                                // publicPath: "/dist"
                            }
                        )
                },
            ]
        },

        plugins: [
            new CleanWebpackPlugin([ 'dist' ], {
                root: helpers.root(),
                verbose: true,
                dry: false
            }),

            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                Popper: [ 'popper.js', 'default' ],
                // In case you imported plugins individually, you must also require them here:
                // Util: "exports-loader?Util!bootstrap/js/dist/util",
                // Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
            }),

            new webpack.optimize.CommonsChunkPlugin({
                name: [ 'app', 'vendor' ]
            }),

            new HtmlWebpackPlugin({
                template: './src/index.html'
            }),

            new ExtractTextPlugin(env.prod ? '[name].[hash].css' : '[name].css'),
        ].concat(
            env.prod ?
                // PROD plugins
                [
                    new webpack.NoEmitOnErrorsPlugin(),
                    new webpack.optimize.UglifyJsPlugin({
                        uglifyOptions: {
                            compress: true
                        },
                        minimize: true,
                        sourceMap: true
                    }),
                    new webpack.LoaderOptionsPlugin({
                        options: {
                            htmlLoader: {
                                whateverProp: true
                            }
                        }
                    })
                    // new webpack.DefinePlugin({
                    //     'process.env': {
                    //         'ENV': JSON.stringify(ENV)
                    //     }
                    // })
                ]
                :
                // DEV plugins
                []
        ),
        devServer:
            env.prod ?
                {}
                :
                {
                    historyApiFallback: true,
                    stats: 'minimal'
                }
    }
};
