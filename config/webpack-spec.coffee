nodeExternals = require 'webpack-node-externals'
path = require 'path'
current = process.cwd()
root = path.join current, "__tests__"

coffee =
  test: /\.coffee$/
  loader: 'babel-loader!coffee-loader'

yml =
  test: /\.yml$/
  loader: 'json-loader!yaml-loader'


module.exports =
  mode: 'production'
  devtool: 'source-map'
  entry:
    "__tests__/index_spec": './__tests__/index_spec.coffee'
  output:
    path: current
    filename: '[name].js' # Important
    libraryTarget: 'this' # Important

  module:
    rules: [
      coffee
      yml
    ]

  resolve:
    extensions: [ '.coffee', 'yml', '.js' ]
    alias:
      '@': root
      '~': root

  externals: [nodeExternals()] # Important
