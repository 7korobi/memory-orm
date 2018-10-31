require "./models/index"
{ stories, faces } = require "./json/index.json"
Mem = require "../src/index"

describe "sow oldlog", ->
  Mem.Set.sow_village.merge stories
  for { _id, story_ids } in faces
    for story_id in story_ids when vil = Mem.Query.sow_villages.find story_id
      vil.aggregate.face_ids.push _id.face_id

  test 'reduce snapshot', ->
    expect Mem.Query.sow_villages.reduce
    .toMatchSnapshot()
