_ = require "lodash"
{ State, Query } = require "./mem.coffee"

matrix =
  map: (cb)->
    list = []
    for a in @ when a
      for item in a
        list.push cb item
    list

module.exports = class Map
  @bless: (o)->
    o.__proto__ = @::
    o

  @$deploy: (model, $format, all, item, parent)->
    o = { item, $group: [] }

    model.$deploy item, parent
    @$deploy_reduce model, item, $format, o
    @$deploy_sort   model, item, all
    o

  @$deploy_reduce: (model, item, $format, o)->
    journal = State.journal(@$name)
    emit = (target)=> (keys..., cmd)=>
      path = ["_reduce", keys...].join('.')
      target.push [path, cmd]
      map = $format[path] ?= {}
      journal.$format[path] ?= {}
      @init map, cmd
    emit_group = emit o.$group
    emit_group
      list: true
    model.map_partition item, emit_group
    model.map_reduce    item, emit_group

  @$deploy_sort: (model, item, all)->
    journal = State.journal(@$name)
    emit = (keys..., cmd)->
      path = ["_reduce", keys...].join('.')
      all.$sort[path] = cmd
      journal.$sort[path] = cmd
    emit "list", {}
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

  @order: (query, path, from, map, list, cb)->
    o = from
    if Object == from.constructor
      if map.belongs_to
        for id, val of from
          val.__proto__ = Query[map.belongs_to].find id
      else
        for id, val of from
          val.id = id

    else
      if map.belongs_to
        for val in from
          val.__proto__ = Query[map.belongs_to].find val.id

    if map.sort
      o = _.orderBy o, map.sort...
    
    if map.pluck
      o = for oo in o when val = _.get oo, map.pluck
        val

    if key = map.group_by
      from = o
      o = _.groupBy o, (oo)-> _.get oo, key
      for a of o when a
        cb a

    if map.page && per = query.$page_by
      from = o
      o = []
      o.all = from.length
      for oo, idx in from
        unless idx % per
          o.push c = []
        c.push oo
      o.page_idx = (item)->
        for a, page_idx in @ when a.includes item
          return page_idx
        null
      for a in o when a
        cb a

    if key = map.index
      counts = []
      for ___, oo of o
        idx = _.get oo, key
        counts[idx] ?= []
        counts[idx].push oo
      o = counts
      for a in o when a
        cb a

    cb o
    o

  @finish: (query, path, o, list)->
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
