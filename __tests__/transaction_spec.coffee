require "./models/index"
Mem = require "../src/index"

test_is = (target, list, key, o)->
  test "#{target} #{list} #{key}", ->
    base = Mem.State.base { list }
    expect(
      base[target][key]
    ).toEqual o

json = JSON.parse JSON.stringify Mem.Query.static.meta
Mem.State.store json

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

describe "transaction", ->
  test "_step", ->
    expect( Mem.State.step ).toMatchSnapshot()
  for list_id, o of json.pack
    do_test list_id, o
  undefined

