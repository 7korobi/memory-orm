{ Set, Model, Query, Rule } = require "../../src/index"

new Rule("locale").schema ->

Set.locale.set  require "../yaml/locale.yml"
