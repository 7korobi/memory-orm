/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const Mem = require('../lib/index')

const test_is = (target, list, key, src) =>
  test(`${target} ${list} ${key}`, function () {
    const base = Mem.State.base(list)
    const tgt = JSON.parse(JSON.stringify(base[target][key]))
    return expect(tgt).toEqual(src)
  })

const do_test = function (list_id, { $sort, $memory, $format }) {
  let key, o
  test(`$sort ${list_id}`, () => expect($sort).toMatchSnapshot())
  test(`$format ${list_id}`, () => expect($format).toMatchSnapshot())
  test(`$memory ${list_id}`, () => expect($memory).toMatchSnapshot())

  for (key in $sort) {
    o = $sort[key]
    test_is('$sort', list_id, key, o)
  }
  for (key in $format) {
    o = $format[key]
    test_is('$format', list_id, key, o)
  }
  return (() => {
    const result = []
    for (key in $memory) {
      o = $memory[key]
      result.push(test_is('$memory', list_id, key, o))
    }
    return result
  })()
}

describe('transaction', function () {
  test('_step', function () {
    expect(Mem.State.step).toMatchSnapshot()
    return new Promise((ok, ng) =>
      setTimeout(function () {
        expect(Mem.Query.static.react).toMatchSnapshot()
        return ok()
      }, 10)
    )
  })
})

describe('stringify', function () {
  const json = JSON.parse(JSON.stringify(Mem.Query.static.meta))
  do_test('randoms', json.pack.randoms)
  do_test('faces', json.pack.faces)
  do_test('tags', json.pack.tags)
})

describe('json', function () {
  const json = JSON.parse(Mem.Query.static.meta.json())
  do_test('randoms', json.pack.randoms)
  do_test('faces', json.pack.faces)
  do_test('tags', json.pack.tags)
})
