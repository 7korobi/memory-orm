/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Set, Model, Query, Rule } = require('../../lib/index')

new Rule('card').schema(function () {
  this.sort('write_at')
  this.path('folder', 'book', 'potof')
  this.belongs_to('role')

  this.property('model', {
    stat: {
      get() {
        return Query.stats.find(`${this.potof_id}-${this.idx}`)
      },
    },
  })

  return this.scope((all) => ({
    for_part(part_id) {
      return all.where({ part_id })
    },
    for_phase(phase_id) {
      return all.where({ phase_id })
    },
  }))
})

new Rule('stat').schema(function () {
  this.path('folder', 'book', 'potof')
  this.belongs_to('able')

  this.deploy(function () {
    return (this.able_id = this.idx)
  })
  return this.property('model', {
    card: {
      get() {
        return Query.cards.find(`${this.potof_id}-${this.idx}`)
      },
    },
  })
})

new Rule('role').schema(function () {
  this.habtm('ables')

  return (this.model = class model extends this.model {
    static map_reduce(o, emit) {
      return emit(['group', o.group], { list: true })
    }
  })
})

new Rule('able').schema(function () {
  this.habtm('roles', { reverse: true })

  return (this.model = class model extends this.model {
    static map_reduce(o, emit) {
      return emit(['group', o.group], { list: true })
    }
  })
})

Set.role.set(require('../yaml/set_roles.yml'))
Set.able.set(require('../yaml/set_ables.yml'))
