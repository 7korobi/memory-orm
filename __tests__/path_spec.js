/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const Mem = require('../lib/index')

describe('path', function () {
  test('children snapshot', () => {
    expect(Mem.Query.paths.pluck('id', 'paths.list')).toMatchSnapshot()
  })
  test('parent snapshot', () => {
    expect(Mem.Query.paths.pluck('id', 'path')).toMatchSnapshot()
  })
  test('reduce id snapshot', () => {
    expect(Mem.Query.paths.reduce.id).toMatchSnapshot()
  })
})
