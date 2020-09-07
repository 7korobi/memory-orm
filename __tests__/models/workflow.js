/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Set, Model, Query, Rule } = require('../../lib/index')

new Rule('work_location').schema(function () {
  this.path('*')
  return this.property('model', {
    id_ary: {
      get() {
        return this.id.split('-')
      },
    },
    prefecture: {
      get() {
        return this.id_ary[0]
      },
    },
  })
})

new Rule('work_country').schema(function () {
  this.has_many('work_names')
  this.deploy(function () {
    return (this.q = { search_words: this.country.join(' ') })
  })
  return this.order('list', { sort: ['country.length', 'desc'] })
})

let idx = 0
new Rule('work_name').schema(function () {
  this.belongs_to('work_country')
  this.deploy(function () {
    const ascii = this.spell ? this.spell.normalize('NFKD').replace(/[\u0300-\u036F]/g, '') : ''
    this._id = `${this.key}-${++idx}`
    this.spot = this.mark || this.key
    this.work_country_id = this.key
    return (this.q = { search_words: [`<${this.name}>`, `<${ascii}>`].join(' ') })
  })

  this.scope((all) => ({
    by_page(spot_id, search) {
      const q = spot_id !== 'all' ? all.partition(`code.${spot_id}.set`) : all
      return q.search(search)
    },
  }))

  this.order('spot_size', { sort: ['count', 'desc'] })
  return (this.model = class model extends this.model {
    static map_partition(o, emit) {
      emit('code', o.key, { set: o.id })
      emit('spot', o.spot, {
        set: o.id,
        list: true,
      })
      return emit('spot_size', o.spot, { count: 1 })
    }

    static order(o, emit) {
      return emit('spot', o.spot, 'list', {
        sort: [
          ['side', 'name'],
          ['asc', 'asc'],
        ],
      })
    }
  })
})
