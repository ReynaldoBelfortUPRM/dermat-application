var webpack = require('webpack');

module.exports = {
  entry: {
  app: ['webpack/hot/dev-server', './src/dermat-app.js'],    //Application source file (ReactJS app) goes here
  // app: './src/dermat-app.js'
},

output: {
  path: __dirname + '/dist/built',                    //Build path goes here
  filename: 'bundle.js',
  publicPath: 'http://localhost:8080/built/'
},

devServer: {
  contentBase: './dist',
  publicPath: 'http://localhost:8080/built/'
},

module: {
  rules: [

        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          }
        }, 
        {
          test: /\.css$/,
          exclude: /node_modules/,
          // use: [ 'style-loader', 'css-loader' ]
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]__[local]___[hash:base64:5]'
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'svg-react-loader'
            }
          ]
        },
        {
          test: /\.(png|jpg|gif)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'file-loader',
              options: {}  
            }
          ]
        },
               
      ]

  },
 plugins: [
   new webpack.HotModuleReplacementPlugin(),
 ],

 node: {
        fs: "empty"
      },
 target: 'node',
}