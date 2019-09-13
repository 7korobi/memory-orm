_ = require "lodash"
{ State, Query } = require "./mem.coffee"

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

navi_reduce = (root)->
  is_did = false
  for root_key in Object.keys root when child = root[root_key]
    child_keys = Object.keys child
    switch child_keys.length
      when 0
        is_did = true
        root[root_key] = 0
      when 1
        is_did = true
        new_key = child_keys[0]
        new_val = child[new_key]
        delete root[root_key]
        root[new_key] = new_val
      else
        navi_reduce child
  navi_reduce root if is_did
  root

module.exports = class Map
  @bless: (o)->
    Reflect.setPrototypeOf o, @::
    o

  @init: (o, map)->
    if map.id
      o.id = map.id
    if map.list
      o.list = []
    if map.count
      o.count = 0
    if map.all
      o.all = 0
    if map.pow
      o.pow = 0
    if map.set
      o.hash = {}
    if map.navi
      o.navi = {}

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
    if map.navi
      head = []
      back = navi = o.navi
      for idx in map.navi
        head.push idx
        key = head.join "-"
        back = navi
        navi = navi[key] ||= {}

  @finish: (query, path, o, list)->
    unless o
      console.error "not found $format", path, query, list
      return
    if o.hash
      o.set = Object.keys o.hash
    if o.count && o.pow?
      o.avg = o.pow ** (1 / o.count)
    if o.count && o.all?
      o.avg = o.all * (1 / o.count)
    if o.min? && o.max?
      o.range = o.max - o.min
      if o.all
        o.density = o.all / o.range
    if o.navi
      navi_reduce o.navi

  @order: (query, path, from, origin, map, list)->
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

    if size = map.quantile
      pad = ( o.length - 1 ) / size
      box = [0..size].map (i)=>
        o[ Math.floor i * pad ]
      o.quantile = box

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
        a = counts[idx]
        unless a
          counts[idx] = a = new list query
        a.push oo

      if map.mode
        max_idx = null
        max_is = []
        if is_ary
          for a, idx in counts when a && max_is.length < a.length
            max_idx = idx
            max_is = a
        else
          for idx, a of counts when a && max_is.length < a.length
            max_idx = idx
            max_is = a
        max_is.is_mode = max_idx
      o = counts

    o

  @dash: (query, path, from, origin, map, list)->
    return unless from instanceof Array

    o = from
    if keys = map.diff
      o = Dash o, keys

    o

  @post_proc: (query, path, from, origin, map, list)->
    o = from
    if map.cover
      remain = []
      cover  = []
      for id in map.cover
        if origin[id]
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
