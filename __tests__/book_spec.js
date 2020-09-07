/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const Mem = require('../lib/index')

const test_is = (target, list, key, o) =>
  test(`${target} ${list} ${key}`, function () {
    const base = Mem.State.base(list)
    return expect(base[target][key]).toEqual(o)
  })

describe('___', function () {
  test('___', () => expect(1).toEqual(1))
})
