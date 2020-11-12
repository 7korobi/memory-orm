/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Model, Set, Rule } = require('../../lib/index')

new Rule('path').schema(function () {
  this.path(['folder', 'book', '*'], { pk: 'doc_id' })
})

Set.path.add({ _id: 1, doc_id: 'book-1-aaa' })
Set.path.add({ _id: 2, doc_id: 'book-1-bbb' })
Set.path.add({ _id: 3, doc_id: 'book-1-bbb-ccc' })
Set.path.add({ _id: 4, doc_id: 'book-1-bbb-ddd' })
Set.path.add({ _id: 5, doc_id: 'book-1-bbb-ddd-eee' })
Set.path.add({ _id: 6, doc_id: 'book-1-ccc-ddd' })
Set.path.add({ _id: 7, doc_id: 'book-1-ccc-eee' })
Set.path.add({ _id: 8, doc_id: 'book-1-ddd-eee' })
Set.path.add({ _id: 9, doc_id: 'book-1-fff-ggg-hhh-iii' })
