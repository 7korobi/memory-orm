_ = require 'lodash'

Set = {}
Map = {}
Name = {}
Query = {}
Finder = {}

cache = (type, { list })->
  State[type][list] ?=
    $sort:   new Object null
    $memory: new Object null
    $format:  new Object null

State =
  transaction: (cb)->
    State.$journal = result = {}
    cb()
    State.$journal = {}
    result

  journal: cache.bind null, '$journal'
  base:    cache.bind null, '$base'
  step:     new Object null
  $journal: new Object null
  $base:    new Object null

  store: (pack)->
    _.merge State.$base, pack
    for key, { $sort, $memory, $format } of pack
      { model } = Query[key]._finder
      for _id, o of $memory
        model.bless o.item
      Query[key]._finder.clear_cache()

set_deploy = (key, cb)-> Name[key].deploys.push cb
set_depend = (key, cb)-> Name[key].depends.push cb
merge = (o)->
  for key, val of o
    switch
      when Query[key]?
        key = Name[key].base
        Set[key].merge val
      when Set[key]?
        Set[key].append val

module.exports = { Set, Map, Name, State, Finder, Query, set_deploy, set_depend, merge }
