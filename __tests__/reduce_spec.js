/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const Mem = require('../lib/index')

const keys = ['locales', 'randoms', 'folders', 'roles', 'ables', 'sow_roletables']

keys.map((key) =>
  describe(key, function () {
    test('reduce snapshot', () => expect(Mem.Query[key].reduce).toMatchSnapshot())
  })
)
