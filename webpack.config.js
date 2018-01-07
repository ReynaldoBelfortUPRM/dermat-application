var webpack = require('webpack');

module.exports = {
  entry: {
  app: ['webpack/hot/dev-server', './src/entry.js'],    //Application source file (ReactJS app) goes here
  // app: './src/entry.js'
},

output: {
  path: __dirname + '/public/built',                    //Build path goes here
  filename: 'bundle.js',
  publicPath: 'http://localhost:8080/built/'
},

devServer: {
  contentBase: './public',
  publicPath: 'http://localhost:8080/built/'
},

module: {
//  loaders: [
//    { 
//     test: /\.js$/, 
//     exclude: /node_modules/,
//     loader: 'babel-loader',     
//     },
//     {
//       test: /\.css$/,
//       loader: 'style-loader'
//     }, 
//     {
//       test: /\.css$/,
//       loader: 'css-loader',
//       query: {
//         modules: true,
//         localIdentName: '[name]__[local]___[hash:base64:5]'
//       }
//     }
//  ],
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
            test: /\.(svg)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "react-svg-loader",
                options: {
                  jsx: true // outputs JSX tags when set to true
                }
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
        }
        
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