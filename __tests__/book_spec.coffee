require "./models/index"
Mem = require "../src/index"

test_is = (target, list, key, o)->
  test "#{target} #{list} #{key}", ->
    base = Mem.State.base list
    expect(
      base[target][key]
    ).toEqual o

describe "___", ->
  test "___", ->
    expect(1).toEqual(1)
  undefined
