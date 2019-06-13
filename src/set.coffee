_ = require "lodash"
{ State, Set } = require "./mem.coffee"
Query = require "./query.coffee"

f_common = (type)-> (list, parent)->
  meta = State.meta()
  base = State.base @$name.list
  journal = State.journal @$name.list
  @all._finder[type] meta, base, journal, @all, list, parent

f_update = (list, parent)->
  meta = State.meta()
  base = State.base @$name.list
  journal = State.journal @$name.list
  if parent?
    @all._finder.update meta, base, journal, @all, list, parent

f_item = (cb)->
  (item, parent)->
    if item?
      cb.call @, [item], parent

f_clear = ->
  @all._finder.clear_cach()

module.exports = class Set
  constructor: ({ @all, @model, @$name })->

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
    meta = State.meta()
    journal = State.journal @$name.list
    for id in ids when o = @all.$memory[id]
      o.meta = meta
      journal.$memory[id] = o
      @all._finder.clear_cache()
      return o.item
    null
