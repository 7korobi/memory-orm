_ = require "lodash"
{ State, Query, Format, step } = require "./mem.coffee"

each_by_id = ({ list, depends }, from, process)->
  f() for f in depends
  switch from?.constructor
    when Array
      for item in from
        process item.id || item
  return

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

validate = (item, meta, chklist)->
  return false unless item and chklist
  for chk in chklist when ! chk item, meta
    return false
  true


module.exports = class Finder
  constructor: (@$name)->
    State.notify @$name.list

  calculate: (query, memory)->
    return unless query._step < State.step[@$name.list]

    delete query._reduce
    query._step = step()

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
      { meta, item, $group } = o
      continue unless validate item, meta, query._filters
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
    State.notify @$name.list
    if all
      for id, { item } of all.$memory
        @map.$deploy_sort @model, item, all
    return

  reset: (meta, journal, all, from, parent)->
    { $memory } = all
    journal.$memory = new Object null
    State.base(@$name).$memory = all.$memory = news = new Object null
    @merge meta, journal, all, from, parent

    for key, old of $memory
      item = news[key]
      unless item?
        @model.delete old

  merge: (meta, journal, all, from, parent)->
    { $memory } = all
    each @$name, from, (item)=>
      old = $memory[item.id]
      @model.$deploy item, parent
      o = @map.$deploy @model, @$format, all.$sort, meta, journal, item
      journal.$memory[item.id] = o
      $memory[item.id] = o
      if old?
        @model.update item, old.item
      else
        @model.create item
    @clear_cache()

  remove: (meta, journal, all, ids)->
    { $memory } = all
    hit = false
    each_by_id @$name, ids, (id)=>
      old = $memory[id]
      if old?
        @model.delete old.item
        delete journal.$memory[id]
        delete $memory[id]
        hit = true
    if hit?
      @clear_cache()

  update: (meta, journal, all, ids, parent)->
    { $memory } = all
    each_by_id @$name, ids, (id)=>
      return unless old = $memory[id]
      _.merge old.item, parent
      o = @map.$deploy @model, @$format, all.$sort, meta, journal, old.item
      journal.$memory[id] = o
      $memory[id] = o

      @model.update old.item, old.item
    @clear_cache()
      
