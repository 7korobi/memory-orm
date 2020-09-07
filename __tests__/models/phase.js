/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Model, Query, Rule } = require('../../lib/index')

new Rule('phase').schema(function () {
  this.order('write_at')
  this.order('group', { sort: ['count', 'desc'] })
  this.order('handle', { sort: ['count', 'desc'] })
  this.path('folder', 'book', 'part')
  this.has_many('chats')

  this.scope((all) => ({}))

  this.deploy(function () {})

  return (this.model = class model extends this.model {
    static map_reduce(o, emit) {
      emit('group', o.group, { count: 1 })
      return emit('handle', o.handle, { count: 1 })
    }
  })
})
