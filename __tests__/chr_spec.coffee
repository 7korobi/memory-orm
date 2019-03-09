require "./models/index"
Mem = require "../src/index"

describe "faces", ->
  name_head = Mem.Query.faces.reduce.name_head
  test 'name_blank snapshot', ->
    expect Mem.Query.faces.name_blank()
    .toMatchSnapshot()

  test 'reduce name_head snapshot', ->
    _data =
      for o in name_head
        if o
          for oo in o
            [oo.id, oo.set]
    expect _data
    .toMatchSnapshot()

  Mem.Query.tags.ids.map (tag)->
    data = Mem.Query.faces.tag(tag).pluck("id", "name", "chr_jobs.list", "chr_npcs.list")

    test "reduce.tag[#{tag}] snapshot", ->
      o = Mem.Query.faces.reduce.tag[tag]
      expect [tag, o.count, o.set]
      .toMatchSnapshot()

    test ".tag(#{tag}) id snapshot", ->
      _data =
        for o in data
          o[0]
      expect _data
      .toMatchSnapshot()

    test ".tag(#{tag}) name snapshot", ->
      _data =
        for o in data
          o[1]
      expect _data
      .toMatchSnapshot()

    test ".tag(#{tag}) job snapshot", ->
      _data =
        for o in data
          for oo in o[2]
            oo.job
      expect _data
      .toMatchSnapshot()

    test ".tag(#{tag}) npc snapshot", ->
      _data =
        for o in data
          for oo in o[3]
            [oo.label, oo.say_0, oo.say_1]
      expect _data
      .toMatchSnapshot()

  Mem.Query.tags.ids.map (tag)->
    data = Mem.Query.faces.name_head(tag)
    test ".name_head(#{tag}) snapshot", ->
      _data =
        for o in data
          if o
            for oo in o
              [oo.id, oo.set]
      expect _data
      .toMatchSnapshot()
