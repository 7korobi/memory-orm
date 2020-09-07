/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const Mem = require('../lib/index')

describe('faces', function () {
  const { name_head } = Mem.Query.faces.reduce
  test('name_blank snapshot', () => expect(Mem.Query.faces.name_blank()).toMatchSnapshot())

  test('reduce name_head snapshot', function () {
    const _data = (() => {
      const result = []
      for (let o of name_head) {
        if (o) {
          result.push(o.map((oo) => [oo.id, oo.set]))
        } else {
          result.push(undefined)
        }
      }
      return result
    })()
    return expect(_data).toMatchSnapshot()
  })

  Mem.Query.tags.ids.map(function (tag) {
    const data = Mem.Query.faces.tag(tag).pluck('id', 'name', 'chr_jobs.list', 'chr_npcs.list')

    test(`reduce.tag[${tag}] snapshot`, function () {
      const o = Mem.Query.faces.reduce.tag[tag]
      return expect([tag, o.count, o.set]).toMatchSnapshot()
    })

    test(`.tag(${tag}) id snapshot`, function () {
      const _data = data.map((o) => o[0])
      return expect(_data).toMatchSnapshot()
    })

    test(`.tag(${tag}) name snapshot`, function () {
      const _data = data.map((o) => o[1])
      return expect(_data).toMatchSnapshot()
    })

    test(`.tag(${tag}) job snapshot`, function () {
      const _data = data.map((o) => o[2].map((oo) => oo.job))
      return expect(_data).toMatchSnapshot()
    })

    return test(`.tag(${tag}) npc snapshot`, function () {
      const _data = data.map((o) => o[3].map((oo) => [oo.label, oo.say_0, oo.say_1]))
      return expect(_data).toMatchSnapshot()
    })
  })

  Mem.Query.tags.ids.map(function (tag) {
    const data = Mem.Query.faces.name_head(tag)
    return test(`.name_head(${tag}) snapshot`, function () {
      const { cover, remain } = data
      const _data = (() => {
        const result = []
        for (let o of data) {
          if (o) {
            result.push(o.map((oo) => [oo.id, oo.set]))
          } else {
            result.push(undefined)
          }
        }
        return result
      })()
      expect({ cover, remain }).toMatchSnapshot()
      return expect(_data).toMatchSnapshot()
    })
  })
})
