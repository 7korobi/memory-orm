_ = require "lodash"
{ State, Query, Format } = require "./mem.coffee"


each = ({ list, depends }, from, process)->

  f() for f in depends
  switch from?.constructor
    when Array
      for item in from
        process item
    when Object
      for id, item of from
        item._id = id
        process item
  return

validate = (item, chklist)->
  return false unless item and chklist
  for chk in chklist when ! chk item
    return false
  true

$step = 0

module.exports = class Finder
  constructor: (@$name)->
    State.step[@$name.list] = ++$step
    State.base(@$name)

  calculate: (query, memory)->
    return unless query._step < State.step[@$name.list]

    delete query._reduce
    query._step = ++$step

    cache = _.cloneDeep @$format
    paths =
      _reduce:
        list: []
        hash: {}

    if query._all_ids
      @reduce @map, cache, paths, query, memory, query._all_ids
    else
      if query == query.all
        @reduce @map, cache, paths, query, memory, Object.keys memory
      else
        for partition in query.$partition
          @reduce @map, cache, paths, query, memory, _.get query.all, "reduce.#{partition}"

    @finish_order @map, cache, paths, query
    return

  reduce: (map, cache, paths, query, memory, ids)->
    return unless ids
    for id in ids when o = memory[id]
      { item, $group } = o
      continue unless validate item, query._filters
      for [path, a] in $group
        o = paths[path] = cache[path]
        map.reduce query, path, item, o, a

  finish_order: (map, cache, paths, query)->
    for path, o of paths
      map.finish query, path, o, @list
      _.set query, path, o

    for path, cmd of query.$sort when o = from = _.get(query, path)
      o = map.order query, path, o, cmd, @list, (target)=>
        @list.bless target, query
      o.from = from
      _.set query, path, o

  clear_cache: (all = null)->
    State.step[@$name.list] = ++$step
    if all
      for id, { item } of all.$memory
        @map.$deploy_sort @model, item, all
    return

  remove: (all, from)->
    { $memory } = all
    journal = State.journal(@$name)
    hit = false
    each @$name, from, (item)=>
      @model.bless item
      old = $memory[item.id]
      if old?
        @model.delete old.item
        delete journal.$memory[item.id]
        delete $memory[item.id]
        hit = true
    if hit?
      @clear_cache()

  reset: (all, from, parent)->
    { $memory } = all
    State.journal(@$name).$memory = new Object null
    State.base(@$name).$memory = all.$memory = news = new Object null
    @merge all, from, parent

    for key, old of $memory
      item = news[key]
      unless item?
        @model.delete old

  merge: (all, from, parent)->
    { $memory } = all
    journal = State.journal(@$name)
    each @$name, from, (item)=>
      o = @map.$deploy @model, @$format, all, item, parent
      old = $memory[item.id]
      journal.$memory[item.id] = o
      $memory[item.id] = o
      if old?
        @model.update item, old.item
      else
        @model.create item
        @model.rowid++
    @clear_cache()
