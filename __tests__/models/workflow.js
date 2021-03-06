'use strict'

const { Rule } = require('../../lib/index')
const { Model } = require('../../lib/base')

class WorkLocation extends Model {
  get id_ary() {
    return this.id.split('-')
  }
  get prefecture() {
    return this.id_ary[0]
  }
}
class WorkCountry extends Model {}
class WorkName extends Model {}

exports.WorkLocation = WorkLocation
exports.WorkCountry = WorkCountry
exports.WorkName = WorkName

new Rule('work_location', WorkLocation).schema(function () {
  this.order('list', {
    sort: [
      ['id_ary.length', 'name.length', 'name'],
      ['desc', 'desc', 'asc'],
    ],
  })
  this.path('*')
  this.scope((all) => ({
    zip() {
      return all.where((o) => o.zipcode)
    },
    geo() {
      return all.where((o) => o.on)
    },
    no_zip() {
      return all.where((o) => !o.zipcode)
    },
    no_geo() {
      return all.where((o) => !o.on)
    },
  }))
  this.deploy(({ o, reduce }) => {
    reduce('id_tree', { navi: o.id_ary })
  })
})
new Rule('work_country', WorkCountry).schema(function () {
  this.has_many('work_names')
  this.order('list', { sort: ['country.length', 'desc'] })
  this.deploy(({ o }) => {
    o.q = {
      search_words: o.country.join(' '),
    }
  })
})
let idx = 0
new Rule('work_name', WorkName).schema(function () {
  this.order('spot_size', { sort: ['count', 'desc'] })
  this.belongs_to('work_country')
  this.scope((all) => ({
    by_page(spot_id, search) {
      const q = spot_id !== 'all' ? all.partition(`code.${spot_id}.set`) : all
      return q.search(search)
    },
  }))
  this.deploy(function (model, reduce, order) {
    const o = this
    const ascii = o.spell ? o.spell.normalize('NFKD').replace(/[\u0300-\u036F]/g, '') : ''
    o._id = `${o.key}-${++idx}`
    o.spot = o.mark || o.key
    o.work_country_id = o.key
    o.q = {
      search_words: [`<${o.name}>`, `<${ascii}>`].join(' '),
    }
    reduce('code', o.key, { set: o.id })
    reduce('spot', o.spot, {
      set: o.id,
      list: true,
    })
    reduce('spot_size', o.spot, { count: 1 })
    order('spot', o.spot, 'list', {
      sort: [
        ['side', 'name'],
        ['asc', 'asc'],
      ],
    })
  })
})
//# sourceMappingURL=workflow.js.map
