import { Metadata } from './mem'
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

export type DEPLOY = {
  (
    this: Model | Struct,
    model: typeof Model | typeof Struct,
    reduce: Emitter<LeafCmd>,
    order: Emitter<OrderCmd>
  ): void
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
  deploys: DEPLOY[]
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

export type ReduceOrder = (number | Reduce)[] &
  Partial<{
    id: ID
    query: Query
    from: ReduceLeaf
    all: number
    remain: string[]
    cover: string[]
    quantile: ReduceOrder
    page_idx(this: Reduce[][], item: Object): number | null
  }>

export type LeafCmd = Partial<{
  id: ID
  list: string
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
  _id?: ID
  id?: ID
}

export interface Memory {
  [key: string]: Datum
}

export interface SetContext {
  model: typeof Model | typeof Struct
  all: Query
  base: Cache
  journal: Cache
  meta: Metadata
  deploys: Name['deploys']
  from: PlainData | string[]
  parent: Object | undefined
}
