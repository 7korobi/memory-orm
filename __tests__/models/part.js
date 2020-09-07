/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Model, Query, Rule } = require('../../lib/index')

new Rule('part').schema(function () {
  this.sort('chats.list.0.0.write_at', 'asc')
  this.path('folder', 'book')
  this.has_many('sections')
  this.has_many('phases')
  this.has_many('cards')
  this.has_many('stats')
  return this.has_many('chats')
})
