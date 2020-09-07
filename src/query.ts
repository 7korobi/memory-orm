import _ from 'lodash'
import { Reduce, Memory, Filter, OrderCmd, ID, DIC, MODEL } from './type'
import { Model } from './model'
import { Struct } from './struct'
import { Finder } from './finder'
import { List } from './list'

function set_for(list: string[]) {
  const set = {}
  Reflect.setPrototypeOf(set, null)
  for (let key of list) {
    set[key] = true
  }
  return set
}

function query_parser<O extends MODEL>(
  base: Query<O>,
  req: any,
  cb: (q: Query<O>, target: string | null, request: any, path: (o: Model | Struct) => any) => void
) {
  if (!req) {
    return base
  }

  return new Query<O>(base, function (this: Query<O>) {
    this._filters = base._filters.concat()
    if (req instanceof Function || req instanceof Array || 'string' === typeof req) {
      cb(this, null, req, (o) => o)
    } else if (req instanceof Object) {
      for (let key in req) {
        const val = req[key]
        cb(this, key, val, _.property(key))
      }
    } else {
      console.log({ req })
    }
    //throw Error 'unimplemented'
  })
}

export class Query<O extends MODEL> {
  _is_uniq!: boolean
  _all_ids!: string[]
  _reduce?: Reduce
  _step!: number
  _filters!: Filter[]
  _finder!: Finder<O>
  _group: any
  _cache!: {
    [idx: string]: any
  }
  $sort!: {
    [path: string]: OrderCmd
  }
  $partition: any
  $page_by: any
  $memory!: Memory
  all!: Query<O>

  get reduce() {
    this.all._finder.calculate(this, this.all.$memory)
    return this._reduce!
  }

  get list(): List<O> {
    return this.reduce.list as any
  }

  get hash(): DIC<O> {
    return this.reduce.hash as any
  }

  get memory() {
    return this.all.$memory
  }

  get ids() {
    return Object.keys(this.hash)
  }

  static build<O extends MODEL>({ $sort, $memory }) {
    const _group = null
    const _all_ids = null
    const _is_uniq = true
    const _filters = []
    const $partition = ['set']
    return new Query<O>({ _all_ids, _group, _is_uniq, _filters, $sort, $partition }, function () {
      this.all = this
      this.$memory = $memory
    })
  }

  public constructor(base, tap: (this: Query<O>) => void) {
    this._step = 0
    this._copy(base)
    tap.call(this)
  }

  _copy({ all, _all_ids, _group, _is_uniq, _filters, $sort, $partition, $page_by }) {
    this.all = all
    this._all_ids = _all_ids
    this._group = _group
    this._is_uniq = _is_uniq
    this._filters = _filters
    this.$sort = $sort
    this.$partition = $partition
    this.$page_by = $page_by
  }

  in(req) {
    return query_parser(this, req, function (q, target, req, path) {
      if (req instanceof Array) {
        const set = set_for(req)
        add(function (o) {
          for (let key of path(o)) {
            if (set[key]) {
              return true
            }
          }
          return false
        })
      } else if (req instanceof RegExp) {
        add(function (o) {
          for (let val of path(o)) {
            if (req.test(val)) {
              return true
            }
          }
          return false
        })
      } else {
        add((o) => -1 < path(o)?.indexOf(req))
      }
      function add(f) {
        q._filters.push(f)
      }
    })
  }

  where(req: { [path: string]: any }): Query<O>
  where(req: (o: O) => any): Query<O>
  where(req: any): Query<O> {
    return query_parser(this, req, function (q, target, req, path) {
      if (req instanceof Array) {
        if ('id' === target) {
          q._all_ids = req
        } else {
          const set = set_for(req)
          add((o) => set[path(o)])
        }
      } else if (req instanceof Function) {
        add(req)
      } else if (req instanceof RegExp) {
        add((o) => req.test(path(o)))
      } else {
        if ('id' === target) {
          q._all_ids = [req]
        } else {
          add((o) => req === path(o))
        }
      }
      function add(f) {
        q._filters.push(f)
      }
    })
  }

  partition(...ary: string[]) {
    return new Query(this, function () {
      this.$partition = ary
    })
  }

  distinct(b: boolean = true) {
    if (b === this._is_uniq) {
      return this
    }
    return new Query(this, function () {
      this._is_uniq = b
      if (b && this._all_ids) {
        this._all_ids = _.uniq(this._all_ids)
      }
    })
  }

  distance(key, order, point) {
    return this.order('list', {
      sort: [
        (o) => {
          let sum = 0
          for (let idx = 0; idx < point.length; idx++) {
            const xp = point[idx]
            const xa = _.get(o, key)[idx]
            sum += Math.pow(xa - xp, 2)
          }
          return Math.pow(sum, 0.5)
        },
        order,
      ],
    })
  }

  search(text, target = 'q.search_words') {
    if (!text) {
      return this
    }
    const list: string[] = []
    for (let item of text.split(/\s+/)) {
      item = item.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      if (!item.length) {
        continue
      }
      list.push(`(${item})`)
    }
    if (!list.length) {
      return this
    }
    const regexp = new RegExp(list.join('|'), 'ig')
    return this.where(function (o) {
      const s = _.get(o, target)
      return !s || regexp.test(s)
    })
  }

  shuffle() {
    return this.sort(Math.random)
  }

  order(...args) {
    const adjustedLength = Math.max(args.length, 1)
    const keys: string[] = args.slice(0, adjustedLength - 1)
    const order: OrderCmd = args[adjustedLength - 1]
    if (!keys.length) {
      keys.push('list')
    }
    const path = ['_reduce', ...keys].join('.')

    if (_.isEqual(order, this.$sort[path])) {
      return this
    }
    return new Query<O>(this, function () {
      this.$sort = _.cloneDeep(this.$sort)
      this.$sort[path] = order
    })
  }

  sort(...sort): Query<O> {
    return this.order({ sort }) as Query<O>
  }

  page(page_by: number) {
    return new Query(this, function () {
      this.$page_by = page_by
    })
  }

  form(...ids: ID[]) {
    const oo = this.find(...ids)
    if (oo) {
      const datum: any = this.all.$memory[(oo as any).id]
      const o = datum.form || (datum.form = {})
      Reflect.setPrototypeOf(o, oo)
      return o
    } else {
      return null
    }
  }

  find(...ids: ID[]) {
    for (let id of ids) {
      const o = this.hash[id]
      if (o) {
        return o
      }
    }
    return null
  }

  finds(ids: ID[]) {
    const result: O[] = []
    for (let id of ids) {
      const o = this.hash[id]
      if (o) {
        result.push(o)
      }
    }
    return result
  }

  pluck(...keys: string[]) {
    return this.list.pluck(...arguments)
  }
}
