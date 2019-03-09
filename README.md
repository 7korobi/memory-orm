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
 belongs_to | data's prototype is Query[key].find( object index or item.id )
 page |  | separate by size. size already set by Query.page(size)
 sort |  | lodash.orderBy(...key)
 cover | remain, cover | key has full index. cover has index. remain not has index.
 pluck |  | get path data by list values.
 index |  | group by item[key].
 group_by |  | group by item[key]. item[key] is String
 


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
 static | update | event when add data exist.
 static | create | event when add data not exist.
 static | delete | event when del data exist.
 static | bless  | value become extends this
 static | map_partition | define map reduce.
 static | map_reduce    | define map reduce.
 static | order         | define order process for reduced value.


### List

 style | name | action
 :-- | :-- | :--
 . | pluck | get path data
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
 . | schema | execute schema definition block.
 . | key_by | id value. default: _id
 . | deploy | data adjust before Set.
 . | scope  | define query shorthand.
 . | property | define property shorthand.
 . | default_scope | root Query replace.
 . | shuffle | root Query replace. and replace sort order by Math.random.
 . | order | root Query replace. and replace order.
 . | path | set name property. for id separate by '-'.
 . | belongs_to | set target property. find by `${target}_id` 
 . | habtm | set target property. finds by `${target}_ids`
 . | has_many | set target property. find from `${target}_id` by _id
 . | tree | set 'nodes' method. scan recursivery by `${target}_id`
 . | graph | set 'path' method. scan recursivery by `${target}_id`
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
 . | transaction | get transaction diff data.
 . | store       | merge transaction diff data. 
 . | step.< plural name > | countup if data manipulation.


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
 . | where | copy Query and add conditions.
 . | in | copy Query and add conditions. (includes algorythm.)
 . | partition | copy Query and replace partition.
 . | search | copy Query and add conditions. for data search_words value.
 . | shuffle | copy Query and replace sort order by Math.random.
 . | order | copy Query and replace order.
 . | sort | copy Query and replace order's sort parameter.
 . | page | copy Query and replace page_by.
 . | find | pick first data from hash by ids.
 . | finds | pick all data from hash by ids.
 . | pluck | get path data by list values.
 get | reduce | calculate map reduce.
 get | list | calculate list. ( same as reduce.list )
 get | hash | calculate hash. ( same as reduce.hash )
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
