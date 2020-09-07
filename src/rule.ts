import _ from 'lodash'
import * as Mem from './mem'
import { Model } from './model'
import { List } from './list'
import { Struct } from './struct'
import { Name, Cache, DEPLOY, RelationCmd, DIC, MODEL } from './type'
import { Set } from './set'
import { Map } from './map'
import { Query } from './query'
import { Finder } from './finder'

function rename(base: string) {
  base = _.snakeCase(base).replace(/s$/, '')
  const name = Mem.Name[base]
  if (name) {
    return name
  }

  const list = `${base}s`
  const o = (Mem.Name[list] = Mem.Name[base] = Mem.PureObject())
  o.base = base
  o.list = list
  o.id = `${base}_id`
  o.ids = `${base}_ids`
  o.deploys = []
  o.depends = []
  return o
}

function method<M extends MODEL>(r: Rule<M>, key: string, o: Object) {
  Object.defineProperty(r.model.prototype, key, o)
}

export class Rule<M extends MODEL> {
  $name: Name
  state: Cache
  all: Query<M>

  model!: any
  list!: any
  set!: any
  map!: any

  constructor(base: string, modelClass?: M) {
    this.$name = rename(base)
    this.state = Mem.State.base(this.$name.list)

    this.all = Query.build<M>(this.state)
    this.all.$sort['_reduce.list'] = {}
    this.all._cache = {}
    this.all._finder = new Finder(this.$name)

    this.depend_on(this.$name.list)

    this.model = modelClass || class model extends Model {}
    this.list = class list extends List<M> {}
    this.set = class set extends Set<M> {}
    this.map = class map extends Map<M> {}
  }

  schema(cb: (this: Rule<M>) => void) {
    cb.call(this)
    this.model.$name = this.list.$name = this.set.$name = this.map.$name = this.$name
    this.all._finder.join(this)

    Mem.Set[this.$name.base] = new this.set(this)
    Mem.Query[this.$name.list] = this.all
    Mem.Finder[this.$name.list] = this.all._finder
    return this
  }

  key_by(keys?: string | string[] | { (): string }) {
    const get = (() => {
      if (undefined === keys) {
        return function (this: any) {
          return this._id
        }
      }
      if (keys instanceof Function) {
        return keys
      }
      if (keys instanceof String) {
        return _.property(keys)
      }
      if (keys instanceof Array) {
        return _.property(keys)
      }
      throw new Error(`unimplemented ${keys}`)
    })()

    method(this, 'id', {
      enumerable: true,
      get,
    })
  }

  struct(...args) {
    const adjustedLength = Math.max(args.length, 1)
    const keys = args.slice(0, adjustedLength - 1)
    const get = args[adjustedLength - 1]
    this.model = class model extends Struct {}
    keys.forEach((key, idx) => {
      method(this, key, {
        enumerable: true,
        get() {
          return this[idx]
        },
      })
    })
    method(this, 'id', {
      enumerable: true,
      get,
    })
  }

  deploy(cb: DEPLOY) {
    this.$name.deploys.push(cb)
  }

  depend_on(parent) {
    Mem.Name[parent].depends.push(parent)
  }

  scope_without_cache(cb: (all: Query<M>) => DIC<any>) {
    const cmd = cb(this.all)
    for (const key in cmd) {
      const val = cmd[key]
      this.all[key] = val
    }
  }

  scope(cb: (all: Query<M>) => DIC<any>) {
    const cmd = cb(this.all)
    for (const key in cmd) {
      const val = cmd[key]
      this.use_cache(key, val)
    }
  }

  property(type, o) {
    Object.defineProperties(this[type].prototype, o)
  }

  default_scope(scope: (all: Query<M>) => Query<M>) {
    this.all._copy(scope(this.all))
    const base = Mem.State.base(this.$name.list)
    base.$sort = this.all.$sort
  }

  shuffle() {
    this.default_scope((all) => all.shuffle())
  }

  sort(...sort) {
    this.default_scope((all) => all.sort(...sort))
  }

  order(...order) {
    this.default_scope((all) => all.order(...order))
  }

  relation_to_one(key: string, target: string, ik: string, else_id?: string) {
    method(this, key, {
      enumerable: true,
      get() {
        const id = _.get(this, ik)
        return Mem.Query[target].find(id, else_id!)
      },
    })
  }

  relation_to_many(key: string, target: string, ik: string, cmd: string, qk: string) {
    const { all } = this
    this.use_cache(key, (id) => Mem.Query[target].distinct(false)[cmd]({ [qk]: id }))

    method(this, key, {
      enumerable: true,
      get() {
        return all[key](this[ik])
      },
    })
  }

  relation_tree(key: string, ik: string) {
    const { all } = this
    this.use_cache(key, (id: string, n: number) => {
      if (n) {
        const q = all.where({ [ik]: id })
        return all[key](q.ids, n - 1)
      } else {
        return all.where({ id })
      }
    })

    method(this, key, {
      enumerable: true,
      value(this: Model | Struct, n: number) {
        return all[key]([this.id], n)
      },
    })
  }

  relation_graph(key: string, ik: string) {
    const { all } = this
    this.use_cache(key, (id: string, n: number) => {
      const q = all.where({ id })
      if (n) {
        const ids: any[] = []
        for (const a of q.pluck(ik) as any[][]) {
          if (a != null) {
            for (let k of a) {
              if (k != null) {
                ids.push(k)
              }
            }
          }
        }

        return all[key](_.uniq(ids), n - 1)
      } else {
        return q
      }
    })

    method(this, key, {
      enumerable: true,
      value(this: Model | Struct, n: number) {
        return all[key]([this.id], n)
      },
    })
  }

  use_cache(key: string, val: any) {
    if (val instanceof Function) {
      this.all[key] = (...args: string[]) => {
        const name = `${key}:${JSON.stringify(args)}`
        return this.all._cache[name] || (this.all._cache[name] = val(...args))
      }
    } else {
      this.all[key] = val
    }
  }

  path(...keys: string[]) {
    const { base, list } = this.$name
    let tail_key = keys[keys.length - 1]
    if ('*' === tail_key) {
      this.belongs_to(base)
      this.has_many(list)
      keys.pop()
      tail_key = keys[keys.length - 1]
    }

    for (const key of keys) {
      this.belongs_to(key)
    }

    this.deploy(function (model, reduce, order) {
      const subids = this.id.split('-')
      this.idx = subids[subids.length - 1]
      for (let idx = 0; idx < keys.length; idx++) {
        const key = keys[idx]
        this[`${key}_id`] = subids.slice(0, idx + 1).join('-')
      }

      if (base && keys.length + 1 < subids.length) {
        this[`${base}_id`] = subids.slice(0, -1).join('-')
      }

      reduce('id_tree', { navi: subids })
    })

    const { all } = this
    const pk = `${tail_key}_id`
    method(this, 'siblings', {
      get() {
        return all.where({ [pk]: this[pk] })
      },
    })
  }

  belongs_to(to: string, option: RelationCmd = {}) {
    const name = rename(to)
    const { key = name.id, target = name.list, miss } = option
    this.relation_to_one(name.base, target, key, miss)
  }

  habtm(to, option: RelationCmd = {}) {
    const name = rename(to)
    if (option.reverse) {
      const { key = this.$name.ids, target = to } = option
      this.relation_to_many(name.list, target, 'id', 'in', key)
    } else {
      const { key = name.ids, target = name.list } = option
      this.relation_to_many(name.list, target, key, 'where', 'id')
    }
  }

  has_many(to, option: RelationCmd = {}) {
    const name = rename(to)
    const { key = this.$name.id, target = name.list } = option
    this.relation_to_many(name.list, target, 'id', 'where', key)
  }

  tree(option: RelationCmd = {}) {
    const fk = this.$name.id
    this.relation_tree('nodes', fk)
    this.belongs_to(this.$name.base, option)

    Object.defineProperties(this.all, {
      leaf: {
        get(this: Query<M>) {
          const not_leaf = _.uniq(this.pluck(fk))
          return this.where((o) => !not_leaf.includes(o.id))
        },
      },
    })
  }

  graph(option: RelationCmd = {}) {
    const { directed, cost } = option
    const ik = this.$name.ids
    this.relation_to_many(this.$name.list, this.$name.list, ik, 'where', 'id')
    this.relation_graph('path', ik)
    if (!directed) {
      return true // todo
    }
    return false
  }
}
