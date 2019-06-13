_ = require "lodash"
Mem = require "./mem.coffee"
{ Finder, Query, Model, List, Set, Map } = require "./base.coffee"

rename = (base)->
  base = _.snakeCase(base).replace /s$/, ""
  name = Mem.Name[base]
  return name if name

  list = "#{base}s"
  Mem.Name[list] = Mem.Name[base] = o = Mem.PureObject()
  o.base = base
  o.list = list
  o.id =   "#{base}_id"
  o.ids =  "#{base}_ids"
  o.deploys = []
  o.depends = []
  o

module.exports = class Rule
  constructor: (base, cb)->
    @$name = rename base
    @state = Mem.State.base @$name.list

    @model = Model
    @list  = List
    @set   = Set
    @map   = Map

    @all = Query.build @state
    @all.$sort["_reduce.list"] = {}
    @all._cache = {}
    @all._finder = new Finder @$name, @state

    @depend_on @$name.list
    @map_property = {}

    { base } = @$name
    @model_property =
      id:
        enumerable: true
        get: -> @_id
      [@$name.id]:
        enumerable: true
        get: -> @_id

    @form_property =
      changes:
        enumerable: true
        value: (key)->
          if _.isEqual @[key], @find[key]
            null
          else
            @$model[key]
      isChanged:
        enumerable: true
        get: ->
          keys = Object.keys @
          for key in keys
            return true unless _.isEqual @[key], @$model[key]
          return false

    @list_property =
      first:
        enumerable: false
        get: -> @[0]
      head:
        enumerable: false
        get: -> @[0]
      tail:
        enumerable: false
        get: -> @[@length - 1]
      last:
        enumerable: false
        get: -> @[@length - 1]

      uniq:
        enumerable: false
        get: ->
          @constructor.bless _.uniq @

      pluck:
        enumerable: false
        value: (keys...)->
          cb =
            switch keys.length
              when 0
                -> null
              when 1
                _.property keys[0]
              else
                (o)-> _.at(o, keys...)
          @constructor.bless @map cb

    @set_property = {}

    @schema cb if cb
    return

  schema: (cb)->
    cb.call @
    if @model == Model
      class @model extends @model
    Object.defineProperties @model::, @model_property

    if @list == List
      class @list extends @list
    Object.defineProperties @list::, @list_property

    if @set == Set
      class @set extends @set
    Object.defineProperties @set::, @set_property

    if @map == Map
      class @map extends @map
    Object.defineProperties @map::, @map_property

    @model.$name = @list.$name = @set.$name = @map.$name = @$name


    @list.bless [], @all
    @all._finder.deploy @

    Mem.Set[@$name.base] = new @set @
    Mem.Query[@$name.list] = @all
    Mem.Finder[@$name.list] = @all._finder
    @

  key_by: (keys)->
    cb =
      switch keys?.constructor
        when undefined
          -> @_id
        when Function
          keys
        when String, Array
          _.property keys
        else
          throw Error "unimplemented #{keys}"

    @model_property.id =
      enumerable: true
      get: cb

  deploy: (cb)->
    @$name.deploys.push cb

  depend_on: (parent)->
    Mem.Name[parent].depends.push parent

  scope: (cb)->
    for key, val of cb @all
      @use_cache key, val


  property: (type, o)->
    Object.assign @["#{type}_property"], o


  default_scope: (scope)->
    @all._copy scope @all
    base = Mem.State.base @$name.list
    base.$sort = @all.$sort

  shuffle: ->
    @default_scope (all)-> all.shuffle()

  sort: (...sort)->
    @default_scope (all)-> all.sort ...sort

  order: (...order)->
    @default_scope (all)-> all.order ...order

  relation_to_one: (key, target, ik, else_id)->
    @model_property[key] =
      enumerable: true
      get: ->
        id = _.get @, ik
        Mem.Query[target].find id, else_id

  relation_to_many: (key, target, ik, cmd, qk)->
    all = @all
    @use_cache key, (id)->
      Mem.Query[target][cmd] "#{qk}": id

    @model_property[key] =
      enumerable: true
      get: ->
        all[key](@[ik])

  relation_tree: (key, ik)->
    all = @all
    @use_cache key, (id, n)->
      if n
        q = all.where "#{ik}": id
        all[key] q.ids, n - 1
      else
        all.where { id }

    @model_property[key] =
      enumerable: true
      value: (n)->
        all[key] [@id], n

  relation_graph: (key, ik)->
    all = @all
    @use_cache key, (id, n)->
      q = all.where { id }
      if n
        ids = []
        for a in q.pluck(ik) when a?
          for k in a when k?
            ids.push k

        all[key] _.uniq(ids), n - 1
      else
        q

    @model_property[key] =
      enumerable: true
      value: (n)->
        all[key] [@id], n

  use_cache: (key, val)->
    switch val?.constructor
      when Function
        @all[key] = (args...)=>
          @all._cache["#{key}:#{JSON.stringify args}"] ?= val args...
      else
        @all[key] = val

  path: (keys...)->
    for key in keys
      @belongs_to key
    @deploy ->
      subids = @id.split("-")
      @idx = subids[keys.length]
      for key, idx in keys
        @["#{key}_id"] = subids[0..idx].join '-'

    { all } = @
    pk = keys[-1..][0] + "_id"
    @model_property.siblings =
      get: ->
        q = {}
        q[pk] = @[pk]
        all.where q

  belongs_to: (to, option = {})->
    name = rename to
    { key = name.id, target = name.list, miss } = option
    @relation_to_one name.base, target, key, miss

  habtm: (to, option = {})->
    name = rename to
    if option.reverse
      { key = @$name.ids, target = to } = option
      @relation_to_many name.list, target, "id", "in", key
    else
      { key = name.ids, target = name.list } = option
      @relation_to_many name.list, target, key, "where", "id"

  has_many: (to, option = {})->
    name = rename to
    { key = @$name.id, target = name.list } = option
    @relation_to_many name.list, target, "id", "where", key

  tree: (option = {})->
    fk = @$name.id
    @relation_tree "nodes", fk
    @belongs_to @$name.base, option

    Object.defineProperties @all,
      leaf:
        get: ->
          not_leaf = _.uniq @pluck fk
          @where (o)-> o.id not in not_leaf

  graph: (option = {})->
    { directed, cost } = option
    ik = @$name.ids
    @relation_to_many @$name.list, @$name.list, ik, "where", "id"
    @relation_graph "path", ik
    unless directed
      true # todo
