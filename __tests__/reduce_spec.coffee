require "./models/index"
Mem = require "../src/index"

keys = [
  "locales", "randoms",
  "folders", "roles", "traps", "ables",
  "sow_roletables"]

keys.map (key)->
  describe key, ->
    test 'reduce snapshot', ->
      expect Mem.Query[key].reduce
      .toMatchSnapshot()
    undefined
