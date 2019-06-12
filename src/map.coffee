_ = require "lodash"
{ State, Query } = require "./mem.coffee"
Datum = require './datum.coffee'

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

  @order: (query, path, from, map, list, bless)->
    unless from
      console.error "not found $sort", path, map, query, list
      return

    o = from
    if Object == from.constructor
      if map.belongs_to
        for id, val of from
          Reflect.setPrototypeOf val, Query[map.belongs_to].find id
      else
        for id, val of from
          val.id = id

    else
      if map.belongs_to
        for val in from
          Reflect.setPrototypeOf val, Query[map.belongs_to].find val.id

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

    if map.sort
      o = _.orderBy o, map.sort...
    
    if map.pluck
      o = for oo in o when val = _.get oo, map.pluck
        val

    if key = map.group_by
      from = o
      o = _.groupBy o, (oo)-> _.get oo, key
      for idx, a of o when a
        bless a

    if map.page && per = query.$page_by
      from = o
      o = []
      o.all = from.length
      for oo, idx in from
        unless idx % per
          o.push c = []
          bless c
        c.push oo
      o.page_idx = (item)->
        for a, page_idx in @ when a.includes item
          return page_idx
        null

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
          a = []
          bless a
          counts[idx] = a
        counts[idx].push oo
      o = counts

    bless o
    o

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
