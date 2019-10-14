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

  @init: (o, cmd)->
    if cmd.id
      o.id = cmd.id
    if cmd.list
      o.list = []
    if cmd.count
      o.count = 0
    if cmd.all
      o.all = 0
    if cmd.count && cmd.all?
      o.variance = []
    if cmd.pow
      o.pow = 0
    if cmd.set
      o.hash = {}
    if cmd.navi
      o.navi = {}

  @reduce: (query, path, item, o, cmd)->
    unless o
      console.error "not found $format", path, cmd, query, item
      return
    if cmd.count
      o.count += cmd.count
    if cmd.all
      o.all += cmd.all
    if cmd.count && cmd.all?
      o.variance.push cmd.all
    if cmd.pow
      o.pow *= cmd.pow

    if cmd.list
      o.list.push item

    if cmd.set
      o.hash[cmd.set] = item

    if cmd.max
      unless cmd.max <= o.max
        o.max_is = item
        o.max = cmd.max
    if cmd.min
      unless o.min <= cmd.min
        o.min_is = item
        o.min = cmd.min
    if cmd.navi
      head = []
      back = navi = o.navi
      for idx in cmd.navi
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

    if a = o.variance
      sum = 0
      for data in a
        sum += (data - o.avg) ** 2
      o.variance = sum / ( o.count - 1 )
      o.sd = o.variance ** 0.5
      o.standard = (data)->
        ( data - @avg ) / @sd

    if o.min? && o.max?
      o.range = o.max - o.min
      if o.all
        o.density = o.all / o.range
    if o.navi
      navi_reduce o.navi

  @order: (query, path, from, origin, cmd, list)->
    o = from
    if cmd.belongs_to
      if o instanceof Array
        for val in o
          Reflect.setPrototypeOf val, Query[cmd.belongs_to].find val.id
      else
        for id, val of o
          Reflect.setPrototypeOf val, Query[cmd.belongs_to].find id

    else
      if o.constructor == Object
        for id, val of o
          val.id = id

    if cmd.sort
      o = _.orderBy o, cmd.sort...

    if size = cmd.quantile
      pad = ( o.length - 1 ) / size
      box = for i in [0..size]
        o[ Math.floor i * pad ]
      o.quantile = box

    if cmd.pluck
      o = for oo in o when val = _.get oo, cmd.pluck
        val

    if key = cmd.index
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

      if cmd.mode
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

  @dash: (query, path, from, origin, cmd, list)->
    return unless from instanceof Array

    o = from
    if keys = cmd.diff
      o = Dash o, keys
    o

  @post_proc: (query, path, from, origin, cmd, list)->
    o = from
    if cmd.cover
      remain = []
      cover  = []
      for id in cmd.cover
        if origin[id]
          cover.push id
        else
          remain.push id
      o.remain = remain
      o.cover  = cover

    if cmd.page && per = query.$page_by
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
