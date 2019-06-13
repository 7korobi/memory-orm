_ = require 'lodash'

Datum = require './datum.coffee'

Set = {}
Map = {}
Name = {}
Query = {}
Finder = {}

$react_listeners = []
$step = 0

PureObject = ->
  Object.create null

class Metadata
  @bless: (o)->
    Reflect.setPrototypeOf o, @::
    o.pack ?= PureObject()
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

cache = (type)-> (list)->
  o = State[type].pack
  if o[list]
    o[list]
  else
    oo = o[list] = PureObject()
    oo.$sort   = PureObject()
    oo.$memory = PureObject()
    oo.$format = PureObject()
    oo


State =
  transaction: (cb, meta)->
    State.$journal = pack = META meta
    cb meta
    State.$journal = META()
    pack

  journal: cache '$journal'
  base:    cache '$base'
  meta: -> State.$journal
  step:     PureObject()
  $journal: META()
  $base:    META()

  store: (meta)->
    return false unless meta?.pack
    for list, { $sort, $memory, $format } of meta.pack
      finder = Finder[list]
      unless finder
        console.error "not found Finder and Query", list, meta.pack
        continue
      { model } = finder
      base = State.base list
      journal = State.journal list

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

      finder.clear_cache()
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

merge = (o)->
  for key, val of o
    switch
      when Query[key]?
        key = Name[key].base
        Set[key].merge val
      when Set[key]?
        Set[key].append val

module.exports = { Set, Map, Name, State, Finder, Query, PureObject, merge, step }
