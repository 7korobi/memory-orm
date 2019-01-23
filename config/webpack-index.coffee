nodeExternals = require 'webpack-node-externals'
path = require 'path'
current = process.cwd()

coffee =
  test: /\.coffee$/
  loader: 'coffee-loader'
  options:
    transpile:
      plugins: [
        "@babel/plugin-transform-modules-commonjs"
      ]
      presets: [
        ["env", 
          targets:
            node: "6.11.5"
        ]
      ]

module.exports =
  mode: 'production'
  target: 'node' # Important
  devtool: 'source-map'
  entry:
    "lib/index.min":  './src/index.coffee'
  output:
    path: current
    filename: '[name].js' # Important
    library: 'Mem'
    libraryTarget: 'umd' # Important

  module:
    rules: [
      coffee
    ]

  resolve:
    extensions: [ '.coffee', '.js' ]

  externals: [nodeExternals()] # Important
