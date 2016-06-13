var path              = require('path');
var autoprefixer      = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: ['./src/main.js']
  },
  output: {
    path: require('path').resolve('build'),
    filename: 'bundle.js'
  },
  resolve: {
    modulesDirectories: ["node_modules", "src"]
  },
  module: {
    loaders: [
      // Javascripts
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      // JSON
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json-loader'
      },
      // Styles
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!postcss-loader!stylus-loader?paths=' + path.resolve("src/styles")
      },
      // HTML
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      // Files
      {
        test: /\.jpg$|\.gif$|\.png$|\.woff$|\.woff2$|\.ttf$|\.svg$|\.eot$|\.wav$|\.mp3$|\.bin$/,
        loader: "file?name=[path][name].[ext]"
      },
      // GLSL
      {
        test: /\.vert$|\.frag$/,
        loader: 'glsl-loader'
      }
    ],
    noParse: []
  },
  postcss: function () {
    return [autoprefixer];
  },
  plugins: [
    new HtmlWebpackPlugin({
      favicon: 'favicon.png',
      template: "./src/index.html",
      inject: true
    }),
    new CopyWebpackPlugin([{ from: './src/assets', to: "assets"}])
  ],
  devtool: '#source-map'
};
