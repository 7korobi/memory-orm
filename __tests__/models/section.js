/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Model, Query, Rule } = require('../../lib/index')
const format = {
  head: new Intl.DateTimeFormat('ja-JP', {
    weekday: 'short',
    hour: '2-digit',
  }),
  tail: new Intl.DateTimeFormat('ja-JP', { hour: '2-digit' }),
}

new Rule('section').schema(function () {
  this.sort('write_at')
  this.path(['folder', 'book', 'part'])
  this.has_many('chats')

  this.scope((all) => ({}))

  this.deploy(function () {
    return this.label != null ? this.label : (this.label = this.idx)
  })

  return this.property('model', {
    label: {
      get() {
        const begin = format.head.format(this.begin_at)
        let write = format.head.format(this.write_at)
        if (begin === write) {
          return begin
        } else {
          write = format.tail.format(this.write_at)
          return begin.replace('時', '-' + write)
        }
      },
    },
  })
})
