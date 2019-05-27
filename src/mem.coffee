_ = require 'lodash'

Datum = require './datum.coffee'

Set = {}
Map = {}
Name = {}
Query = {}
Finder = {}

OBJ = ->
  new Object null

META = (meta = OBJ())->
  meta.pack ?= OBJ()
  meta

$step = 0
step = -> ++$step

cache = (type)-> ({ list })->
  State[type].pack[list] ?=
    $sort:   OBJ()
    $memory: OBJ()
    $format:  OBJ()

State =
  transaction: (cb, meta)->
    State.$journal = pack = META meta
    cb meta
    State.$journal = META()
    pack

  journal: cache '$journal'
  base:    cache '$base'
  meta: -> State.$journal
  step:     OBJ()
  $journal: META()
  $base:    META()

  store: (meta)->
    for list, { $sort, $memory, $format } of meta.pack
      { model } = Finder[list]
      base = State.base { list }
      journal = State.journal { list }

      for key, o of $sort
        base.$sort[key] = o
        journal.$sort[key] = o

      for key, o of $format
        base.$format[key] = o
        journal.$format[key] = o

      for key, o of $memory
        Datum.bless o, meta, model
        base.$memory[key] = o
        journal.$memory[key] = o

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
