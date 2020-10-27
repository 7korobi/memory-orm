import _get from 'lodash/get'
import _set from 'lodash/set'
import _orderBy from 'lodash/orderBy'

import { Query } from './query'
import {
  LeafCmd,
  ReduceLeaf,
  OrderCmd,
  Reduce,
  ReduceOrder,
  ReduceOrderPage,
  NameBase,
  CLASS,
  DEFAULT_RULE_TYPE,
} from './type'
import { List } from './list'

import * as Mem from './userdata'

function Dash(o, keys) {
  Object.defineProperties(o, {
    _diff: {
      enumerable: false,
      writable: true,
      value: null,
    },
    diff: {
      enumerable: false,
      get() {
        if (this._diff) {
          return this._diff
        }
        this._diff = []
        const end = this.length - 2
        for (let idx = 0; idx < end; idx++) {
          const a = this[idx]
          const b = this[idx + 1]
          const oo = {}
          for (let key of keys) {
            _set(oo, key, _get(b, key) - _get(a, key))
          }
          this._diff.push(oo)
        }
        Dash(this._diff, keys)
        return this._diff
      },
    },
  })
  return o
}

function navi_reduce(root) {
  let is_did = false
  for (const root_key of Object.keys(root)) {
    const child = root[root_key]
    if (!child) continue
    const child_keys = Object.keys(child)
    switch (child_keys.length) {
      case 0:
        is_did = true
        root[root_key] = 0
        break
      case 1:
        is_did = true
        const new_key = child_keys[0]
        const new_val = child[new_key]
        delete root[root_key]
        root[new_key] = new_val
        break
      default:
        navi_reduce(child)
    }
  }
  if (is_did) {
    navi_reduce(root)
  }
  return root
}

export class Map<A extends DEFAULT_RULE_TYPE> {
  static $name: NameBase
  static bless(o) {
    Reflect.setPrototypeOf(o, this.prototype)
    return o
  }

  static init(o: ReduceLeaf, cmd: LeafCmd) {
    if (cmd.id) {
      o.id = cmd.id
    }
    if (cmd.list) {
      o.list = []
    }
    if (cmd.count) {
      o.count = 0
    }
    if (cmd.all) {
      o.all = 0
    }
    if (cmd.count && cmd.all != null) {
      o.variance_data = []
    }
    if (cmd.pow) {
      o.pow = 0
    }
    if (cmd.set) {
      o.hash = {}
    }
    if (cmd.navi) {
      o.navi = {}
    }
  }

  static reduce<A extends DEFAULT_RULE_TYPE>(
    query: Query<A>,
    path: string,
    item: any,
    o: ReduceLeaf,
    cmd: LeafCmd
  ) {
    if (!o) {
      console.error('not found $format', path, cmd, query, item)
      return
    }
    if (cmd.count) {
      o.count! += cmd.count
    }
    if (cmd.all) {
      o.all! += cmd.all
    }
    if (cmd.count && cmd.all != null) {
      o.variance_data!.push(cmd.all)
    }
    if (cmd.pow) {
      o.pow! *= cmd.pow
    }

    if (cmd.list) {
      o.list!.push(item)
    }

    if (cmd.set) {
      o.hash![cmd.set] = item
    }

    if (cmd.max) {
      if (cmd.max > o.max!) {
        o.max_is = item
        o.max = cmd.max
      }
    }
    if (cmd.min) {
      if (o.min! > cmd.min) {
        o.min_is = item
        o.min = cmd.min
      }
    }
    if (cmd.navi) {
      const head: string[] = []
      let navi
      let back = (navi = o.navi)
      for (let idx of cmd.navi) {
        head.push(idx)
        const key = head.join('-')
        back = navi
        navi = navi[key] || (navi[key] = {})
      }
    }
  }

  static finish<A extends DEFAULT_RULE_TYPE>(
    query: Query<A>,
    path: string,
    o: ReduceLeaf,
    list: CLASS<List<A>>
  ) {
    if (!o) {
      console.error('not found $format', path, query, list)
      return
    }
    if (o.hash) {
      o.set = Object.keys(o.hash)
    }
    if (o.count && o.pow != null) {
      o.avg = Math.pow(o.pow, 1 / o.count)
    }
    if (o.count && o.all != null) {
      o.avg = o.all * (1 / o.count)
    }

    const a = o.variance_data
    if (a) {
      delete o.variance_data
      let sum = 0
      for (let data of a) {
        sum += Math.pow(data - o.avg!, 2)
      }
      o.variance = sum / (o.count! - 1)
      o.sd = Math.pow(o.variance, 0.5)
      o.standard = function (data) {
        return (data - this.avg!) / this.sd!
      }
    }

    if ('number' === typeof o.min && 'number' === typeof o.max) {
      o.range = o.max - o.min
      if (o.all) {
        o.density = o.all / o.range
      }
    }
    if (o.navi) {
      navi_reduce(o.navi)
    }
  }

  static order<A extends DEFAULT_RULE_TYPE>(
    query: Query<A>,
    path: string,
    from: Reduce,
    origin,
    cmd: OrderCmd,
    list: CLASS<List<A>>
  ) {
    let o1 = from
    if (cmd.belongs_to) {
      if (o1 instanceof Array) {
        for (const val of o1) {
          Reflect.setPrototypeOf(val, Mem.Query[cmd.belongs_to].find((val as any).id))
        }
      } else {
        for (const id in o1 as any) {
          const val = o1[id]
          Reflect.setPrototypeOf(val, Mem.Query[cmd.belongs_to].find(id))
        }
      }
    } else {
      if (from instanceof Object) {
        for (const id in from) {
          const val: Reduce = from[id]
          // val.id = id
        }
      }
    }

    let o = o1 as ReduceOrder<A>
    if (cmd.sort) {
      o = (_orderBy(o, cmd.sort[0], cmd.sort[1]) as any) as ReduceOrder<A>
    }

    const size = cmd.quantile
    if (size) {
      const pad = (o.length - 1) / size
      const box = ([] as any) as ReduceOrder<A>
      const end = size + 1
      for (let i = 0; i < end; i++) {
        box.push(o[Math.floor(i * pad)])
      }
      o.quantile = box
    }

    if (cmd.pluck) {
      const ret: any[] = []
      for (const oo of o) {
        const val = _get(oo, cmd.pluck)
        if (val) {
          ret.push(val)
        }
      }
      o = ret as any
    }

    const key = cmd.index
    if (key) {
      let is_ary: boolean, counts
      for (const ___ in o) {
        const oo = o[___]
        is_ary = 'number' === typeof _get(oo, key)
        counts = is_ary ? [] : {}
        break
      }

      for (const ___ in o) {
        const oo = o[___]
        const idx = _get(oo, key)
        let a = counts![idx]
        if (!a) {
          counts![idx] = a = new list(query)
        }
        a.push(oo)
      }

      if (cmd.mode) {
        let max_idx: string | number | null = null
        let max_is: Object[] = []
        if (is_ary!) {
          const aa: Object[][] = counts! as any
          const end = aa.length
          for (let idx = 0; idx < end; idx++) {
            const a = aa[idx]
            if (a && max_is.length < a.length) {
              max_idx = idx
              max_is = a
            }
          }
        } else {
          const aa: { [key: string]: Object[] } = counts! as any
          for (const idx in aa) {
            const a = aa[idx]
            if (a && max_is.length < a.length) {
              max_idx = idx
              max_is = a
            }
          }
        }
        ;(max_is as any).is_mode = max_idx
      }
      o = counts
    }

    return o
  }

  static dash<A extends DEFAULT_RULE_TYPE>(
    query: Query<A>,
    path: string,
    from: ReduceOrder<A>,
    origin,
    cmd: OrderCmd,
    list: CLASS<List<A>>
  ) {
    if (!(from instanceof Array)) {
      return from
    }

    let o = from
    const keys = cmd.diff
    if (keys) {
      o = Dash(o, keys)
    }
    return o
  }

  static post_proc<A extends DEFAULT_RULE_TYPE>(
    query: Query<A>,
    path: string,
    from: ReduceOrder<A>,
    origin,
    cmd: OrderCmd,
    list: CLASS<List<A>>
  ) {
    let per
    let o = from
    if (cmd.cover) {
      const remain: string[] = []
      const cover: string[] = []
      for (let id of cmd.cover) {
        if (origin[id]) {
          cover.push(id)
        } else {
          remain.push(id)
        }
      }
      o.remain = remain
      o.cover = cover
    }

    if (cmd.page && (per = query.$page_by)) {
      const p = ([] as any) as ReduceOrderPage<A>
      p.all = from.length
      for (let idx = 0; idx < from.length; idx++) {
        let c: ReduceOrder<A>
        if (!(idx % per)) {
          c = new list(query)
          p.push(c)
        }
        const oo = from[idx]
        c!.push(oo)
      }
      p.page_idx = function (item) {
        for (let page_idx = 0; page_idx < this.length; page_idx++) {
          const a = this[page_idx]
          if (a.includes(item)) {
            return page_idx
          }
        }
        return null
      }
      return p
    } else {
      return o
    }
  }
}
