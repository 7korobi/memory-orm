require "./models/index"
Mem = require "../src/index"

describe "path", ->
  test "children snapshot", ->
    expect Mem.Query.paths.pluck("id", "paths.hash")
    .toMatchSnapshot()
  test "parent snapshot", ->
    expect Mem.Query.paths.pluck("id", "path")
    .toMatchSnapshot()
  undefined


