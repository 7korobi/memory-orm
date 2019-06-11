{ Model, Query, Rule } = require "../../src/index"

new Rule("phase").schema ->
  @order "write_at"
  @order 'group',  sort: ["count", "desc"]
  @order 'handle', sort: ["count", "desc"]
  @path "folder", "book", "part"
  @has_many "chats"

  @scope (all)->
    {}

  @deploy ->

  class @model extends @model
    @map_reduce: (o, emit)->
      emit "group", o.group,
        count: 1
      emit "handle", o.handle,
        count: 1
