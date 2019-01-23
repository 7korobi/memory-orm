const { Rule, Set, Query } = require("../lib/index.min");

new Rule("todo").schema(function() {
  this.key_by(function() { return this._id })
  this.has_many("checks");

  this.deploy(function(model) {
    this.search_words = this.label
  })

  this.scope(function(all) {
    return {
      scan: (word)=> all.where({ checked: true }).search(word)
    }
  })
});
new Rule("check").schema(function() {
  this.belongs_to("todo");

  this.model = class model extends this.model {
    static map_reduce(o, emit) {
      emit("asc", { list: true });
      emit("desc", { list: true });
    }
    static order(o, emit) {
      emit("list", { sort: ["label",  "asc"], page: true });
      emit("asc",  "list", { sort: ["label",  "asc"] });
      emit("desc", "list", { sort: ["label", "desc"] });
    }
  };
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

$inc = 0
describe("query.checks", ()=> {
  test('page snapshot.', ()=> {
    expect(Query.checks.page(3).list).toMatchSnapshot()
  })
  test('shuffle snapshot.', ()=> {
    Math.random = function(){ return ++$inc }
    expect(Query.checks.shuffle().pluck("label")).toMatchSnapshot()
  })
  test('order asc snapshot', ()=> {
    expect(Query.checks.reduce.asc.list.pluck("label")).toMatchSnapshot()
    expect(Query.checks.sort("label").pluck("label")).toMatchSnapshot()
  })
  test('order desc snapshot', ()=> {
    expect(Query.checks.reduce.desc.list.pluck("label")).toMatchSnapshot()
    expect(Query.checks.sort("label",  "desc").pluck("label")).toMatchSnapshot()
  })
})

describe("query.todos", ()=> {
  test('labels snapshot', ()=> {
    expect(Query.todos.pluck("label")).toMatchSnapshot()
  })
  test('checked snapshot', ()=> {
    expect(Query.todos.find(3).checks.where({ checked: true }).list).toMatchSnapshot()
  })
  test('not checked snapshot', ()=> {
    expect(Query.todos.find(3).checks.where({ checked: false }).list).toMatchSnapshot()
  })
})

describe("query.positions", ()=> {
  test('x1 snapshot', ()=> {
    expect(Query.positions.where({_id: "x1"}).reduce).toMatchSnapshot()
  })
  test('in 100', ()=> {
    expect(Query.positions.in({ position: 100 }).pluck("_id")).toMatchSnapshot()
    expect(Query.positions.in({ position: [100, 90] }).pluck("_id")).toMatchSnapshot()
  })
  test('checked snapshot', ()=> {
    expect(Query.positions.reduce).toMatchSnapshot()
  })
})