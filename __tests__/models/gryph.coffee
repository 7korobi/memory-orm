{ Set, Model, Query, Rule } = require "../../src/index"

new Rule("point").schema ->
  @struct 'x', 'y', 'r', 'color', ->
    @.join "*" 

new Rule("line").schema ->
  @struct ->
    @.join "*" 

new Rule("delta").schema ->
  @struct ->
    @.join "*" 

Set.point.reset [
  [ 1, 1]
  [ 1,-1]
  [-1, 1]
  [-1,-1]
]

Set.line.reset [
  [[ 1, 1], [-1,-1]]
  [[ 1,-1], [-1, 1]]
  [[ 1, 1],[ 1,-1],[-1, 1],[-1,-1]]
]
