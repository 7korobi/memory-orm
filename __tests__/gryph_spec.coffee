require "./models/index"
Mem = require "../src/index"

describe "gryph", ->
  test 'points snapshot', ->
    expect Mem.Query.points.reduce
    .toMatchSnapshot()
    return

  test 'point structure snapshot', ->
    expect Mem.Query.points.pluck "id", "x", "y"
    .toMatchSnapshot()
    return

  test 'lines snapshot', ->
    expect Mem.Query.lines.reduce
    .toMatchSnapshot()
    return

  test 'deltas snapshot', ->
    expect Mem.Query.deltas.reduce
    .toMatchSnapshot()
    return

  return