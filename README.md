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

Set.todo.merge([{
  _id: 1,
  label: "歯を磨く"
},{
  _id: 2,
  label: "宿題をする"
},{
  _id: 3,
  label: "お風呂はいる"
}]);

Set.check.merge([{
  _id: 1,
  todo_id: 1,
  label: "右上",
  checked: true
},{
  _id: 2,
  todo_id: 1,
  label: "左上",
  checked: true
},{
  _id: 3,
  todo_id: 3,
  label: "シャワー浴びる",
  checked: false
},{
  _id: 4,
  todo_id: 3,
  label: "肩まで入って１０数える",
  checked: true
}]);

Query.todos.pluck("label")
Query.todos.find(3).checks.where({ checked: true }).list
Query.todos.find(3).checks.where({ checked: false }).list
```

## map reduce

```javascript
const { Rule, Set, Query } = require("memory-orm");

new Rule("position").schema(function() {
  this.model = class model extends this.model {
    static map_reduce (o, emit){
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
