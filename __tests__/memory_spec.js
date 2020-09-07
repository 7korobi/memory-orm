/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const Mem = require('../lib/index')

const keys = [
  'tags',
  'faces',
  'chr_sets',
  'chr_npcs',
  'chr_jobs',
  'locales',
  'randoms',
  'folders',
  'roles',
  'ables',
  'sow_roletables',
]

keys.map((key) =>
  describe(key, function () {
    test('memory snapshot', function () {
      const _memory = {}
      for (id in Mem.Query[key].memory) {
        const { $group, item, meta } = Mem.Query[key].memory[id]
        _memory[id] = { $group, item }
      }
      return expect(_memory).toMatchSnapshot()
    })
  })
)
