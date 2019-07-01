_ = require "lodash"
{ Finder, State, Query, Format, PureObject, step } = require "./mem.coffee"

each_by_id = ({ list }, from, process)->
  switch from?.constructor
    when Array
      for item in from
        process item.id || item
  return

each = ({ list }, from, process)->
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
  constructor: (@$name, { @$format })->
    State.notify @$name.list

  deploy: ({@set, @map, @list, @model})->

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

    @finish @map, cache, paths, query
    return

  reduce: (map, cache, paths, query, memory, ids)->
    return unless ids
    for id in ids when o = memory[id]
      { meta, item, $group } = o
      continue unless validate item, meta, query._filters
      for [path, a] in $group
        o = paths[path] = cache[path]
        map.reduce query, path, item, o, a

  finish: (map, cache, paths, query)->
    for path, o of paths
      map.finish query, path, o, @list
      _.set query, path, o

    for path, cmd of query.$sort when from = _.get(query, path)
      sorted = map.order     query, path, from,   cmd, @list
      dashed = map.dash      query, path, sorted, cmd, @list
      result = map.post_proc query, path, dashed, cmd, @list
      @list.bless result, query
      result.from = from
      _.set query, path, result

  clear_cache: (hit = true)->
    if hit?
      for name in @$name.depends
        State.notify name
    return

  reset: (meta, base, journal, all, from, parent)->
    journal.$memory = PureObject()
    base.$memory = all.$memory = news = PureObject()

    @merge meta, base, journal, all, from, parent

    for key, old of base.$memory
      item = news[key]
      unless item?
        @model.delete old
    @clear_cache true

  merge: (meta, base, journal, all, from, parent)->
    hit = false
    each @$name, from, (item)=>
      old = base.$memory[item.id]
      @model.$deploy item, parent
      o = @map.$deploy @model, @$format, all.$sort, meta, journal, item
      journal.$memory[item.id] = o
      base.$memory[item.id] = o
      if old?
        @model.update item, old.item
      else
        @model.create item
      hit = true
    @clear_cache hit

  remove: (meta, base, journal, all, ids)->
    hit = false
    each_by_id @$name, ids, (id)=>
      old = base.$memory[id]
      if old?
        @model.delete old.item
        delete journal.$memory[id]
        delete base.$memory[id]
        hit = true
    @clear_cache hit

  update: (meta, base, journal, all, ids, parent)->
    { $memory } = all
    hit = false
    each_by_id @$name, ids, (id)=>
      return unless old = base.$memory[id]
      _.merge old.item, parent
      o = @map.$deploy @model, @$format, all.$sort, meta, journal, old.item
      journal.$memory[id] = o
      base.$memory[id] = o

      @model.update old.item, old.item
      hit = true
    @clear_cache hit
      
