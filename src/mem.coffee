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
    @$journal = pack = META meta
    cb meta
    @$journal = META()
    pack

  journal: cache '$journal'
  base:    cache '$base'
  meta: -> @$journal
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
      base = @base list
      journal = @journal list

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

  mixin:
    data: ->
      $step: State.step

  join: ({react})->
    if react
      $react_listeners.push react
    return

  bye: ({react})->
    if react
      $react_listeners = $react_listeners.filter (o)-> o != react
    return

  notify: ( list )->
    @step[list] = val = step()
    if $react_listeners.length
      @notify_for_react()
  
  notify_for_react: _.debounce ->
    for o in $react_listeners
      e = {}
      changed = false
      for key, val of o.state 
        continue unless "step_" == key[0..4]
        list = key[5..]
        val = @step[list]
        if o.state[key] < val
          e[key] = val
          changed = true
      if changed
        o.setState e
  , 1

merge = (o)->
  for key, val of o
    switch
      when Query[key]?
        key = Name[key].base
        Set[key].merge val
      when Set[key]?
        Set[key].append val

module.exports = { Set, Map, Name, State, Finder, Query, PureObject, merge, step }
