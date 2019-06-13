require "./models/index"
Mem = require "../src/index"

test_is = (target, list, key, o)->
  test "#{target} #{list} #{key}", ->
    base = Mem.State.base list
    expect(
      base[target][key]
    ).toEqual o

do_test = (list_id,{ $sort, $memory, $format })->
  test "$sort #{list_id}", ->
    expect( $sort ).toMatchSnapshot()
  test "$format #{list_id}", ->
    expect( $format ).toMatchSnapshot()

  for key, o of $sort
    test_is "$sort", list_id, key, o
  for key, o of $format
    test_is "$format", list_id, key, o
  for key, o of $memory
    test_is "$memory", list_id, key, o


json = JSON.parse JSON.stringify Mem.Query.static.meta
Mem.State.store json

describe "stringify json", ->
  do_test "faces", json.pack.faces
  do_test "tags",  json.pack.tags
  undefined

