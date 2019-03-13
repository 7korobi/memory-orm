require "./models/index"
Mem = require "../src/index"

keys = [
  "tags", "faces", "chr_sets", "chr_npcs", "chr_jobs", 
  "locales", "randoms",
  "folders", "roles", "traps", "ables",
  "sow_roletables"]

keys.map (key)->
  describe key, ->
    test 'format snapshot', ->
      expect Mem.Query[key]._finder.format
      .toMatchSnapshot()
    undefined
