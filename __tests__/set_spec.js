/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const Mem = require('../lib/index')

const keys = [
  'tag',
  'face',
  'chr_set',
  'chr_npc',
  'chr_job',
  'locale',
  'random',
  'folder',
  'role',
  'able',
  'sow_village',
  'sow_village_plan',
  'sow_roletable',
]

keys.map((key) =>
  describe(key, function () {
    test('all is query', () => expect(Mem.Set[key].all).toEqual(Mem.Query[key + 's']))
    test('$name snapshot', () => expect(Mem.Set[key].$name).toMatchSnapshot())
  })
)
