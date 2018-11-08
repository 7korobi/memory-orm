nodeExternals = require 'webpack-node-externals'
path = require 'path'
current = process.cwd()

coffee =
  test: /\.coffee$/
  loader: 'coffee-loader'
  options:
    transpile:
      plugins: [
        "transform-es2015-modules-commonjs"
      ]
      presets: [
        ["env", 
          targets:
            node: "10.4.1"
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
