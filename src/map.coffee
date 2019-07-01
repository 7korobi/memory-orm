_ = require "lodash"
{ State, Query } = require "./mem.coffee"
Datum = require './datum.coffee'

Dash = (o, keys)->
  Object.defineProperties o,
    _diff:
      enumerable: false
      writable: true
      value: null
    diff:
      enumerable: false
      get: ->
        return @_diff if @_diff
        @_diff =
          for idx in [0 .. @length - 2]
            a = @[idx]
            b = @[idx + 1]
            oo = {}
            for key in keys
              _.set oo, key, _.get(b, key) - _.get(a, key)
            oo
        Dash @_diff, keys
  o


module.exports = class Map
  @bless: (o)->
    Reflect.setPrototypeOf o, @::
    o

  @$deploy: (model, $format, $sort, meta, journal, item)->
    datum = new Datum( meta, item )

    @$deploy_reduce model, item, $format, journal, datum
    @$deploy_sort   model, item, $sort,   journal
    datum

  @$deploy_reduce: (model, item, $format, journal, o)->
    emit_default = emit_default_origin = (keys, cmd)->
      return cmd if keys.length
      emit_default = (keys, cmd)-> cmd

      base =
        set: item.id
        list: true
      Object.assign base, cmd

    emit = (target)=> (keys..., cmd)=>
      cmd = emit_default keys, cmd
      path = ["_reduce", keys...].join('.')
      target.push [path, cmd]
      map   = $format[path] ?= {}
      map_j = journal.$format[path] ?= {}
      @init map,   cmd
      @init map_j, cmd

    emit_group = emit o.$group
    model.map_partition item, emit_group
    model.map_reduce    item, emit_group

    if emit_default == emit_default_origin
      emit_group {}

  @$deploy_sort: (model, item, $sort, journal)->
    emit = (keys..., cmd)->
      path = ["_reduce", keys...].join('.')
      $sort[path] = cmd
      journal.$sort[path] = cmd
    model.order item, emit

  @init: (o, map)->
    if map.id
      o.id = map.id
    if map.list
      o.list = []
    if map.count
      o.count = 0
    if map.all
      o.all = 0
    if map.set
      o.hash = {}

  @reduce: (query, path, item, o, map)->
    unless o
      console.error "not found $format", path, map, query, item
      return
    if map.count
      o.count += map.count
    if map.all
      o.all += map.all
    if map.pow
      o.pow *= map.pow

    if map.list
      o.list.push item

    if map.set
      o.hash[map.set] = item

    if map.max
      unless map.max <= o.max
        o.max_is = item
        o.max = map.max
    if map.min
      unless o.min <= map.min
        o.min_is = item
        o.min = map.min

  @finish: (query, path, o, list)->
    unless o
      console.error "not found $format", path, query, list
      return
    if o.hash
      o.set = Object.keys o.hash
    if o.count && o.pow?
      o.avg = o.all ** (1 / o.count)
    if o.count && o.all?
      o.avg = o.all * (1 / o.count)
    if o.min? && o.max?
      o.range = o.max - o.min
      if o.all
        o.density = o.all / o.range

  @order: (query, path, from, map, list)->
    o = from
    if map.belongs_to
      if o instanceof Array
        for val in o
          Reflect.setPrototypeOf val, Query[map.belongs_to].find val.id
      else
        for id, val of o
          Reflect.setPrototypeOf val, Query[map.belongs_to].find id

    else
      if o.constructor == Object
        for id, val of o
          val.id = id

    if map.sort
      o = _.orderBy o, map.sort...
    
    if map.pluck
      o = for oo in o when val = _.get oo, map.pluck
        val

    if key = map.index
      for ___, oo of o
        is_ary = 'number' == typeof _.get oo, key
        counts =
          if is_ary
            []
          else
            {}
        break
      
      for ___, oo of o
        idx = _.get oo, key
        unless counts[idx]
          counts[idx] = a = new list query
        a.push oo
      o = counts
    o

  @dash: (query, path, from, map, list)->
    return unless from instanceof Array

    o = from
    if keys = map.diff
      o = Dash o, keys
    o

  @post_proc: (query, path, from, map, list)->
    o = from
    if map.cover
      remain = []
      cover  = []
      for id in map.cover
        if from[id]
          cover.push id
        else
          remain.push id
      o.remain = remain
      o.cover  = cover

    if map.page && per = query.$page_by
      o = []
      o.all = from.length
      for oo, idx in from
        unless idx % per
          o.push c = new list query
        c.push oo
      o.page_idx = (item)->
        for a, page_idx in @ when a.includes item
          return page_idx
        null
    o