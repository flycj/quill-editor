const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const merge = require('webpack-merge');
const pkg = require('./package.json');
const isProd = process.env.NODE_ENV === 'production';

const jsRules = {
  test: /\.js$/,
  include: /src/,
  use: 'babel-loader',
};

const svgRules = {
  test: /\.svg$/,
  include: [path.resolve(__dirname, 'src/editor/assets/icons')],
  use: [
    {
      loader: 'html-loader',
      options: {
        minimize: true,
      },
    },
  ],
};

const styleRules = {
  test: /\.scss$/,
  include: [path.resolve(__dirname, './src')],
  exclude: /node_modules/,
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
};

const tsRules = {
  test: /\.ts$/,
  use: 'ts-loader',
};

const baseConfig = {
  context: path.resolve(__dirname, 'src'),
  entry: {
  	'index': './index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      'Editor': path.resolve(__dirname, 'src/editor/')
    },
    extensions: ['.js', '.ts', '.scss'],
  },
  module: {
    rules: [jsRules, styleRules, svgRules, tsRules],
    noParse: [
      /\/node_modules\/clone\/clone\.js$/,
      /\/node_modules\/eventemitter3\/index\.js$/,
      /\/node_modules\/extend\/index\.js$/,
    ],
  },
  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: '[name].css',
    // }),
    new MiniCssExtractPlugin('[name].css'),
    // new ExtractTextWebpackPlugin({
    //   filename: '[name].css',
    //   allChunks: true,
    // }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public' ,'index.html'),
      filename: './index.html',
      chunks: ['index'],
      hash: true
    }),
  ],
  devServer: {
    watchContentBase: true,
    contentBase: path.resolve(__dirname, 'dist'),
    port: process.env.npm_package_config_ports_webpack,
    publicPath: '/',
    hot: true,
    // stats: 'minimal',
    // disableHostCheck: true,
  },
};


var config;
if (isProd) {
  config = {
    ...baseConfig, 
    mode: 'production',
    entry: { 
      'quill.min': './editor/quill.js',
      'quill.core': ['./editor/core.js'],

      // 'quill.core': './editor/assets/core.scss',
      'quill.bubble': './editor/assets/bubble.scss',
      'quill.snow': './editor/assets/snow.scss'
    },
    output: {
      filename: '[name].js',
      library: 'Quill',
      libraryExport: 'default',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.BannerPlugin({
        banner: [
          `Quill Editor v${pkg.version}`,
          'https://quilljs.com/',
          'Copyright (c) 2014, Jason Chen',
          'Copyright (c) 2013, salesforce.com',
        ].join('\n'),
        entryOnly: true,
      }),
      new webpack.DefinePlugin({
        QUILL_VERSION: JSON.stringify(pkg.version),
      }),
      new FixStyleOnlyEntriesPlugin(),
      new MiniCssExtractPlugin('[name].css'),
      new CleanWebpackPlugin(),
    ],
    devtool: 'none'
  }
} else {
  config = merge(baseConfig, {
    devtool: 'cheap-eval-source-map',
    mode: 'development',
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  });
}

module.exports = config;