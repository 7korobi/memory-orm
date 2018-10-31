require "./models/index"
Mem = require "../src/index"

keys = [
  "tags", "chr_sets", "chr_npcs", "chr_jobs", 
]

describe "faces", ->
  test 'reduce snapshot', ->
    expect Mem.Query.faces.reduce.tag
    .toMatchSnapshot()

    expect Mem.Query.faces.reduce.name_head
    .toMatchSnapshot()

keys.map (key)->
  describe key, ->
    test 'reduce snapshot', ->
      expect Mem.Query[key].reduce
      .toMatchSnapshot()
