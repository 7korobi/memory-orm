_ = require "lodash"
{ Finder, State, Query, Format, PureObject, step } = require "./mem.coffee"
Datum = require './datum.coffee'

each_by_id = ({ from }, process)->
  switch from?.constructor
    when Array
      for item in from
        process item.id || item
  return

each = ({ from }, process)->
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

  join: ({ @all, @map, @list, @model })->

  calculate: (query, memory)->
    return unless query._step < State.step[@$name.list]
    base = State.base @$name.list
    delete query._reduce
    query._step = step()
    ctx =
      map: @map
      query: query
      memory: memory
      cache: _.cloneDeep base.$format
      paths:
        _reduce:
          list: []
          hash: {}

    switch
      when query._all_ids
        ids = query._all_ids
        if query._is_uniq
          ids = _.uniq ids
        @reduce ctx, ids

      when query == query.all
        @reduce ctx, Object.keys memory

      else
        if query._is_uniq
          ids = []
          for partition in query.$partition
            tgt = _.get query.all, "reduce.#{partition}"
            ids = _.union ids, tgt
          @reduce ctx, ids
        else
          for partition in query.$partition
            tgt = _.get query.all, "reduce.#{partition}"
            @reduce ctx, tgt

    @finish ctx
    return

  reduce: ({ map, cache, paths, query, memory }, ids)->
    return unless ids
    for id in ids when o = memory[id]
      { meta, item, $group } = o
      continue unless validate item, meta, query._filters
      for [path, a] in $group
        o = paths[path] = cache[path]
        map.reduce query, path, item, o, a

  finish: ({ map, cache, paths, query })->
    for path, o of paths
      map.finish query, path, o, @list
      _.set query, path, o

    for path, cmd of query.$sort when from = _.get(query, path)
      sorted = map.order     query, path, from,   from, cmd, @list
      dashed = map.dash      query, path, sorted, from, cmd, @list
      result = map.post_proc query, path, dashed, from, cmd, @list
      @list.bless result, query
      result.from = from
      _.set query, path, result

  data_set: (type, from, parent)->
    meta    = State.meta()
    base    = State.base    @$name.list
    journal = State.journal @$name.list
    { deploys } = @$name

    @[type] { base, journal, meta,  @model, @all, deploys, from, parent }

  data_emitter: ({ base, journal }, { item, $group })->
    throw new Error "bad context." unless base.$format
    order = (keys..., cmd)=>
      path = ["_reduce", keys...].join('.')
      base.$sort[path] = cmd
      journal.$sort[path] = cmd

    reduce = (keys..., cmd)=>
      cmd = reduce.default keys, cmd
      path = ["_reduce", keys...].join('.')
      $group.push [path, cmd]
      map   = base.$format[path] ?= {}
      map_j = journal.$format[path] ?= {}
      @map.init map,   cmd
      @map.init map_j, cmd

    reduce.default = reduce.default_origin = (keys, cmd)->
      return cmd if keys.length
      reduce.default = (keys, cmd)-> cmd

      bare =
        set: item.id
        list: true
      Object.assign bare, cmd

    { reduce, order }

  data_init: ({ model, parent, deploys }, { item }, { reduce, order })->
    model.bless item
    parent && _.merge item, parent
    model.deploy.call item, model
    for deploy in deploys
      deploy.call item, model, reduce, order

  data_entry: ({ model }, { item }, { reduce, order })->
    model.map_partition item, reduce
    model.map_reduce    item, reduce
    if reduce.default == reduce.default_origin
      reduce {}
    model.order item, order

  reset: (ctx)->
    ctx.journal.$memory = PureObject()
    ctx.base.$memory = ctx.all.$memory = news = PureObject()

    @merge ctx

    for key, old of ctx.base.$memory
      item = news[key]
      unless item?
        ctx.model.delete old
    true

  merge: (ctx)->
    is_hit = false
    each ctx, (item)=>
      old = ctx.base.$memory[item.id]
      o = new Datum ctx.meta, item
      emit = @data_emitter ctx, o
      @data_init ctx, o, emit
      @data_entry ctx, o, emit

      unless id = item.id
        throw new Error "detect bad data: #{ JSON.stringify item }"
      ctx.journal.$memory[id] = o
      ctx.base.$memory[id] = o

      if old?
        ctx.model.update item, old.item
      else
        ctx.model.create item
      is_hit = true
    is_hit

  remove: (ctx)->
    is_hit = false
    each_by_id ctx, (id)=>
      old = ctx.base.$memory[id]
      if old?
        ctx.model.delete old.item
        delete ctx.journal.$memory[id]
        delete ctx.base.$memory[id]
        is_hit = true
    is_hit

  update: (ctx, parent)->
    is_hit = false
    each_by_id ctx, (id)=>
      return unless old = ctx.base.$memory[id]
      _.merge old.item, parent
      old.$group = []
      emit = @data_emitter ctx, o
      @data_entry ctx, old, emit

      ctx.model.update old.item, old.item
      is_hit = true
    is_hit
      
