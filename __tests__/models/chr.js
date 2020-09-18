/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Set, Model, Query, Rule, State } = require('../../lib/index')

const order = [
  'ririnra',
  'wa',
  'time',
  'sf',
  'fable',
  'mad',
  'ger',
  'changed',
  'animal',
  'school',
  'all',
]

new Rule('tag').schema(function () {
  this.sort('order')
  this.belongs_to('chr_set')
  this.habtm('faces', { reverse: true })
  this.tree()

  this.model = class model extends this.model {
    chr_job(face_id) {
      return Query.chr_jobs.find(`${this.chr_set_id}_${face_id}`)
    }
  }
  this.scope((all) => ({
    enable() {
      return all.where((o) => !o.disabled)
    },
  }))

  return (this.model = class model extends this.model {
    static map_reduce(o, emit) {
      const group = Math.floor(o.order / 1000)
      return emit(['group', group], {
        set: o.id,
        list: true,
      })
    }

    static order(o, emit) {
      const group = Math.floor(o.order / 1000)
      return emit(['group', group, 'list'], { sort: ['order'] })
    }
  })
})

const katakanas = __range__('ア'.charCodeAt(0), 'ン'.charCodeAt(0), true).map((idx) =>
  String.fromCharCode(idx)
)

new Rule('face').schema(function () {
  this.sort('order')
  this.order('name_head', {
    sort: ['id'],
    index: 'set.length',
    quantile: 4,
    mode: true,
    cover: katakanas,
  })
  this.habtm('tags')
  this.has_many('chr_jobs')
  this.has_many('chr_npcs')

  this.scope((all) => ({
    tag(tag_id) {
      return all.partition(`tag.${tag_id}.set`)
    },

    name_blank() {
      return all.reduce.name_head.from.remain
    },

    name_head(tag_id) {
      return all.tag(tag_id).reduce.name_head
    },
  }))

  this.deploy(function () {
    return this.tag_ids.unshift('all')
  })

  const map = { count: 1 }
  this.model = class model extends this.model {
    static map_partition(o, emit) {
      const it = {
        set: o.id,
        count: 1,
      }
      emit([], it)
      emit(['tag', 'all'], it)

      return o.tag_ids.map((tag_id) => emit(['tag', tag_id], it))
    }

    static map_reduce(o, emit) {
      let head = o.name[0]
      if (['†'].includes(o.name[0])) {
        head = o.name[1]
      }
      if (['D.'].includes(o.name.slice(0, 2))) {
        head = o.name[2]
      }
      if (['Dr.'].includes(o.name.slice(0, 3))) {
        head = o.name[3]
      }
      head = head.replace(/[\u3041-\u3096]/g, (hira) =>
        String.fromCharCode(hira.charCodeAt(0) + 0x60)
      )

      return emit(['name_head', head], { set: o.name })
    }
  }

  return this.property('model', {
    summary_url: {
      get() {
        return `/summary/faces/show?id=${this._id}`
      },
    },
    roles: {
      get() {
        return this.aggregate.roles
      },
    },
    lives: {
      get() {
        return this.aggregate.lives
      },
    },
    sow_auths: {
      get() {
        return this.aggregate.sow_auths
      },
    },
    mestypes: {
      get() {
        return this.aggregate.mestypes
      },
    },
    folders: {
      get() {
        return this.aggregate.folders
      },
    },
    story_length: {
      get() {
        return this.aggregate.log.story_ids.length
      },
    },
    sow_auth_id: {
      get() {
        return this.aggregate.fav._id.sow_auth_id
      },
    },
    fav_count: {
      get() {
        return this.aggregate.fav.count
      },
    },
    date_max: {
      get() {
        return new Date(this.aggregate.log.date_max) - 0
      },
    },
    date_min: {
      get() {
        return new Date(this.aggregate.log.date_min) - 0
      },
    },
    date_range: {
      get() {
        return this.date_max - this.date_min
      },
    },

    jobs: {
      get() {
        return this.chr_jobs.pluck('job').uniq
      },
    },
  })
})

new Rule('chr_set').schema(function () {
  this.sort('label')
  this.has_many('chr_jobs')
  return this.has_many('chr_npcs')
})

new Rule('chr_npc').schema(function () {
  this.sort('label')
  this.belongs_to('chr_set')
  this.belongs_to('chr_job')
  this.belongs_to('face')
  this.deploy(function () {
    this.chr_job_id = `${this.chr_set_id}_${this.face_id}`
    if (this._id == null) {
      this._id = this.chr_job_id
    }
    return (this.chr_set_idx = order.indexOf(this.chr_set_id))
  })

  return this.property('model', {
    head: {
      get() {
        return `${this.chr_job.job} ${this.face.name}`
      },
    },
  })
})

new Rule('chr_job').schema(function () {
  this.sort('face.order')
  this.belongs_to('chr_set')
  this.belongs_to('face')

  this.deploy(function () {
    this._id = `${this.chr_set_id}_${this.face_id}`
    this.chr_set_idx = order.indexOf(this.chr_set_id)
    return (this.q = {
      search_words: this.face
        ? ['animal', 'school'].includes(this.chr_set_id)
          ? this.face.name
          : `${this.job} ${this.face.name}`
        : '',
    })
  })

  this.scope((all) => ({
    tag(tag_id) {
      const { chr_set_id } = Query.tags.find(tag_id)
      switch (tag_id) {
        case 'all':
          return all.where({ chr_set_id })
        default:
          return all.where({ chr_set_id }).in({ 'face.tag_ids': tag_id })
      }
    },
  }))

  this.model = class model extends this.model {}
  return this.property('model', {
    chr_npc: {
      get() {
        return Query.chr_npcs.find(this.id)
      },
    },
  })
})

State.transaction(function (m) {
  let faces, o
  let say
  let face_id
  Set.tag.set(require('../yaml/chr_tag.yml'))

  Set.face.set((faces = require('../yaml/chr_face.yml')))
  for (o of faces) {
    o.aggregate = {
      sow_auths: [],
      mestypes: [],
      folders: [],
      roles: [],
      lives: [],
      log: {
        date_min: 0xfffffffffffff,
        date_max: -0xfffffffffffff,
        story_ids: [],
      },
      fav: {
        _id: {
          sow_auth_id: null,
        },
        count: 0,
      },
    }
  }

  for ({ face_id, say } of require('../yaml/npc.yml')) {
    Set.face.find(face_id).npc = { say }
  }

  for (let key of order) {
    o = require(`../yaml/cs_${key}.yml`)

    Set.chr_set.append(o.chr_set)
    const { id } = o.chr_set
    const cs_key = { chr_set_id: id }

    Set.chr_npc.merge(o.chr_npc, cs_key)
    Set.chr_job.merge(o.chr_job, cs_key)
  }

  const list = (() => {
    const result = []
    for (let face of faces) {
      const chr_set_id = 'all'
      face_id = face._id
      const job = __guard__(face.chr_jobs.list.sort('chr_set_idx')[0], (x) => x.job)
      if (job == null) {
        continue
      }
      result.push({ chr_set_id, face_id, job })
    }
    return result
  })()

  return Set.chr_job.merge(list)
}, Query.static.meta)
function __range__(left, right, inclusive) {
  let range = []
  let ascending = left < right
  let end = !inclusive ? right : ascending ? right + 1 : right - 1
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i)
  }
  return range
}
function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null ? transform(value) : undefined
}
