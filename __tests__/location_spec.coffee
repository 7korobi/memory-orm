require "./models/index"
{ Query, Set } = require "../src/index"

geo = require '~/yaml/work_geo_orm.yml'
Set.work_location.reset geo

drillup = (item)->
  while item
    expect item
    .toMatchSnapshot()
    item = item.work_location

describe "work location", ->
  test 'query size', ->
    expect Query.work_locations.list.length
    .toMatchSnapshot()
    return

  test '埼玉県-さいたま市 navi', ->
    expect Query.work_locations.where(_id: /^埼玉県-さいたま市-/).reduce.id_tree
    .toMatchSnapshot()
    return

  test 'all 宮町 navi', ->
    expect Query.work_locations.where(_id: /-宮町/).reduce.id_tree
    .toMatchSnapshot()
    return

  test 'id longest with zip', ->
    drillup Query.work_locations.where((o)-> o.zipcode).sort("id_ary.length","desc").list[0]
    return

  test 'id longest no zip', ->
    drillup Query.work_locations.where((o)-> ! o.zipcode ).sort("id_ary.length","desc").list[0]
    return

  test 'drill-down UI query', ->
    q = Query.work_locations.where((o)-> ! o.work_location_id)
    expect( q.pluck("label") ).toMatchSnapshot()
    item = q.where(idx: '埼玉県').list[0]
    expect( item ).toMatchSnapshot()

    q = item.work_locations.sort(["id_ary.length", "name.length", "name"], ["desc", "desc", "asc"])
    expect( q.pluck("label") ).toMatchSnapshot()
    item = q.where(idx: 'さいたま市').list[0]
    expect( item ).toMatchSnapshot()

    q = item.work_locations.sort(["id_ary.length", "name.length", "name"], ["desc", "desc", "asc"])
    expect( q.pluck("label") ).toMatchSnapshot()
    item = q.where(idx: '北区').list[0]
    expect( item ).toMatchSnapshot()

    q = item.work_locations.sort(["id_ary.length", "name.length", "name"], ["desc", "desc", "asc"])
    expect( q.pluck("label") ).toMatchSnapshot()
    item = q.where(idx: '宮原町').list[0]
    expect( item ).toMatchSnapshot()

    q = item.work_locations.sort(["id_ary.length", "name.length", "name"], ["desc", "desc", "asc"])
    expect( q.pluck("label") ).toMatchSnapshot()
    return


  return

