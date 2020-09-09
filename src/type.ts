import { Metadata, Rule } from './mem'
import { Model } from './model'
import { Struct } from './struct'
import { Many, ObjectIteratee } from 'lodash'
import { Query } from './query'
import { Datum } from './datum'

type NAVI_LEAF = number

export type NAVI = {
  [key: string]: NAVI | NAVI_LEAF
}

export type ID = string

export type DIC<T> = {
  [key: string]: T
}

export type LeafEmitter = Emitter<LeafCmd>
export type OrderEmitter = Emitter<OrderCmd>

export type DEPLOY<O, M> = {
  (this: O, cmd: { o: O; model: M; reduce: LeafEmitter; order: OrderEmitter }): void
}

export type Emitter<T> = {
  (cmd: T): void
  (k1: string, cmd: T): void
  (k1: string, k2: string, cmd: T): void
  (k1: string, k2: string, k3: string, cmd: T): void
  (k1: string, k2: string, k3: string, k4: string, cmd: T): void
  (k1: string, k2: string, k3: string, k4: string, k5: string, cmd: T): void
  (k1: string, k2: string, k3: string, k4: string, k5: string, k6: string, cmd: T): void
}

export type Name = {
  base: string
  list: string
  id: ID
  ids: string
  deploys: DEPLOY<any, any>[]
  depends: (() => void)[]
}

export type Cache = {
  $format: {
    [path: string]: ReduceLeaf
  }
  $memory: Memory
  $sort: {
    [path: string]: OrderCmd
  }
}

export type PlainData =
  | PlainDatum[]
  | {
      [id: string]: PlainDatum
    }

export type Filter = {
  (item: any, meta: Metadata): boolean
}

export type RelationCmd = Partial<{
  key: string
  target: string
  miss: string
  cost: number
  directed: boolean
  reverse: boolean
}>

export type OrderCmd = Partial<{
  belongs_to: string
  pluck: string
  index: string
  cover: string[]
  diff: string[]
  quantile: number
  mode: boolean
  page: boolean
  sort: [Many<ObjectIteratee<any>>, Many<boolean | 'asc' | 'desc'>]
}>

export type ReduceOrder<O extends MODEL_DATA> = (number | Reduce)[] &
  Partial<{
    id: ID
    query: Query<O>
    from: ReduceLeaf
    all: number
    remain: string[]
    cover: string[]
    quantile: ReduceOrder<O>
    page_idx(this: Reduce[][], item: Object): number | null
  }>

export type LeafCmd = Partial<{
  id: ID
  list: boolean
  navi: string[]
  set: string | number

  max: string | number
  min: string | number

  count: number
  all: number
  pow: number
}>

export type ReduceLeaf = Partial<{
  id: ID
  list: (Model | Struct)[]
  hash: {
    [key: string]: Model | Struct
  }
  navi: NAVI
  set: string[]

  max_is: any
  min_is: any
  max: string | number
  min: string | number

  variance_data: number[]
  variance: number
  count: number
  all: number
  pow: number
  avg: number
  sd: number
  standard(this: ReduceLeaf, data: number): number
  range: number
  density: number
}>

export type Reduce =
  | {
      [key: string]: Reduce
    }
  | ReduceLeaf

export interface PlainDatum {
  [key: string]: any
  _id?: ID
  id?: ID
  idx?: string
}

export interface Memory {
  [key: string]: Datum
}

export interface SetContext<O extends MODEL_DATA> {
  model: typeof Model | typeof Struct
  all: Query<O>
  base: Cache
  journal: Cache
  meta: Metadata
  deploys: Name['deploys']
  from: PlainData | string[]
  parent: Object | undefined
}

export type CLASS<O> = {
  $name: Name
  bless(data: any, query?: any): asserts data is O
  new (): O
  new (rule: any): O
}

export type QUERY = {
  [path: string]: (string | number)[] | RegExp | string | number | boolean | null
}

export type MODEL = Model | Struct

export interface MODEL_DATA {
  idx?: string
  id: string
}
