require "./models/index"
Mem = require "../src/index"

test_is = (target, list, key, o)->
  test "#{target} #{list} #{key}", ->
    base = Mem.State.base { list }
    expect(
      base[target][key]
    ).toEqual o

transaction_spec = (name, data)->
  json = JSON.parse JSON.stringify data
  Mem.State.store json
  describe "transaction #{name}", ->
    for list_id, { $sort, $memory, $format, _step } of json
      test "_step #{list_id}", ->
        expect( _step ).toMatchSnapshot()
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

transaction_spec "book", Mem.Query.transaction_book
transaction_spec "chr",  Mem.Query.transaction_chr
