/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const { Set, Model, Query, Rule } = require('../../lib/index')

new Rule('potof').schema(function () {
  this.sort('write_at')
  this.path(['folder', 'book'])
  this.belongs_to('part')
  this.belongs_to('face')
  this.belongs_to('winner')
  this.has_many('cards')
  this.has_many('stats')
  this.has_many('chats')
  this.has_many('icons')
  this.habtm('roles')
  this.habtm('ables')

  this.scope((all) => ({
    by_face(book_id, face_id) {
      return all.where({ face_id, book_id })
    },

    cast(book_id) {
      const sort = (o) => o.say(`${book_id}-top`).all
      return Query.books
        .find(book_id)
        .potofs.where((o) => 'leave' !== o.live)
        .sort(sort, 'desc')
    },

    catalog(book_id, part_id, sort, order) {
      const [a1, a2] = sort.split('.')
      if ('say' === a1) {
        sort = (o) => o.say(part_id)[a2]
      }
      return Query.books.find(book_id).potofs.sort(sort, order)
    },

    sow_id(book_id, face_id, sign, is_merge) {
      let o
      const { list } = all.by_face(book_id, face_id)
      for (o of list) {
        if (o.sign === sign) {
          return o.id
        }
      }
      if (is_merge) {
        for (o of list) {
          if (o.cards.list.length) {
            return o.id
          }
        }
      }
      return null
    },
  }))

  this.deploy(function () {
    const role_id_set = {}
    const able_id_set = {}
    for (let card of this.cards.list) {
      if (card.role) {
        role_id_set[card.role_id] = true
        switch (card.idx) {
          case 'request':
            delete role_id_set[card.role_id]
            break
        }

        for (let { _id } of card.role.ables.list) {
          able_id_set[_id] = true
        }
      }
    }
    this.role_ids = Object.keys(role_id_set)
    this.able_ids = Object.keys(able_id_set)

    if (this.live) {
      return this.live.date != null ? this.live.date : (this.live.date = Infinity)
    }
  })

  this.property('model', {
    role_labels: {
      get() {
        return (() => {
          const result = []
          for (let o of this.roles.list) {
            if ('LIVE' !== o.group) {
              const stat = this.stats.find(`${this._id}-${o._id}`)
              const head =
                (stat != null ? stat.label : undefined) != null
                  ? stat != null
                    ? stat.label
                    : undefined
                  : ''
              result.push(`${head}${o.label}`)
            }
          }
          return result
        })()
      },
    },
    win: {
      get() {
        if (['suddendead', 'leave'].includes(this.live != null ? this.live.role_id : undefined)) {
          return ''
        }
        if (!this) {
          return ''
        }
        if (this.book != null ? this.book.winner_id : undefined) {
          if (this.book.winner_id === this.winner_id) {
            return '勝利'
          } else {
            return '敗北'
          }
        } else {
          return '参加'
        }
      },
    },

    live: {
      get() {
        return this.cards.find(`${this._id}-live`)
      },
    },

    request: {
      get() {
        return this.cards.find(`${this._id}-request`)
      },
    },

    commit: {
      get() {
        return this.stats.find(`${this._id}-commit`)
      },
    },

    give: {
      get() {
        return this.stats.find(`${this._id}-give`)
      },
    },

    winner_id: {
      get() {
        let left
        return (left = this.find(
          this.cards,
          ['bond', 'gift', 'role', 'live'],
          (o) => o.role.win
        )) != null
          ? left
          : 'NONE'
      },
    },

    head: {
      get() {
        let name
        if (this.face != null) {
          ;({ name } = this.face)
        }
        return [this.job, this.name || name].join(' ')
      },
    },

    icon_mdi: {
      get() {
        return this.icons.list[0] != null ? this.icons.list[0].mdi : undefined
      },
    },
  })

  return (this.model = class model extends this.model {
    side(part_id) {
      for (let idx of ['SM', 'S', 'GM', 'G', 'VM', 'V']) {
        var o
        if (
          (o = __guard__(
            this.book.chats.reduce.side != null
              ? this.book.chats.reduce.side[`${part_id}-${idx}`]
              : undefined,
            (x) => x[this.id]
          ))
        ) {
          return o
        }
      }
      return { max_is: {} }
    }
    say(part_id) {
      for (let idx of ['SS', 'S', 'GS', 'G', 'VS', 'V']) {
        var o
        if (
          (o = __guard__(
            this.book.chats.reduce.potof != null
              ? this.book.chats.reduce.potof[`${part_id}-${idx}`]
              : undefined,
            (x) => x[this.id]
          ))
        ) {
          return o
        }
      }
      return {
        count: 0,
        all: 0,
        max: null,
        min: null,
      }
    }

    say_handle(part_id) {
      const { max_is } = this.say(part_id)
      return __guard__(max_is != null ? max_is.phase : undefined, (x) => x.handle) != null
        ? __guard__(max_is != null ? max_is.phase : undefined, (x) => x.handle)
        : 'TSAY'
    }

    find(q, keys, cb = (o) => o) {
      for (let key of keys) {
        let o = q.find(`${this._id}-${key}`)
        if (!o) {
          continue
        }
        o = cb(o)
        if (!o) {
          continue
        }
        return o
      }
    }

    static map_reduce(o, emit) {}
    static order(o, emit) {}
  })
})

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null ? transform(value) : undefined
}
