/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Model, Query, Rule } = require('../../lib/index')

new Rule('chat').schema(function () {
  this.order([], {
    sort: ['write_at', 'asc'],
    page: true,
  })
  this.order('last', {
    sort: [
      ['max_is.phase.id', 'max_is.write_at'],
      ['desc', 'desc'],
    ],
    pluck: 'max_is',
    page: true,
  })
  this.path(['folder', 'book', 'part', 'phase'])
  this.belongs_to('section')
  this.belongs_to('potof')

  this.scope((all) => ({
    ankers(book_id, a) {
      const ids = a.map((idx) => book_id + idx)
      return all.where({ _id: ids }).sort('write_at', 'desc')
    },

    sow_cite(a) {
      const b = a.split('-')
      if ('TS' === b[3]) {
        b[3] = 'AIM'
      }
      const c = a.split('-')
      if (c[2]) {
        c[2]--
      }
      return all.find(a, b.join('-'), c.join('-'))
    },

    now(hides, words, page_by, mode, part_id) {
      return all
        .partition(`${part_id}.${mode}.set`)
        .where((o) => !hides.includes(o.potof_id))
        .search(words)
        .page(page_by)
    },
  }))

  const anker = {
    belongs_to: 'chats',
    sort: ['count', 'desc'],
  }

  this.deploy(function () {
    if (this.mention_ids == null) {
      this.mention_ids = []
    }
    return (this.q = {
      group: [this.potof_id, this.phase_id].join('+'),
      search_words: this.log,
    })
  })

  return (this.model = class model extends this.model {
    make_ankers(...ids) {
      const { book_id } = this
      ids.push(this.id)
      ids = Array.from(new Set(ids))
      return [book_id, ids.map((id) => id.slice(book_id.length))]
    }

    anker(part_id) {
      const { mark, guide } = this.phase != null ? this.phase : {}
      switch (false) {
        case !!guide:
          return ''
        case mark == null:
          if (part_id === this.part_id) {
            return `${mark}${this.idx}`
          } else {
            return `${mark}${this.part.idx}:${this.idx}`
          }
        default:
          if (part_id === this.part_id) {
            return this.id.slice(this.part_id.length)
          } else {
            return this.id.slice(this.book_id.length)
          }
      }
    }

    static map_partition(o, emit) {
      const { part_id } = o
      const it = {
        set: o.id,
        max: o.write_at + 1,
        min: o.write_at,
      }

      emit([], it)
      emit([part_id, 'wiki'], it)

      if (!o.phase) {
        return
      }
      const { group, handle } = o.phase
      emit(['group', part_id, group], it)
      emit(['handle', part_id, handle], it)

      if ('M'.includes(group)) {
        emit([part_id, 'memo'], it)
      }

      if ('SAI'.includes(group)) {
        emit([part_id, 'full'], it)

        if (['SSAY', 'VSSAY', 'TITLE', 'MAKER', 'ADMIN', 'public'].includes(handle)) {
          emit([part_id, 'normal'], it)
        }

        if (['TSAY', 'private'].includes(handle)) {
          emit([part_id, 'solo'], it)
        }

        if (
          !['SSAY', 'VSSAY', 'TITLE', 'MAKER', 'ADMIN', 'dark', 'GSAY', 'TSAY', 'public'].includes(
            handle
          )
        ) {
          emit([part_id, 'extra'], it)
        }

        if (['GSAY'].includes(handle)) {
          return emit([part_id, 'rest'], it)
        }
      }
    }

    static map_reduce(o, emit) {
      emit(['index', o.phase_id], { max: parseInt(o.idx) })
      emit(['last', o.q.group], { max: o.write_at })

      emit('say', {
        max: o.write_at + 1,
        min: o.write_at,
        count: 1,
        all: o.log.length,
      })

      if (o.phase_id.match(/-[SGV]S?$/)) {
        const all = o.phase_id.split('-')
        all[2] = 'top'
        const all_phase_id = all.join('-')
        emit(['potof', all_phase_id, o.potof_id], {
          count: 1,
          all: o.log.length,
          max: o.write_at + 1,
          min: o.write_at,
        })
        emit(['potof', o.phase_id, o.potof_id], {
          count: 1,
          all: o.log.length,
          max: o.write_at + 1,
          min: o.write_at,
        })
      }

      if (o.phase_id.match(/-.M?$/)) {
        emit(['side', o.phase_id, o.potof_id], { max: o.write_at + 1 })
      }

      return (() => {
        const result = []
        for (let mention_id of o.mention_ids) {
          emit(['mention', mention_id], { count: 1 })

          result.push(emit(['mention_to', mention_id, o.id], { count: 1 }))
        }
        return result
      })()
    }

    static order(o, emit) {
      emit('mention', anker)
      return o.mention_ids.map((mention_id) => emit(['mention_to', mention_id], anker))
    }
  })
})
