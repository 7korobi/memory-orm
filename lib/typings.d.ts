type Order = boolean | "asc" | "desc";

interface Meta {
  pack: Data
}

interface Data {
  $sort: {[key: string]: {[key: string]: [Order] }}
  $memory: 
  $format: 
}
interface MetaItem {

}

interface Pack {

}
interface PackItem {

}

declare module 'memory-orm' {
  namespace State {
    function transaction(cb: (Meta)=> any, meta: Meta): Pack
    function journal(list: string): PackItem
    function base(list: string): PackItem
    function meta()
    interface $journal {

    }
    Object $journal
    Object $base
    base: cache '$base'
    meta: -> @$journal
    step: PureObject()
    $journal: META()
    $base: META()

    store: (meta) ->
    return false unless meta ?.pack
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

    join: ({ react }) ->
    if react
      $react_listeners.push react
    return

    bye: ({ react }) ->
    if react
      $react_listeners = $react_listeners.filter(o) -> o != react
    return

    notify: (list) ->
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

    
  }
  function merge([key: string]: Object[] | Object): void
  function step(): number
  namespace Rule
  namespace Base
  namespace Set
  namespace Map
  namespace Finder
  namespace Query
  namespace PureObject
}