import _ from 'lodash'
import { Cache } from './type'
import { Datum } from './datum'
import { Finder, Set } from './userdata'

export { Rule } from './rule'

let $react_listeners: any[] = []
let $step = 0

export function PureObject() {
  return Object.create(null)
}

export class Metadata {
  write_at!: number
  depth!: number
  pack!: {
    [key: string]: Cache
  }
  static bless(o) {
    Reflect.setPrototypeOf(o, this.prototype)
    o.write_at = 0
    o.depth = 0
    o.pack || (o.pack = PureObject())
    return o
  }
  json() {
    return JSON.stringify(this, (key, val) => {
      if (val && val.meta && val.item && val.$group && val.meta == this) {
        const { item, $group } = val
        return { item, $group }
      } else {
        return val
      }
    })
  }
}

function META(meta = {}): Metadata {
  Metadata.bless(meta)
  return meta as Metadata
}

export function step() {
  return ++$step
}

function cache(type: string) {
  return function (list: string): Cache {
    const o = State[type].pack
    if (!o[list]) {
      const oo = (o[list] = PureObject())
      oo.$sort = PureObject()
      oo.$memory = PureObject()
      oo.$format = PureObject()
    }
    return o[list]
  }
}

class StateManager {
  mixin: { data(): { $step: { [key: string]: number } } }

  journal = cache('$journal')
  base = cache('$base')
  meta() {
    return this.$journal
  }
  step = PureObject()
  $journal = META()
  $base = META()

  transaction(cb: (pack: Metadata) => void, meta: Metadata) {
    const pack = (this.$journal = META(meta))
    if (pack.depth++) {
      console.warn('nested transactions.')
    }
    cb(pack)
    pack.depth--
    this.$journal = META()
    return pack
  }

  store(meta) {
    if (!meta?.pack) return false
    for (const list in meta.pack) {
      const { $sort, $memory, $format } = meta.pack[list]
      const finder = Finder[list]
      if (!finder) {
        console.error('not found Finder', list, Finder)
        continue
      }
      const set = Set[finder.$name.base]
      if (!set) {
        console.error('not found Set', list, Set)
        continue
      }
      const { model } = set
      const base = this.base(list)
      const journal = this.journal(list)
      for (const key in $sort) {
        const o = $sort[key]
        base.$sort[key] = o
        journal.$sort[key] = o
      }
      for (const key in $format) {
        const o = $format[key]
        base.$format[key] = o
        journal.$format[key] = o
      }
      for (const key in $memory) {
        const o = $memory[key]
        Datum.bless(o, meta, model as any)
        base.$memory[key] = o
        journal.$memory[key] = o
      }
      set.clear_cache()
    }
    return true
  }

  join({ react }) {
    if (react) {
      $react_listeners.push(react)
    }
  }

  bye({ react }) {
    if (react) {
      $react_listeners = $react_listeners.filter((o) => o != react)
    }
  }

  notify(list) {
    this.step[list] = step()
    if ($react_listeners.length) {
      this.notify_for_react()
    }
  }

  notify_for_react = _.debounce(() => {
    for (const o of $react_listeners) {
      const e = {}
      let changed = false
      for (const key in o.state) {
        if ('step_' != key.slice(0, 4)) {
          continue
        }
        const list = key.slice(5)
        const val = this.step[list]
        if (o.state[key] < val) {
          e[key] = val
          changed = true
        }
      }
      if (changed) {
        o.setState(e)
      }
    }
  }, 1)

  constructor() {
    const that = this
    this.mixin = {
      data() {
        return { $step: that.step }
      },
    }
  }
}
export const State = new StateManager()
