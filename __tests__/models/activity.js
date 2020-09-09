'use strict'

const { Rule } = require('../../lib/index')
const { Model } = require('../../lib/base')

class Marker extends Model {
  get anker() {
    return '-' + this.id.split('-').slice(2, 5).join('-')
  }
}
class Icon extends Model {}

exports.Marker = Marker
exports.Icon = Icon

new Rule('marker', Marker).schema(function () {
  this.scope((all) => ({
    own(uid) {
      return all.where({ uid })
    },
  }))
  this.order('mark_at', { sort: ['max', 'desc'] })
  this.order('list', { sort: ['write_at', 'desc'] })
  this.deploy(({ o, reduce }) => {
    reduce('mark_at', o.book_id, { max: o.mark_at })
  })
})
new Rule('icon', Icon).schema(function () {
  this.belongs_to('book')
  this.belongs_to('potof')
  this.scope((all) => ({
    own(_id) {
      return all.where({ _id })
    },
  }))
})
//# sourceMappingURL=activity.js.map
