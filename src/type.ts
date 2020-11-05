import { ListIteratee, ListIterator, Many, NotVoid, ObjectIteratee, ObjectIterator } from 'lodash'

import { Metadata, Rule } from './mem'
import { Model } from './model'
import { Struct } from './struct'
import { Query } from './query'
import { Datum } from './datum'
import { List } from './list'
import { Set } from './set'

type NAVI_LEAF = number

export type DATA<O> = Partial<O>[] | { [id: string]: Partial<O> }
export type DATUM<O> = Partial<O>

export type DIC<T> = { [key: string]: T }
export type HASH<K extends string, T> = { [key in K]: T }

export type SET<A extends DEFAULT_RULE_TYPE> = Set<A>
export type LIST<A extends DEFAULT_RULE_TYPE> = List<A>
export type QUERY<A extends DEFAULT_RULE_TYPE> = Query<A>
export type QUERY_WITH_SCOPE<A extends DEFAULT_RULE_TYPE> = Query<A> & A[2]

export type ID = string | number
export type PATH = string | (string | number)[]
export type LeafEmitter = Emitter<LeafCmd>
export type OrderEmitter = Emitter<OrderCmd>

export type MODEL = Model | Struct

export interface MODEL_DATA {
  idx?: string
  _id?: string
  id: string
}

export type NAVI = {
  [key: string]: NAVI | NAVI_LEAF
}

export type DEPLOY<O> = {
  (this: O, cmd: { o: O; model: CLASS<O>; reduce: LeafEmitter; order: OrderEmitter }): void
}

export type SCHEMA<A extends DEFAULT_RULE_TYPE> = {
  (this: Rule<A>): void
}

export type SCOPE<A extends DEFAULT_RULE_TYPE> = {
  (all: QUERY_WITH_SCOPE<A>): Partial<A[2]>
}

export type DEFAULT_RULE_TYPE = [MODEL_DATA, DIC<any>, DIC<any>]

export type Emitter<T> = {
  (keys: PATH, cmd: T): void
}

export type NameBase = {
  base: string
  list: string
  id: string
  ids: string
  relations: string[]
  deploys: DEPLOY<any>[]
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

export type PathCmd = {
  key: string
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

export type ReduceOrderPage<A extends DEFAULT_RULE_TYPE> = ReduceOrder<A>[] & {
  query: Query<A>
  from: ReduceLeaf

  all: number
  page_idx(this: Reduce[][], item: Object): number | null
}

export type ReduceOrder<A extends DEFAULT_RULE_TYPE> = List<A> &
  Partial<{
    query: Query<A>
    from: ReduceLeaf

    id: string
    all: number
    remain: string[]
    cover: string[]
    quantile: ReduceOrder<A>
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

export type ReduceDefault<A extends DEFAULT_RULE_TYPE> = {
  list: LIST<A>
  hash: HASH<string, A>
}

export interface Memory {
  [key: string]: Datum
}

export interface SetContext<A extends DEFAULT_RULE_TYPE> {
  model: typeof Model | typeof Struct
  all: Query<A>
  base: Cache
  journal: Cache
  meta: Metadata
  deploys: DEPLOY<any>[]
  from: DATA<A[0]>
  parent: Object | undefined
}

export type CLASS<O> = {
  $name: NameBase
  bless(data: any, query?: any): asserts data is O
  new (): O
  new (rule: any): O
}

export type QUERY_ARGS = {
  [path: string]: (string | number)[] | RegExp | string | number | boolean | null
}
