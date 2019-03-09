_ = require 'lodash'

Set = {}
Map = {}
Name = {}
Query = {}
Finder = {}

OBJ = ->
  new Object null

$step = 0
step = -> ++$step

cache = (type, { list })->
  State[type][list] ?=
    _step: step()
    $sort:   OBJ()
    $memory: OBJ()
    $format:  OBJ()

State =
  transaction: (cb)->
    State.$journal = result = OBJ()
    cb()
    State.$journal = OBJ()
    result

  journal: cache.bind null, '$journal'
  base:    cache.bind null, '$base'
  step:     OBJ()
  $journal: OBJ()
  $base:    OBJ()

  store: (pack)->
    for list, { $sort, $memory, $format } of pack
      { model } = Finder[list]
      base = State.base { list }

      for key, o of $sort
        base.$sort[key] = o

      for key, o of $format
        base.$format[key] = o

      for key, o of $memory
        model.bless o.item
        base.$memory[key] = o

      Finder[list].clear_cache()

    true

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

module.exports = { Set, Map, Name, State, Finder, Query, set_deploy, set_depend, merge, step }
