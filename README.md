[![Build Status](https://travis-ci.org/7korobi/memory-orm.svg?branch=master)](https://travis-ci.org/7korobi/memory-orm)

## Install

```shell
yarn add memory-orm
```

## Quick Start

```javascript
const { Rule, Set, Query } = require("memory-orm");

new Rule("todo").schema(function() {
  this.has_many("checks");
});

new Rule("check").schema(function() {
  this.belongs_to("todo");
});

Set.todo.merge([
  {
    _id: 1,
    label: "歯を磨く"
  },
  {
    _id: 2,
    label: "宿題をする"
  },
  {
    _id: 3,
    label: "お風呂はいる"
  }
]);

Set.check.merge([
  {
    _id: 1,
    todo_id: 1,
    label: "右上",
    checked: true
  },
  {
    _id: 2,
    todo_id: 1,
    label: "左上",
    checked: true
  },
  {
    _id: 3,
    todo_id: 3,
    label: "シャワー浴びる",
    checked: false
  },
  {
    _id: 4,
    todo_id: 3,
    label: "肩まで入って１０数える",
    checked: true
  }
]);

Query.todos.pluck("label");
Query.todos.find(3).checks.where({ checked: true }).list;
Query.todos.find(3).checks.where({ checked: false }).list;
```

## map reduce

 name | target | action
 :-- | :-- | :--
 count | count | reduce +
 all | all | reduce +
 all, count | avg | all / count
 pow | pow | reduce *
 pow, count | avg | pow / count
 list | list | listup object ( key is not use )
 set | set, hash | hash has item by key. set is unique keys.
 min | min, min_is | pick min key. min_is is item.
 max | max, max_is | pick max key. max_is is item.
 min, max | range | max - min
 min, max, all | range, density | all / range


```javascript
const { Rule, Set, Query } = require("memory-orm");

new Rule("position").schema(function() {
  this.model = class model extends this.model {
    static map_reduce (o, emit) {
      for ( const p of o.position ) {
        emit("position", { count: 1, all: p, min: p, max: p})
      }
    }
  }
});

Set.position.merge([{
  "_id": "x1",
  "position": [40,60,80,100,200]
},{
  "_id": "y1",
  "position": [70,190,220,160,240]
},{
  "_id": "x2",
  "position": [40,60,80,100,200]
},{
  "_id": "y2",
  "position": [20,90,20,60,40]
}])

{ count, all, avg, density, min, min_is, max, max_is, range } = Query.where({_id: "x1"}).reduce.position
```

## order

 name | target | action
 :-- | :-- | :--
 belongs_to | | data's prototype is Query[key].find( object index or item.id )
 page |  | separate by page-size. see: `Query.page(size)`
 sort |  | lodash.orderBy(...key)
 diff | diff | calculate differential. use with sort.
 cover | remain, cover | key has full index. cover has index. remain not has index.
 pluck |  | get path data by list values.
 index |  | group by item[key].


```javascript
const { Rule, Set, Query } = require("memory-orm");

new Rule("check").schema(function() {
  this.model = class model extends this.model {
    static map_reduce(o, emit) {
      emit("asc", { list: true });
      emit("desc", { list: true });
    }
    static order(o, emit) {
      emit("asc",  "list", { sort: ["label",  "asc"] });
      emit("desc", "list", { sort: ["label", "desc"] });
    }
  };
});

Set.check.merge([
  {
    _id: 1,
    todo_id: 1,
    label: "右上",
    checked: true
  },
  {
    _id: 2,
    todo_id: 1,
    label: "左上",
    checked: true
  },
  {
    _id: 3,
    todo_id: 3,
    label: "シャワー浴びる",
    checked: false
  },
  {
    _id: 4,
    todo_id: 3,
    label: "肩まで入って１０数える",
    checked: true
  }
]);

Query.checks.reduce.asc.list.pluck("label");
Query.checks.reduce.desc.list.pluck("label");
```

## class list

### Model

 style | name | action
 :-- | :-- | :--
 get | id | same as _id
 static | deploy(model) | event when Set item. this is item. model is class.
 static | update(item, old_item) | event when add data exist.
 static | create(item) | event when add data not exist.
 static | delete(old_item) | event when del data exist.
 static | bless(item)  | value become extends this
 static | map_partition(item, emit) | define map reduce. emit is function.
 static | map_reduce(item, emit)    | define map reduce. emit is function.
 static | order(item, emit) | define order process for reduced value.


### List

 style | name | action
 :-- | :-- | :--
 . | pluck(...keys) | listup by keys for item.
 . | where(...) | create query. see Query#where
 . | in(...) | create query. see Query#in
 get | first | [0]
 get | head  | [0]
 get | tail  | [length - 1]
 get | last  | [length - 1]
 get | uniq  | get unique values

```javascript
const { list } = Query.checks.reduce.asc
list.pluck("label")
list.first
list.head
list.tail
list.last
```


### Rule

 style | name | action
 :-- | :-- | :--
 . | schema(dsl) | execute schema definition dsl.
 . | key_by(keys) | id value. default: `_id`
 . | key_by(callback) | callback return id. default: `this._id`
 . | deploy(callback) | data adjust before Set. 
 . | scope(callback)  | define query shorthand and cached.
 . | property(...) | define property shorthand.
 . | default_scope(callback) | root Query replace.
 . | shuffle() | root Query replace. and replace sort order by Math.random.
 . | order(...) | root Query replace. and replace order.
 . | sort(...) | root Query replace. and replace order.
 . | path(...keys) | set name property. for id separate by '-'. add argument '*', tree structure by id.
 . | belongs_to(to, options) | set target property. find by `${target}_id` 
 . | habtm(to, option) | set target property. finds by `${target}_ids`
 . | has_many(to, option) | set target property. find from `${target}_id` by _id
 . | tree(option) | set 'nodes' method. scan recursivery by `${target}_id`
 . | graph(option) | set 'path' method. scan recursivery by `${target}_id`
 . | model | Model base class ( need extends )
 . | list  | List base class ( need extends )
 . | set  | Set base class ( need extends )
 . | map  | Map base class ( need extends )

```javascript
new Rule("todo").schema(function() {
  this.key_by(function() { return this._id })
  this.deploy(function(model) {
    this.search_words = this.label
  })
  this.scope(function(all) {
    return {
      scan: (word)=> all.where({ checked: true }).search(word)
    }
  })
})
```


### State

 style | name | action
 :-- | :-- | :--
 . | transaction(callback, meta) | get transaction diff data.
 . | store(meta)            | merge transaction diff data. 
 . | step.< plural name > | countup if data manipulation.
 get | mixin | for vue.js mixin.


### Set.< base name >

 style | name | action
 :-- | :-- | :--
 . | set    | set data. and old data cleanup.
 . | reset  | set data. and old data cleanup.
 . | merge  | set data.
 . | add    | set datum.
 . | append | set datum.
 . | reject | remove data.
 . | del    | remove datum.
 . | remove | remove datum.
 . | clear_cache | recalculate query caches.
 . | refresh     | recalculate query caches.
 . | rehash      | recalculate query caches.
 . | find | pick first data from all memory by ids. and mark for transaction.

```javascript
const {
  checks: {
    $sort,
    $memory,
    $format,
  }
} = State.transaction(=>{
  Set.check.add({
    _id: 10,
    todo_id: 1,
    label: "新しい項目",
    checked: true
  })
  Set.check.del({ _id: 10 })
})
State.store(JSON.parse(JSON.stringify({ checks: { $sort, $memory, $format }})))
```


### Query.< plural name >

 style | name | action
 :-- | :-- | :--
 . | where({ [key]: val }) | copy Query and add conditions. same `(o)=> val === o[key]`
 . | where({ [key]: /regexp/ }) | copy Query and add conditions. same `(o)=> (/regexp/).test( o[key] )`
 . | where({ [key]: [...args] }) | copy Query and add conditions. same `(o)=> args.includes( o[key] )`
 . | in({ [key]: val }) | copy Query and add conditions. same `(o)=> o[key].includes( val )`
 . | in({ [key]: /regexp/ }) | copy Query and add conditions. same `(o)=> o[key].find((oo)=> (/regexp/).test( oo ))`
 . | in({ [key]: [...args] }) | copy Query and add conditions. same `(o)=> o[key].find((oo)=> args.find((arg)=> oo == arg))`
 . | partition(keys) | copy Query and replace partition keys. default: `["set"]`
 . | search(text) | copy Query and add conditions. for "q.search_words"
 . | shuffle() | copy Query and replace sort order by Math.random.
 . | distance(key, "asc", [...point]) | copy Query and replace order. near `o[key]` is top.
 . | distance(key, "desc", [...point]) | copy Query and replace order. far `o[key]` is top.
 . | order(keys, order) | copy Query and replace order.
 . | sort(...sort) | copy Query and replace order's sort parameter. same `this.order({ sort })`
 . | page(size) | copy Query and replace page_by. if order option set page: true, resuls page separated list.
 . | find(...ids) | pick first data from hash by ids.
 . | finds(ids) | pick all data from hash by ids.
 . | pluck(...keys) | get path data by keys.
 get | reduce | calculate map reduce.
 get | list | calculate list. ( same `reduce.list` )
 get | hash | calculate hash. ( same `reduce.hash` )
 get | ids | calculate hash and get keys.
 get | memory | all stored data.
 
```javascript
Query.positions.in({ position: 100 }).pluck("_id")
Query.positions.in({ position: [100, 90] }).pluck("_id")
Query.checks.shuffle().pluck("label")
Query.checks.sort("label").pluck("label")
Query.checks.sort("label",  "desc").pluck("label")
Query.checks.order({ sort: ["label", "desc"] }).pluck("label")
Query.checks.page(3).list[0][0]
Query.checks.page(3).list[0][1]
Query.checks.page(3).list[0][2]
Query.checks.page(3).list[1][0]
```
