/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('./models/index')
const { Query, Set } = require('../lib/index')

const geo = require('./yaml/work_geo_orm.yml')
Set.work_location.reset(geo)

const drillup = (item) =>
  (() => {
    const result = []
    while (item) {
      expect(item).toMatchSnapshot()
      result.push((item = item.work_location))
    }
    return result
  })()

describe('work location', function () {
  test('query size', function () {
    expect(Query.work_locations.list.length).toMatchSnapshot()
  })

  test('埼玉県-さいたま市 navi', function () {
    expect(
      Query.work_locations.where({ _id: /^埼玉県-さいたま市-/ }).reduce.id_tree
    ).toMatchSnapshot()
  })

  test('all 宮町 navi', function () {
    expect(Query.work_locations.where({ _id: /-宮町/ }).reduce.id_tree).toMatchSnapshot()
  })

  test('id longest with zip', function () {
    drillup(Query.work_locations.where((o) => o.zipcode).sort('id_ary.length', 'desc').list[0])
  })

  test('id longest no zip', function () {
    drillup(Query.work_locations.where((o) => !o.zipcode).sort('id_ary.length', 'desc').list[0])
  })

  test('drill-down UI query', function () {
    let q, item
    q = Query.work_locations.where((o) => !o.work_location_id)
    expect(q.pluck('label')).toMatchSnapshot()
    item = q.where({ idx: '埼玉県' }).list[0]
    expect(item).toMatchSnapshot()

    q = item.work_locations.sort(['id_ary.length', 'name.length', 'name'], ['desc', 'desc', 'asc'])
    expect(q.pluck('label')).toMatchSnapshot()
    item = q.where({ idx: 'さいたま市' }).list[0]
    expect(item).toMatchSnapshot()

    q = item.work_locations.sort(['id_ary.length', 'name.length', 'name'], ['desc', 'desc', 'asc'])
    expect(q.pluck('label')).toMatchSnapshot()
    item = q.where({ idx: '北区' }).list[0]
    expect(item).toMatchSnapshot()

    q = item.work_locations.sort(['id_ary.length', 'name.length', 'name'], ['desc', 'desc', 'asc'])
    expect(q.pluck('label')).toMatchSnapshot()
    item = q.where({ idx: '宮原町' }).list[0]
    expect(item).toMatchSnapshot()

    q = item.work_locations.sort(['id_ary.length', 'name.length', 'name'], ['desc', 'desc', 'asc'])
    expect(q.pluck('label')).toMatchSnapshot()
  })
})
