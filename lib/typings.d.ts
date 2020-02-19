/// <reference types="lodash" />

type Many<T> = T | T[];

type SETTER = "reset" | "merge" | "remove" | "update";

type ORDER = Many<boolean | "asc" | "desc" >;
type SORT = [
  Many<_.ListIterator<Item, Item>> | Many<_.ListIteratee<Item>>,
  ORDER
]

type REQ_NODE = null | boolean | string | number | RegExp
type REQ = (o: Item) => boolean | { [path: string]: REQ_NODE | REQ_NODE[] }

type PATH = _.PropertyPath;
type ID = string;

type DATUM = { id: ID } | { _id: ID };
type DATA = DATUM[] | IHash<object>;

type INDEX = { id: ID } | ID;
type INDICES = INDEX[];

type REDUCE_COMMAND = ( string | IReduceCommand )[];
type ORDER_COMMAND = ( string | IOrderCommand )[];

type GET_ID = (this: Item)=> ID;
type EMIT_REDUCE = (...keys: REDUCE_COMMAND) => void;
type EMIT_ORDER = (...keys: ORDER_COMMAND) => void;


type RELATION = {
  key?: string
  target?: string
}

type IHash<T> = { [key: string]: T };

interface IPrototype {
  get?: ()=> any
  set?: (val: any)=> any
  value?: any
  writable?: boolean
  enumerable?: boolean
  configurable: boolean
}

interface IName {
  base: string;
  list: string;
  depends: string[];
  deploys: ((
    this: Item,
    model: ItemClass,
    reduce: EMIT_REDUCE,
    order: EMIT_ORDER
  ) => void)[];
}

interface ICache {
  $sort: { [list: string]: Object };
  $memory: { [list: string]: IMemory };
  $format: { [list: string]: Object };
}

interface IMeta {
  write_at: number;
  depth: number;
  pack: {
    [list: string]: ICache;
  };
  json(): string;
}

interface IMemory {
  meta: IMeta;
  item: Item;
  $group: REDUCE_COMMAND;
}

interface IFormat {
  [path: string]: IReduced
}

interface IContext {
  base: ICache;
  journal: ICache;
  from: INDICES | DATA;
  meta: IMeta;
  model: ItemClass;
  all: Base.Query

  deploys: IName["deploys"];
  parent: Object;

  map: MapClass;
  query: Base.Query;
  memory: IMemory;
  cache: IFormat;
  paths: IFormat;
}

interface IEmitter {
  reduce: EMIT_REDUCE;
  order: EMIT_ORDER;
}
interface IReduceCommand {
  id: ID;
  list: boolean;

  navi: number | string;
  set: number | string;
  max: number | string;
  min: number | string;

  count: number;
  all: number;
  pow: number;
}

interface IReduced {
  hash: IHash<Item>;
  list: Item[];
  set: Item[];

  max_is: Item;
  max: number | string;
  min_is: Item;
  min: number | string;

  count: number;
  all: number;
  pow: number;
}

interface IOrderCommand { }
interface IOrdered {
  from: IReduced
}

interface IGroup { }

interface IMem {
  Name: IHash<IName>
  PureObject(): Object;
}

type SetClass = typeof Base.Set
type MapClass = typeof Base.Map
type ListClass = typeof Base.List
type ItemClass = typeof Base.Model | typeof Base.Struct
type Item = Base.Model | Base.Struct

export class Bases {
  model: ItemClass;
  list: ListClass;
  set: SetClass;
  map: MapClass;
}

export class Rule extends Bases {
  constructor(base: string, cb?: (this: Rule) => void);
  schema(cb: (this: Rule) => void): void;

  scope(cb: (all: Base.Query) => Object): void;
  scope_without_cache(cb: (all: Base.Query) => Object): void;
  default_scope(...args: any[]): void;

  shuffle(...args: any[]): void;
  sort(tgt: string, asc?: ORDER): void;
  order(at: string, sort: SORT): void;

  belongs_to(tgt: string, option?: RELATION): void;
  has_many(tgt: string, option?: RELATION): void;
  habtm(tgt: string, option?: RELATION): void;

  path(...keys: string[]): void;

  graph(option?: RELATION): void;
  tree(option?: RELATION): void;

  property(type: keyof Bases, o: IHash<IPrototype>): void;
  struct(...keys: ( string | GET_ID )[] ): void;
  key_by(keys: PATH | GET_ID ): void;

  private $name: IName;
  private state: ICache;
  private all: Base.Query;

  private deploy(cb: (this: Item) => void): void;
  private use_cache(key: string, val: any): void;
  private depend_on(parent: string): void;
  private relation_graph(key: string, ik: string): void;
  private relation_to_many(key: string, target: string, ik: string, cmd: string, qk: string): void;
  private relation_to_one(key: string, target: string, ik: string, else_id: string): void;
  private relation_tree(key: string, ik: string): void;
}

export const Finder: IHash<Base.Finder>
export const Map: IHash<Base.Map>
export const Name: IHash<IName>
export const Query: IHash<Base.Query>
export const Set: IHash<Base.Set>

export function step(): number;
export function PureObject(): object;
export function merge(o: IHash<DATA | DATUM>): void;

export namespace Base {
  class List {
    constructor(query: Query);

    get first(): Item;
    get last(): Item;
    get head(): Item;
    get tail(): Item;
    get length(): number;
    get uniq(): this;
    [key: number]: Item;

    pluck(...keys: string[]): any[];
    sort(...sort: SORT): this;
    group_by(cb: (o: Item) => string): IHash<Model[]>;
    group_by(cb: (o: Item) => number): Item[][];
    page_by(per: number): Item[][];
    where(req: REQ): Query;
    in(req: REQ): Query;

    private static $name: IName;
    static bless(list: any[], query?: Query): List;
  }

  abstract class Struct {
    get id(): ID;

    static deploy(this: Struct, model: ItemClass): void;
    static map_partition(item: Item, reduce: EMIT_REDUCE): void;
    static map_reduce(item: Item, reduce: EMIT_REDUCE): void;
    static order(item: Item, order: EMIT_ORDER): void;

    static delete(item: Item): void;
    static update(item: Item, old: Item): void;
    static create(item: Item): void;

    private static $name: IName;
    private static bless(o: Item): void;
  }

  abstract class Model {
    get id(): ID;

    static deploy(this: Item, model: ItemClass): void;
    static map_partition(item: Item, reduce: EMIT_REDUCE): void;
    static map_reduce(item: Item, reduce: EMIT_REDUCE): void;
    static order(item: Item, order: EMIT_ORDER): void;

    static delete(item: Item): void;
    static update(item: Item, old: Item): void;
    static create(item: Item): void;

    private static $name: IName;
    private static bless(o: Item): void;
  }

  class Query {
    all: Query;
    in(req: REQ): Query;
    where(req: REQ): Query;
    search(text: string, target?: string): Query;

    distinct(b: boolean): Query;
    partition(...parts: string[]): Query;

    page(page_by: number): Query;
    distance(key: PATH, order: SORT[1], point: number[]): Query;

    shuffle(): Query;
    sort(sort: SORT): Query;
    order(...keys: ORDER_COMMAND): Query;

    find(...ids: ID[]): Item;
    finds(...ids: ID[]): Item[];
    pluck(...args: PATH[]): any[];

    // form(...args: any[]): ;

    get reduce(): IReduced;
    get list(): List;
    get hash(): IHash<Model>;
    get ids(): ID[];
    private memory: IHash<IMemory>;

    static build(...args: any[]): void;

    private $memory: IHash<IMemory>;
    private $partition: string[];
    private $sort: SORT;
    private _step: number;
    private _cache: IHash<Query>;
    private _all_ids: ID[];
    private _is_uniq: boolean;
    private _reduce: IReduced;
    private _finder: Finder;
    private _filters: ((item: Item, meta: IMeta) => boolean)[];
  }

  abstract class Map {
    static init(o: IReduced, cmd: IReduceCommand): void;
    static reduce(query: Query, path: string, item: Item, o: IReduced, cmd: IReduceCommand): void;
    static finish(query: Query, path: string, o: IReduced, list: typeof List): void;
    static order(query: Query, path: string, from: IReduced, origin: IReduced, cmd: IOrderCommand, list: typeof List): IOrdered;
    static dash(query: Query, path: string, from: IOrdered, origin: IReduced, cmd: IOrderCommand, list: typeof List): IOrdered;
    static post_proc(query: Query, path: string, from: IOrdered, origin: IReduced, cmd: IOrderCommand, list: typeof List): IOrdered;

    private static $name: IName;
    private static bless(o: object): Map;
  }

  class Set {
    constructor({ $name: IName, all: Query, model: Item });
    set(list: DATA, parent?: Object): void;
    reset(list: DATA, parent?: Object): void;

    merge(list: DATA, parent?: Object): void;
    append(item: Item, parent?: Object): void;
    add(item: Item, parent?: Object): void;

    reject(list: INDICES): void;
    remove(item: INDEX): void;
    del(item: INDEX): void;

    find(...ids: ID[]): null | Model;

    updates(list: DATA, parent: Object): void;
    update(item: Item, parent: Object): void;

    clear_cache(is_hit?: boolean): void;
    refresh(is_hit: boolean): void;
    rehash(is_hit: boolean): void;

    private static $name: IName;
    private $name: IName;
    private all: Query;
    private model: Item;
    private finder: Finder;
  }

  class Finder {
    $name: IName;
    all: Query;
    map: MapClass;
    list: typeof List;
    model: Item;

    constructor($name: IName);
    join({ all: Query, map: MapClass, list: ListClass, model: Item }): void;

    data_set(type: SETTER, list: DATA | INDICES, parent?: Object): void;
    data_emitter(ctx: IContext, o: Datum): IEmitter;
    data_init(ctx: IContext, o: Datum, emit: IEmitter): void;
    data_entry(ctx: IContext, o: IMemory, emit: IEmitter): void;

    calculate(query: Query, memory: IHash<IMemory>): void;
    reduce(ctx: IContext, ids: ID[]): void;
    finish(ctx: IContext): void;

    reset(ctx: IContext): boolean;
    merge(ctx: IContext): boolean;
    remove(ctx: IContext): boolean;
    update(ctx: IContext, parent: Object): boolean;
  }

  class Datum {
    constructor(meta: IMeta, item: Item);
    meta: IMeta;
    item: Item;
    $group: REDUCE_COMMAND;
    constructor(meta: IMeta, item: Item);
    toJSON(): { item: Item; $group: REDUCE_COMMAND };
  } 
}


interface IReact {
  state: IHash<number>;
  setState(e: this["state"]): void;
}

export namespace State {
  namespace mixin {
    function data(): { $step: State.step };
  }
  function join({ react: IReact }): void;
  function bye({ react: IReact }): void;
  function notify(list: string): void;
  function notify_for_react(): void;

  function transaction(cb: (pack: IMeta) => void, meta: Object): IMeta;
  function meta(): IMeta;
  function base(list: string): ICache;
  function journal(list: string): ICache;

  function store(meta: IMeta): boolean;

  type step = IHash<number>;
  type $base = IMeta;
  type $journal = IMeta;
}

