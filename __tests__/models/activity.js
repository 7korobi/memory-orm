/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Set, Model, Query, Rule } = require('../../lib/index')

new Rule('marker').schema(function () {
  this.sort('write_at', 'desc')
  this.order('mark_at', { sort: ['max', 'desc'] })
  this.scope((all) => ({
    own(uid) {
      return all.where({ uid })
    },
  }))

  return (this.model = class model extends this.model {
    static map_reduce(o, emit) {
      return emit('mark_at', o.book_id, { max: o.mark_at })
    }
  })
})

new Rule('icon').schema(function () {
  this.belongs_to('book')
  this.belongs_to('potof')

  return this.scope((all) => ({
    own(id) {
      return all.where({ id })
    },
  }))
})
