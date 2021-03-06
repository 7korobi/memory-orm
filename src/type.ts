import { Metadata, Rule } from './mem'
import { Model } from './model'
import { Struct } from './struct'
import { ListIteratee, ListIterator, Many, NotVoid, ObjectIteratee, ObjectIterator } from 'lodash'
import { Query } from './query'
import { Datum } from './datum'
import { List } from './list'

type NAVI_LEAF = number

export type ID = string | number
export type PATH = string | number
export type LeafEmitter = Emitter<LeafCmd>
export type OrderEmitter = Emitter<OrderCmd>

export type NAVI = {
  [key: string]: NAVI | NAVI_LEAF
}

export type DIC<T> = {
  [key: string]: T
}

export type DEPLOY<O, M> = {
  (this: O, cmd: { o: O; model: M; reduce: LeafEmitter; order: OrderEmitter }): void
}

export type Emitter<T> = {
  (cmd: T): void
  (k1: PATH, cmd: T): void
  (k1: PATH, k2: PATH, cmd: T): void
  (k1: PATH, k2: PATH, k3: PATH, cmd: T): void
  (k1: PATH, k2: PATH, k3: PATH, k4: PATH, cmd: T): void
  (k1: PATH, k2: PATH, k3: PATH, k4: PATH, k5: PATH, cmd: T): void
  (k1: PATH, k2: PATH, k3: PATH, k4: PATH, k5: PATH, k6: PATH, cmd: T): void
}

export type NameBase = {
  base: string
  list: string
  id: string
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

export type SortIterationCmd = Many<
  | ListIterator<any, NotVoid>
  | ListIteratee<any>
  | ObjectIterator<any, NotVoid>
  | ObjectIteratee<any>
>

export type SortCmd = [SortIterationCmd] | [SortIterationCmd, Many<boolean | 'asc' | 'desc'>]

export type OrderCmd = Partial<{
  belongs_to: string
  pluck: string
  index: string
  cover: string[]
  diff: string[]
  quantile: number
  mode: boolean
  page: boolean
  sort: SortCmd
}>

export type ReduceOrder<O extends MODEL_DATA> = List<O> &
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

export type PlainData<O> = Partial<O>[] | { [id: string]: Partial<O> }

export interface Memory {
  [key: string]: Datum
}

export interface SetContext<O extends MODEL_DATA> {
  model: typeof Model | typeof Struct
  all: Query<O>
  base: Cache
  journal: Cache
  meta: Metadata
  deploys: DEPLOY<any, any>[]
  from: PlainData<O>
  parent: Object | undefined
}

export type CLASS<O> = {
  $name: NameBase
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
  _id?: ID
  id: ID
}
