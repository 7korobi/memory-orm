nodeExternals = require 'webpack-node-externals'
path = require 'path'
current = process.cwd()
root = path.join current, "__tests__"

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

yml =
  test: /\.yml$/
  loader: 'json-loader!yaml-loader'


module.exports =
  mode: 'development'
  devtool: 'source-map'
  entry:
    "__tests__/index_spec":  './__tests__/index_spec.coffee'
    "__tests__/chr_spec":    './__tests__/chr_spec.coffee'
    "__tests__/sort_spec":   './__tests__/sort_spec.coffee'
    "__tests__/list_spec":   './__tests__/list_spec.coffee'
    "__tests__/memory_spec": './__tests__/memory_spec.coffee'
    "__tests__/reduce_spec": './__tests__/reduce_spec.coffee'
    "__tests__/format_spec": './__tests__/format_spec.coffee'

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
