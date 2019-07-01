require "./models/index"
Mem = require "../src/index"

{ stories, faces } = require "./json/index.json"

test_is = (target, list, key, o)->
  test "#{target} #{list} #{key}", ->
    base = Mem.State.base list
    expect(
      base[target][key]
    ).toEqual o

meta = Mem.State.transaction ->
  Mem.Set.sow_village.merge stories
  for { _id, story_ids } in faces
    for story_id in story_ids when vil = Mem.Query.sow_villages.find story_id
      vil.aggregate.face_ids.push _id.face_id
json = JSON.parse meta.json()
Mem.State.store json

describe "sow oldlog", ->
  for list_id, { $sort, $memory, $format } of json.pack
    for key, o of $sort
      test_is "$sort", list_id, key, o

  for list_id, { $sort, $memory, $format } of json.pack
    for key, o of $format
      test_is "$format", list_id, key, o

  # $memory check 省略

  test "list' sow_villages", ->
    expect Mem.Query.sow_villages.list.diff
    .toMatchSnapshot()

  test "list'' sow_villages", ->
    expect Mem.Query.sow_villages.list.diff.diff
    .toMatchSnapshot()

  test "list''' sow_villages", ->
    expect Mem.Query.sow_villages.list.diff.diff.diff
    .toMatchSnapshot()

  test "list'''' sow_villages", ->
    expect Mem.Query.sow_villages.list.diff.diff.diff.diff
    .toMatchSnapshot()

  undefined
