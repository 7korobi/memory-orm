import { State } from './mem'
import { Query } from './query'
import { Finder } from './finder'
import { CLASS, DATA, NameBase, DEFAULT_RULE_TYPE, DATUM } from './type'

export class Set<A extends DEFAULT_RULE_TYPE> {
  static $name: NameBase

  $name: NameBase
  all: Query<A>
  finder: Finder<A>
  model: CLASS<A[0]>

  constructor({ $name, all, model }) {
    this.$name = $name
    this.model = model
    this.all = all
    this.finder = all._finder
  }

  set = f_common<A>('reset')
  reset = f_common<A>('reset')
  merge = f_common<A>('merge')
  add = f_item<A>(f_common<A>('merge'))
  append = f_item<A>(f_common<A>('merge'))

  reject = f_common<A>('remove')
  del = f_item<A>(f_common<A>('remove'))
  remove = f_item<A>(f_common<A>('remove'))

  updates = f_update
  update = f_item<A>(f_update)

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

function f_common<A extends DEFAULT_RULE_TYPE>(type: string) {
  return function (this: Set<A>, list: DATA<A[0]>, parent?: Object) {
    const is_hit = this.finder.data_set(type, list, parent)
    this.clear_cache(is_hit)
  }
}

function f_update<A extends DEFAULT_RULE_TYPE>(this: Set<A>, list: DATA<A[0]>, parent: Object) {
  if (parent) {
    const is_hit = this.finder.data_set('update', list, parent)
    this.clear_cache(is_hit)
  }
}

function f_item<A extends DEFAULT_RULE_TYPE>(cb) {
  return function (this: Set<A>, item: DATUM<A[0]>, parent?: Object) {
    if (item) {
      cb.call(this, [item], parent)
    }
  }
}

function f_clear<A extends DEFAULT_RULE_TYPE>(this: Set<A>, is_hit = true) {
  if (is_hit) {
    for (const name of this.$name.depends) {
      State.notify(name)
    }
  }
}
