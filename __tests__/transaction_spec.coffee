require "./models/index"
Mem = require "../src/index"

test_is = (target, list, key, src)->
  test "#{target} #{list} #{key}", ->
    base = Mem.State.base { list }
    tgt = JSON.parse JSON.stringify base[target][key]
    expect( tgt ).toEqual src

do_test = (list_id,{ $sort, $memory, $format })->
  test "$sort #{list_id}", ->
    expect( $sort ).toMatchSnapshot()
  test "$format #{list_id}", ->
    expect( $format ).toMatchSnapshot()
  test "$memory #{list_id}", ->
    expect( $memory ).toMatchSnapshot()

  for key, o of $sort
    test_is "$sort", list_id, key, o
  for key, o of $format
    test_is "$format", list_id, key, o
  for key, o of $memory
    test_is "$memory", list_id, key, o


describe "transaction", ->
  test "_step", ->
    expect( Mem.State.step ).toMatchSnapshot()
  undefined

describe "stringify", ->
  json = JSON.parse JSON.stringify Mem.Query.static.meta
  do_test "randoms", json.pack.randoms
  do_test "faces",   json.pack.faces
  do_test "tags",    json.pack.tags
  undefined

describe "json", ->
  json = JSON.parse Mem.Query.static.meta.json()
  do_test "randoms", json.pack.randoms
  do_test "faces",   json.pack.faces
  do_test "tags",    json.pack.tags
  undefined
