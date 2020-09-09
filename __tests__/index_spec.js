/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const Mem = require('../lib/index')

const { stories, faces } = require('./json/index.json')

const test_is = (target, list, key, o) =>
  test(`${target} ${list} ${key}`, function () {
    const base = Mem.State.base(list)
    expect(base[target][key]).toEqual(o)
  })

const meta = Mem.State.transaction(function () {
  Mem.Set.sow_village.merge(stories)
  for (var { _id, story_ids } of faces) {
    for (let story_id of story_ids) {
      var vil
      if ((vil = Mem.Query.sow_villages.find(story_id))) {
        vil.aggregate.face_ids.push(_id.face_id)
      }
    }
  }
})
const json = JSON.parse(meta.json())
Mem.State.store(json)

describe('sow oldlog', function () {
  let $format, $memory, $sort, key, list_id, o
  for (list_id in json.pack) {
    ;({ $sort, $memory, $format } = json.pack[list_id])
    for (key in $sort) {
      o = $sort[key]
      test_is('$sort', list_id, key, o)
    }
  }

  for (list_id in json.pack) {
    ;({ $sort, $memory, $format } = json.pack[list_id])
    for (key in $format) {
      o = $format[key]
      test_is('$format', list_id, key, o)
    }
  }

  // $memory check 省略

  test('sd sow_villages', () => expect(Mem.Query.sow_villages.reduce.size_sd).toMatchSnapshot())

  test('sd sow_villages', function () {
    const data = Mem.Query.sow_villages.pluck('id', 'vpl.0')
    expect(
      data.map(([id, size]) => [id, size, Mem.Query.sow_villages.reduce.size_sd.standard(size)])
    ).toMatchSnapshot()
  })

  test("list' sow_villages", () => expect(Mem.Query.sow_villages.list.diff).toMatchSnapshot())

  test("list'' sow_villages", () => expect(Mem.Query.sow_villages.list.diff.diff).toMatchSnapshot())

  test("list''' sow_villages", () =>
    expect(Mem.Query.sow_villages.list.diff.diff.diff).toMatchSnapshot())

  test("list'''' sow_villages", () =>
    expect(Mem.Query.sow_villages.list.diff.diff.diff.diff).toMatchSnapshot())
})
