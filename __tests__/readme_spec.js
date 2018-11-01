const { Rule, Set, Query } = require("../lib/index.min");

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

describe("query.todos", ()=> {
  test('checked snapshot', ()=> {
    expect(Query.todos.find(3).checks.where({ checked: true }).list).toMatchSnapshot()
  })
  test('not checked snapshot', ()=> {
    expect(Query.todos.find(3).checks.where({ checked: false }).list).toMatchSnapshot()
  })
})
