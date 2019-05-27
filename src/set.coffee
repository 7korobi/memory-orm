_ = require "lodash"
{ State } = require "./index.coffee"
Query = require "./query.coffee"

f_common = (type)-> (list, parent)->
  meta = State.meta()
  journal = State.journal @$name
  @all._finder[type] meta, journal, @all, list, parent

f_update = (list, parent)->
  meta = State.meta()
  journal = State.journal @$name
  if parent?
    @all._finder.update meta, journal, @all, list, parent

f_item = (cb)->
  (item, parent)->
    if item?
      cb.call @, [item], parent

f_clear = ->
  @all._finder.clear_cach @all


module.exports = class Set
  set:           f_common "reset"
  reset:         f_common "reset"

  merge:         f_common "merge"
  add:    f_item f_common "merge"
  append: f_item f_common "merge"

  reject:        f_common "remove"
  del:    f_item f_common "remove"
  remove: f_item f_common "remove"
  updates:       f_update
  update: f_item f_update

  clear_cache:   f_clear
  refresh:       f_clear
  rehash:        f_clear

  find: (...ids)->
    journal = State.journal @$name
    for id in ids when o = @all.$memory[id]
      journal.$memory[id] = o
      return o.item
    null
