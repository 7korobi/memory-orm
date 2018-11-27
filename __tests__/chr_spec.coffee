require "./models/index"
Mem = require "../src/index"

describe "faces", ->
  test 'transaction result', ->
    json = JSON.stringify Mem.Query.transaction_chr
    Mem.State.store JSON.parse(json)
    expect(
      true
    ).toMatchSnapshot()

  test 'reduce name_head snapshot', ->
    expect(
      for o in Mem.Query.faces.reduce.name_head
        o?.map (oo)-> [oo.id, oo.set]
    ).toMatchSnapshot()

  Mem.Query.tags.ids.map (tag)->
    test "reduce.tag[#{tag}] snapshot", ->
      o = Mem.Query.faces.reduce.tag[tag]
      expect [tag, o.count, o.set]
      .toMatchSnapshot()
    test ".tag(#{tag}) id snapshot", ->
      expect Mem.Query.faces.tag(tag).pluck("id")
      .toMatchSnapshot()

    test ".tag(#{tag}) name snapshot", ->
      expect Mem.Query.faces.tag(tag).pluck("name")
      .toMatchSnapshot()

    test ".tag(#{tag}) job snapshot", ->
      expect Mem.Query.faces.tag(tag).pluck("chr_jobs.list").map (o)-> o.map (oo)-> oo.job
      .toMatchSnapshot()

    test ".tag(#{tag}) npc snapshot", ->
      expect Mem.Query.faces.tag(tag).pluck("chr_npcs.list").map (o)-> o.map (oo)-> [oo.label, oo.say_0, oo.say_1]
      .toMatchSnapshot()

    test ".name_head(#{tag}) snapshot", ->
      expect(
        for o in Mem.Query.faces.name_head(tag)
          o?.map (oo)-> [oo.id, oo.set]
      ).toMatchSnapshot()

