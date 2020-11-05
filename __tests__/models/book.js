/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Model, Query, Rule, Set, State } = require('../../lib/index')
const { game } = require('../config/live.yml')
const format = require('date-fns/format/index')
const locale = require('date-fns/locale/ja')

new Rule('book').schema(function () {
  this.sort('write_at')
  this.path(['folder'])

  this.has_many('parts')
  this.has_many('phases')
  this.has_many('chats')
  this.has_many('potofs')

  this.habtm('options')
  this.habtm('roles')
  this.habtm('marks')

  this.belongs_to('winner')
  this.belongs_to('say')
  this.belongs_to('locale')

  this.property('model', {
    head: {
      get() {
        return `${this.idx}: ${this.label}`
      },
    },
  })

  this.scope((all) => ({
    in_folder(folder_id) {
      return all
        .partition(`${folder_id}.set`)
        .where({ folder_id })
        .page(25)
        .order({
          sort: ['write_at', 'desc'],
          page: true,
        })
    },
  }))

  this.deploy(function () {
    const in_month = format(this.write_at, 'MM月', { locale })
    const yeary = format(this.write_at, 'yyyy年', { locale })
    const monthry = yeary + in_month
    this.q = {
      yeary,
      monthry,
      in_month,
      search_words: this.label,
    }

    if (this.is_epilogue && this.is_finish) {
      this.mode = 'oldlog'
    } else {
      if (this.parts.list[0]) {
        this.mode = 'progress'
      } else {
        this.mode = 'prologue'
      }
    }

    return (this.aggregate = { face_ids: [] })
  })

  return (this.model = class model extends this.model {
    static map_reduce(o, emit) {
      emit('idx', { max: parseInt(o.idx) })
      const it = { set: o.id }
      emit([], it)
      emit('all', it)
      return emit(o.folder_id, it)
    }
  })
})

new Rule('winner').schema(function () {
  return this.scope(function (all) {})
})

new Rule('option').schema(function () {
  return this.scope(function (all) {})
})

new Rule('say').schema(function () {
  this.scope((all) => ({
    active: all.in({ for: game.folder_id }),
  }))
  return this.deploy(function () {
    return this.for != null ? this.for : (this.for = [])
  })
})

new Rule('game').schema(function () {
  return this.scope(function (all) {})
})

new Rule('locale').schema(function () {
  return this.scope(function (all) {})
})

new Rule('mark').schema(function () {
  return this.scope(function (all) {})
})

State.transaction(function (m) {
  Set.locale.set(require('../yaml/set_locale.yml'))
  Set.option.set(require('../yaml/set_option.yml'))
  Set.winner.set(require('../yaml/set_winner.yml'))
  Set.say.set(require('../yaml/set_says.yml'))
  Set.mark.set(require('../yaml/set_mark.yml'))
  return Set.game.set(require('../yaml/sow_game.yml'))
}, Query.static.meta)
