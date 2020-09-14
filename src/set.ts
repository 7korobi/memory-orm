import _ from 'lodash'
import { State } from './mem'
import { Query } from './query'
import { Finder } from './finder'
import { MODEL_DATA, CLASS, PlainData, NameBase } from './type'

export class Set<O extends MODEL_DATA> {
  static $name: NameBase

  $name: NameBase
  all: Query<O>
  finder: Finder<O>
  model: CLASS<O>

  constructor({ $name, all, model }) {
    this.$name = $name
    this.model = model
    this.all = all
    this.finder = all._finder
  }

  set = f_common<O>('reset')
  reset = f_common<O>('reset')
  merge = f_common<O>('merge')
  add = f_item<O>(f_common<O>('merge'))
  append = f_item<O>(f_common<O>('merge'))

  reject = f_common<O>('remove')
  del = f_item<O>(f_common<O>('remove'))
  remove = f_item<O>(f_common<O>('remove'))

  updates = f_update
  update = f_item<O>(f_update)

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

function f_common<O extends MODEL_DATA>(type: string) {
  return function (this: Set<O>, list: PlainData<O>, parent?: Object) {
    const is_hit = this.finder.data_set(type, list, parent)
    this.clear_cache(is_hit)
  }
}

function f_update<O extends MODEL_DATA>(this: Set<O>, list: PlainData<O>, parent: Object) {
  if (parent) {
    const is_hit = this.finder.data_set('update', list, parent)
    this.clear_cache(is_hit)
  }
}

function f_item<O extends MODEL_DATA>(cb) {
  return function (this: Set<O>, item: Partial<O>, parent?: Object) {
    if (item) {
      cb.call(this, [item], parent)
    }
  }
}

function f_clear<O extends MODEL_DATA>(this: Set<O>, is_hit = true) {
  if (is_hit) {
    for (const name of this.$name.depends) {
      State.notify(name)
    }
  }
}
