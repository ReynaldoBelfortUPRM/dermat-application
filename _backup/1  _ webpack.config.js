var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
  app: ['webpack/hot/dev-server', './javascripts/entry.js'],
},

output: {
  path: './public/built',
  filename: 'bundle.js',
  publicPath: 'http://localhost:8080/built/'
},

devServer: {
  contentBase: './public',
  publicPath: 'http://localhost:8080/built/'
},

module: {
 loaders: [
   { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
   {
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['react', 'es2015', 'stage-1']
      }
    },
    {
      test: /\.css$/,
      loader: 'style-loader'
    }, 
    {
      test: /\.css$/,
      loader: 'css-loader',
      query: {
        modules: true
      }
    },
    {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract("style-loader","css-loader")
    }
 ],
 resolve: {
        extensions: ['', '.js', '.jsx', '.css'],
        modulesDirectories: [
          'node_modules'
        ]        
    }
},
 plugins: [
   new webpack.HotModuleReplacementPlugin()
 ]
}