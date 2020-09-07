require('./models/index')
const Mem = require('../lib/index')

describe('gryph', function () {
  test('points snapshot', function () {
    expect(Mem.Query.points.reduce).toMatchSnapshot()
  })

  test('point structure snapshot', function () {
    expect(Mem.Query.points.pluck('id', 'x', 'y')).toMatchSnapshot()
  })

  test('lines snapshot', function () {
    expect(Mem.Query.lines.reduce).toMatchSnapshot()
  })

  test('deltas snapshot', function () {
    expect(Mem.Query.deltas.reduce).toMatchSnapshot()
  })
})
