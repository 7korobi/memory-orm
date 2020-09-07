import _ from 'lodash'
import { State, PureObject, step, Metadata } from './mem'
import { Datum } from './datum'
import {
  Name,
  PlainData,
  PlainDatum,
  Memory,
  Reduce,
  Filter,
  Cache,
  OrderCmd,
  ReduceLeaf,
  SetContext,
  Emitter,
  LeafCmd,
  MODEL,
} from './type'
import { Model } from './model'
import { Map } from './map'
import { Struct } from './struct'
import { List } from './list'
import { Query } from './query'

type IdProcess = (item: string) => void
type PlainProcess = (item: PlainDatum) => void
type Emitters = {
  order: Emitter<OrderCmd>
  reduce: Emitter<LeafCmd> & { default: Emitter<LeafCmd>; default_origin: Emitter<LeafCmd> }
}
type ReduceContext<O extends MODEL> = {
  map: typeof Map
  query: Query<O>
  memory: Memory
  cache: Cache['$format']
  paths: {
    _reduce: Reduce
  }
}

function each_by_id<O extends MODEL>({ from }: SetContext<O>, process: IdProcess) {
  if (from instanceof Array) {
    for (const item of from) {
      process((item as any).id || item)
    }
  }
}

function each<O extends MODEL>({ from }: SetContext<O>, process: PlainProcess) {
  if (from instanceof Array) {
    for (const item of from) {
      process(item as PlainDatum)
    }
  } else if (from instanceof Object) {
    for (const id in from) {
      const item: PlainDatum = from[id]
      item._id = id
      process(item)
    }
  }
}

function validate(item: any, meta: Metadata, chklist: Filter[]): boolean {
  if (!item || !chklist) {
    return false
  }
  for (let chk of chklist) {
    if (!chk(item, meta)) {
      return false
    }
  }
  return true
}

export class Finder<O extends MODEL> {
  $name: Name
  all!: Query<O>
  model!: typeof Model | typeof Struct
  list!: typeof List
  map!: typeof Map

  constructor($name: Name) {
    this.$name = $name
    State.notify(this.$name.list)
  }

  join({
    all,
    map,
    list,
    model,
  }: {
    all: Query<O>
    map: typeof Map
    list: typeof List
    model: typeof Model | typeof Struct
  }) {
    this.all = all
    this.map = map
    this.list = list
    this.model = model
  }

  calculate(query: Query<O>, memory: Memory) {
    if (query._step >= State.step[this.$name.list]) {
      return
    }
    const base = State.base(this.$name.list)
    delete query._reduce
    query._step = step()
    const ctx: ReduceContext<O> = {
      map: this.map,
      query,
      memory,
      cache: _.cloneDeep(base.$format),
      paths: {
        _reduce: {
          list: [],
          hash: {},
        },
      },
    }

    if (query._all_ids) {
      let ids = query._all_ids
      if (query._is_uniq) {
        ids = _.uniq(ids)
      }
      this.reduce(ctx, ids)
    } else if (query === query.all) {
      this.reduce(ctx, Object.keys(memory))
    } else if (query._is_uniq) {
      let ids = []
      for (const partition of query.$partition) {
        const tgt = _.get(query.all, `reduce.${partition}`)
        ids = _.union(ids, tgt)
      }
      this.reduce(ctx, ids)
    } else {
      for (const partition of query.$partition) {
        const tgt = _.get(query.all, `reduce.${partition}`)
        this.reduce(ctx, tgt)
      }
    }
    this.finish(ctx)
  }

  reduce({ map, cache, paths, query, memory }: ReduceContext<O>, ids: string[]) {
    if (!ids) {
      return
    }
    for (let id of ids) {
      const o = memory[id]
      if (o) {
        const { meta, item, $group } = o
        if (!validate(item, meta, query._filters)) {
          continue
        }
        for (let [path, a] of $group) {
          const o = (paths[path] = cache[path])
          map.reduce(query, path, item, o, a)
        }
      }
    }
  }

  finish({ map, paths, query }: ReduceContext<O>) {
    for (const path in paths) {
      const o = paths[path]
      map.finish(query, path, o, this.list)
      _.set(query, path, o)
    }

    for (const path in query.$sort) {
      const cmd: OrderCmd = query.$sort[path]
      const from: ReduceLeaf = _.get(query, path)
      if (from) {
        const sorted = map.order(query, path, from, from, cmd, this.list)
        const dashed = map.dash(query, path, sorted, from, cmd, this.list)
        const result = map.post_proc(query, path, dashed, from, cmd, this.list)
        this.list.bless(result, query)
        result.from = from
        _.set(query, path, result)
      }
    }
  }

  data_set(type: string, from: PlainData, parent: Object | undefined) {
    const meta = State.meta()
    const base = State.base(this.$name.list)
    const journal = State.journal(this.$name.list)
    const { deploys } = this.$name

    return this[type]({
      base,
      journal,
      meta,
      model: this.model,
      all: this.all,
      deploys,
      from,
      parent,
    })
  }

  data_emitter({ base, journal }: SetContext<O>, { item, $group }): Emitters {
    if (!base.$format) {
      throw new Error('bad context.')
    }
    const order = (...args) => {
      const adjustedLength = Math.max(args.length, 1)
      const keys: string[] = args.slice(0, adjustedLength - 1)
      const path = ['_reduce', ...keys].join('.')
      const cmd: OrderCmd = args[adjustedLength - 1]

      base.$sort[path] = cmd
      journal.$sort[path] = cmd
    }

    const reduce = (...args) => {
      const adjustedLength = Math.max(args.length, 1)
      const keys: string[] = args.slice(0, adjustedLength - 1)
      const path = ['_reduce', ...keys].join('.')
      let cmd: LeafCmd = args[adjustedLength - 1]
      cmd = reduce.default(keys, cmd)

      $group.push([path, cmd])
      const map = base.$format[path] || (base.$format[path] = {})
      const map_j = journal.$format[path] || (journal.$format[path] = {})
      this.map.init(map, cmd)
      this.map.init(map_j, cmd)
    }

    reduce.default = reduce.default_origin = function (keys: string[], cmd: LeafCmd) {
      if (keys.length) {
        return cmd
      }
      reduce.default = (_keys, cmd) => cmd

      const bare = {
        set: item.id,
        list: true,
      }
      return Object.assign(bare, cmd)
    }

    return ({ reduce, order } as any) as Emitters
  }

  data_init(
    { model, parent, deploys }: SetContext<O>,
    { item }: Datum,
    { reduce, order }: Emitters
  ) {
    model.bless(item)
    parent && _.merge(item, parent)
    model.deploy.call(item, model)
    for (const deploy of deploys) {
      deploy.call(item, model, reduce, order)
    }
  }

  data_entry({ model }: SetContext<O>, { item }: Datum, { reduce, order }: Emitters) {
    model.map_partition(item, reduce)
    model.map_reduce(item, reduce)
    if (reduce.default === reduce.default_origin) {
      reduce({})
    }
    model.order(item, order)
  }

  reset(ctx: SetContext<O>) {
    ctx.journal.$memory = PureObject()
    const news = (ctx.base.$memory = ctx.all.$memory = PureObject())

    this.merge(ctx)

    for (let key in ctx.base.$memory) {
      const old = ctx.base.$memory[key]
      const item = news[key]
      if (item == null) {
        ctx.model.delete(old)
      }
    }
    return true
  }

  merge(ctx: SetContext<O>) {
    let is_hit = false
    each(ctx, (item) => {
      const o = new Datum(ctx.meta, item)
      const emit = this.data_emitter(ctx, o)
      this.data_init(ctx, o, emit)
      this.data_entry(ctx, o, emit)

      const id = item.id
      if (!id) {
        throw new Error(`detect bad data: ${JSON.stringify(item)}`)
      }
      ctx.journal.$memory[id] = o
      ctx.base.$memory[id] = o

      const old = ctx.base.$memory[item.id!]
      if (old != null) {
        ctx.model.update(item, old.item)
      } else {
        ctx.model.create(item)
      }
      return (is_hit = true)
    })
    return is_hit
  }

  remove(ctx: SetContext<O>) {
    let is_hit = false
    each_by_id(ctx, (id) => {
      const old = ctx.base.$memory[id]
      if (old != null) {
        ctx.model.delete(old.item)
        delete ctx.journal.$memory[id]
        delete ctx.base.$memory[id]
        is_hit = true
      }
    })
    return is_hit
  }

  update(ctx: SetContext<O>, parent: Object) {
    let is_hit = false
    each_by_id(ctx, (id) => {
      const old = ctx.base.$memory[id]
      if (!old) {
        return
      }
      _.merge(old.item, parent)
      old.$group = []
      const emit = this.data_emitter(ctx, old)
      this.data_entry(ctx, old, emit)

      ctx.model.update(old.item, old.item)
      is_hit = true
    })
    return is_hit
  }
}
