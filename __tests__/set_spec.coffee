require "./models/index"
Mem = require "../src/index"

keys = [
  "tag", "face", "chr_set", "chr_npc", "chr_job", 
  "locale", "random",
  "folder", "role", "able",
  "sow_roletable"]

keys.map (key)->
  describe key, ->
    test 'all is query', ->
      expect Mem.Set[key].all
      .toEqual Mem.Query[key + 's']
    test '$name snapshot', ->
      expect Mem.Set[key].$name
      .toMatchSnapshot()
    return
