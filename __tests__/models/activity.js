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

new Rule('marker', {
  model: Marker,
  scope(all) {
    return {
      own(uid) {
        return all.where({ uid })
      },
    }
  },
  schema() {
    this.order('mark_at', { sort: ['max', 'desc'] })
    this.order('list', { sort: ['write_at', 'desc'] })
    this.deploy(({ o, reduce }) => {
      reduce('mark_at', o.book_id, { max: o.mark_at })
    })
  },
})
new Rule('icon', {
  model: Icon,
  scope() {
    return {
      own(uid) {
        return all.where({ uid })
      },
    }
  },
  schema() {
    this.belongs_to('book')
    this.belongs_to('potof')
  },
})
//# sourceMappingURL=activity.js.map
