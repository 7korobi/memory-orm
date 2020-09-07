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
        ["@babel/env", 
          targets:
            node: "6.11.5"
        ]
      ]

typescript =
  test: /\.ts$/
  loader: 'ts-loader'

module.exports =
  mode: 'production'
  devtool: 'source-map'

  target: 'node'
  externals: [nodeExternals()]

  entry:
    "lib/index.min":  './lib/index.coffee'
  output:
    path: current
    filename: '[name].js'
    library: 'Mem'
    libraryTarget: 'umd'

  module:
    rules: [
      coffee
    ]

  resolve:
    extensions: [ '.coffee', '.js' ]


