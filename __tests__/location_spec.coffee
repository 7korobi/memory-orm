require "./models/index"
{ Query, Set } = require "../src/index"

geo = require '~/yaml/work_geo_orm.yml'
Set.work_location.reset geo

drillup = (item)->
  while item
    expect item
    .toMatchSnapshot()
    item = item.work_location

drilldown = (item, idx)->
  while item
    expect item
    .toMatchSnapshot()
    item = item.work_locations.list[idx]

describe "work location", ->
  test 'query size', ->
    expect Query.work_locations.list.length
    .toMatchSnapshot()
    return

  test 'query size with zip', ->
    drillup Query.work_locations.sort("id_ary.length","desc").list[0]
    return

  test 'query size no zip', ->
    drillup Query.work_locations.where((o)-> ! o.zipcode ).sort("id_ary.length","desc").list[0]
    return

  test 'query for toplevel', ->
    drilldown Query.work_locations.where((o)-> ! o.work_location_id ).sort("id_ary.length","desc").list[10], 0
    return


  return

