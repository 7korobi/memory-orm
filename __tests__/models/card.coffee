{ Set, Model, Query, Rule } = require "../../src/index"

new Rule("card").schema ->
  @sort "write_at"
  @path "folder", "book", "potof"
  @belongs_to "role"

  @property 'model',
    stat:
      get: ->
        Query.stats.find("#{@potof_id}-#{@idx}")

  @scope (all)->
    for_part:  (part_id)->  all.where {  part_id }
    for_phase: (phase_id)-> all.where { phase_id }

new Rule("stat").schema ->
  @path "folder", "book", "potof"
  @belongs_to "able"

  @deploy ->
    @able_id = @idx
  @property 'model',
    card:
      get: ->
        Query.cards.find("#{@potof_id}-#{@idx}")



new Rule("role").schema ->
  @habtm "ables"

  class @model extends @model
    @map_reduce: (o, emit)->
      emit "group", o.group,
        list: true

new Rule("able").schema ->
  @habtm "roles", reverse: true

  class @model extends @model
    @map_reduce: (o, emit)->
      emit "group", o.group,
        list: true

Set.role.set require '../yaml/set_roles.yml'
Set.able.set require '../yaml/set_ables.yml'
