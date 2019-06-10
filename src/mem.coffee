_ = require 'lodash'

Datum = require './datum.coffee'

Set = {}
Map = {}
Name = {}
Query = {}
Finder = {}

$react_listeners = []
$step = 0

OBJ = ->
  new Object null

class Metadata
  @bless: (o)->
    o.__proto__ = @::
    o.pack ?= OBJ()
    o

  json: ->
    JSON.stringify @, (key, val)=>
      if ( val && val.meta && val.item && val.$group && val.meta == @ )
        { item, $group } = val
        { item, $group }
      else
        val

META = (meta = {})->
  Metadata.bless meta
  meta

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
    return false unless meta?.pack
    for list, { $sort, $memory, $format } of meta.pack
      unless Finder[list]
        console.error "not found Finder", list, meta.pack
        continue
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

  join: ({react})->
    if react
      $react_listeners.push react
    return

  bye: ({react})->
    if react
      $react_listeners = $react_listeners.filter (o)-> o != react
    return

  notify: ( list )->
    State.step[list] = val = step()
    return unless $react_listeners.length

    key = "step_#{list}"
    e = { [key]: val }
    for o in $react_listeners when o.state[key] < val
      o.setState e
    return

  ###
  cleanup: (old, meta = State.meta() )->
    return false unless old?.pack

    for list, { $sort, $memory, $format } of old.pack
      keep = meta?.pack[list]
      { model } = Finder[list]
      base = State.base { list }
      journal = State.journal { list }

      for key, o of $sort when ! keep.$sort[key]
        delete base.$sort[key]
        delete journal.$sort[key]

      for key, o of $format when ! keep.$format[key]
        delete base.$format[key]
        delete journal.$format[key]

      for key, o of $memory when ! keep.$memory[key]
        delete base.$memory[key]
        delete journal.$memory[key]

      Finder[list].clear_cache()
    true
    ###

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
