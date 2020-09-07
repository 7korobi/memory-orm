import _ from 'lodash'
import { State } from './mem'
import { Query } from './query'
import { Finder } from './finder'
import { Model } from './model'
import { Struct } from './struct'
import { Name, PlainDatum, PlainData, MODEL } from './type'

export class Set<M extends MODEL> {
  static $name: Name

  $name: Name
  all: Query<M>
  finder: Finder<M>
  model: typeof Model | typeof Struct

  constructor({ $name, all, model }) {
    this.$name = $name
    this.model = model
    this.all = all
    this.finder = all._finder
  }

  set = f_common<M>('reset')
  reset = f_common<M>('reset')
  merge = f_common<M>('merge')
  add = f_item(f_common<M>('merge'))
  append = f_item(f_common<M>('merge'))

  reject = f_common<M>('remove')
  del = f_item(f_common<M>('remove'))
  remove = f_item(f_common<M>('remove'))

  updates = f_update
  update = f_item<M>(f_update)

  clear_cache = f_clear
  refresh = f_clear
  rehash = f_clear

  find(...ids: string[]) {
    const meta = State.meta()
    const journal = State.journal(this.$name.list)
    for (const id of ids) {
      const o = this.all.$memory[id]
      if (!o) continue
      o.meta = meta
      journal.$memory[id] = o
      this.clear_cache(true)
      return o.item
    }
    return null
  }
}

function f_common<M extends MODEL>(type: string) {
  return function (this: Set<M>, list: PlainData, parent?: Object) {
    const is_hit = this.finder.data_set(type, list, parent)
    this.clear_cache(is_hit)
  }
}

function f_update<M extends MODEL>(this: Set<M>, list: PlainData, parent: Object) {
  if (parent) {
    const is_hit = this.finder.data_set('update', list, parent)
    this.clear_cache(is_hit)
  }
}

function f_item<M extends MODEL>(cb) {
  return function (this: Set<M>, item: PlainDatum, parent?: Object) {
    if (item) {
      cb.call(this, [item], parent)
    }
  }
}

function f_clear<M extends MODEL>(this: Set<M>, is_hit = true) {
  if (is_hit) {
    for (const name of this.$name.depends) {
      State.notify(name)
    }
  }
}
