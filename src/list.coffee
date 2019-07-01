_ = require "lodash"
Mem = require "./mem.coffee"
Query = require "./query.coffee"

module.exports = class List extends Array
  @bless: (list, query)->
    Reflect.setPrototypeOf list, @::
    list.query = query
    list

  constructor: (query)->
    super()
    @query = query

  sort: (sort...)->
    o = _.orderBy @, sort...
    Reflect.setPrototypeOf o, Reflect.getPrototypeOf @
    o

  group_by: (cb)->
    o = _.groupBy @, cb
    for key, oo of o
      Reflect.setPrototypeOf oo, Reflect.getPrototypeOf @
    o

  page_by: (per)->
    idx = 0
    Object.values @group_by (o)->
      Math.floor(idx++ / per)

  where: (req)-> @query.where req
  in:    (req)-> @query.in    req
