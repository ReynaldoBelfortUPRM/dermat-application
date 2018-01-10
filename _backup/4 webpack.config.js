var webpack = require('webpack');

module.exports = {
  entry: {
  app: ['webpack/hot/dev-server', './src/entry.js'],
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
   { 
    test: /\.js$/, 
    loader: 'babel-loader', 
    exclude: /node_modules/ 
    },
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
        modules: true,
        localIdentName: '[name]__[local]___[hash:base64:5]'
      }
    }
 ],
 resolve: {
        extensions: ['', '.js', '.jsx', '.css'],
        modulesDirectories: [
          'node_modules'
        ]        
    },
  rules: [
          {
            test: /\.(svg)$/,
            use: [
              {
                loader: "babel-loader"
              },
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
      }
}