{ Set, Model, Query, Rule } = require "../../src/index"

new Rule("marker").schema ->
  @sort "write_at", "desc"
  @order "mark_at",
    sort: ["max", "desc"]
  @scope (all)->
    own: ( uid )-> all.where { uid }

  class @model extends @model
    @map_reduce: (o, emit)->
      emit "mark_at", o.book_id,
        max: o.mark_at

new Rule("icon").schema ->
  @belongs_to "book"
  @belongs_to "potof"

  @scope (all)->
    own: ( _id )-> all.where { _id }
