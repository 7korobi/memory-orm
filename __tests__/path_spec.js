/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const Mem = require('../lib/index')

describe('path', function () {
  test('children snapshot', () => {
    expect(Mem.Query.paths.pluck('doc_id', 'paths.list')).toMatchSnapshot()
  })
  test('parent snapshot', () => {
    expect(Mem.Query.paths.pluck('doc_id', 'path_id', 'path')).toMatchSnapshot()
  })
  test('reduce id snapshot', () => {
    expect(Mem.Query.paths.reduce.doc_id).toMatchSnapshot()
  })
})
