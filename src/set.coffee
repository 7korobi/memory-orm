_ = require "lodash"
{ State, Set } = require "./mem.coffee"
Query = require "./query.coffee"

f_common = (type)-> (list, parent)->
  is_hit = @finder.data_set type, list, parent
  @clear_cache is_hit

f_update = (list, parent)->
  if parent?
    is_hit = @finder.data_set 'update', list, parent
    @clear_cache is_hit


f_item = (cb)->
  (item, parent)->
    if item?
      cb.call @, [item], parent

f_clear = (is_hit = true)->
  if is_hit?
    for name in @$name.depends
      State.notify name
  return

module.exports = class Set
  constructor: ({ @$name, @all, @model })->
    @finder = @all._finder

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
      @clear_cache true
      return o.item
    null
