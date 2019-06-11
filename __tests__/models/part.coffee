{ Model, Query, Rule } = require "../../src/index"

new Rule("part").schema ->
  @sort "chats.list.0.0.write_at", "asc"
  @path "folder", "book"
  @has_many "sections"
  @has_many "phases"
  @has_many "cards"
  @has_many "stats"
  @has_many "chats"
