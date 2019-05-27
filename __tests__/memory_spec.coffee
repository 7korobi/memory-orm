require "./models/index"
Mem = require "../src/index"

keys = [
  "tags", "faces", "chr_sets", "chr_npcs", "chr_jobs", 
  "locales", "randoms",
  "folders", "roles", "ables",
  "sow_roletables"]

keys.map (key)->
  describe key, ->
    test 'memory snapshot', ->
      expect Mem.Query[key].memory
      .toMatchSnapshot()
    undefined
