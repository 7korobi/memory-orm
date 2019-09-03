{ Model, Set, Rule } = require "../../src/index"

new Rule("path").schema ->
  @path "folder", "book", "*"


Set.path.add _id: "book-1-aaa"
Set.path.add _id: "book-1-bbb"
Set.path.add _id: "book-1-bbb-ccc"
Set.path.add _id: "book-1-bbb-ddd"
Set.path.add _id: "book-1-bbb-ddd-eee"
Set.path.add _id: "book-1-ccc-ddd"
Set.path.add _id: "book-1-ccc-eee"
Set.path.add _id: "book-1-ddd-eee"
Set.path.add _id: "book-1-fff-ggg-hhh-iii"

