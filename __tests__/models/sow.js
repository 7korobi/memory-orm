/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Mem
const { Set, Model, Query, Rule } = (Mem = require('../../lib/index'))
const { url } = require('../config/live.yml')
const format = require('date-fns/format/index')
const locale = require('date-fns/locale/ja')

new Rule('sow_roletable').schema(function () {})
new Rule('sow_village_plan').schema(function () {})

new Rule('sow_turn').schema(function () {
  this.sort('turn', 'asc')
  return this.belongs_to('village', { target: 'sow_villages', key: 'story_id' })
})

new Rule('sow_village').schema(function () {
  this.order('list', { sort: ['write_at', 'desc'], diff: ['write_at'] })
  this.order('yeary', { sort: ['id', 'desc'] })
  this.order('in_month', { sort: ['id', 'asc'] })
  this.order('upd_at', { sort: ['id', 'asc'] })
  this.order('folder_id', { sort: ['count', 'desc'] })
  this.order('upd_range', { sort: ['count', 'desc'] })
  this.order('sow_auth_id', { sort: ['count', 'desc'] })
  this.order('rating', { sort: ['count', 'desc'] })
  this.order('size', { sort: ['count', 'desc'] })
  this.order('say', { sort: ['count', 'desc'], belongs_to: 'says' })
  this.order('game', { sort: ['count', 'desc'], belongs_to: 'games' })
  this.order('mob', { sort: ['count', 'desc'], belongs_to: 'roles' })
  this.order('option', { sort: ['count', 'desc'], belongs_to: 'options' })
  this.order('event', { sort: ['count', 'desc'], belongs_to: 'roles' })
  this.order('discard', { sort: ['count', 'desc'], belongs_to: 'roles' })
  this.order('config', { sort: ['count', 'desc'], belongs_to: 'roles' })

  this.has_many('turns', { target: 'sow_turns', key: 'story_id' })
  this.habtm('option_datas', { target: 'options', key: 'options' })
  this.belongs_to('say', { target: 'says', key: 'q.say' })
  this.belongs_to('mob', { target: 'roles', key: 'q.mob' })
  this.belongs_to('game', { target: 'games', key: 'q.game' })

  this.scope((all) => ({
    prologue: all.partition('prologue.all.set').sort('timer.nextcommitdt', 'desc'),
    progress: all.partition('progress.all.set').sort('timer.nextcommitdt', 'desc'),

    mode(mode) {
      return all.partition(`${mode}.all.set`)
    },

    summary(mode, folder_ids, query_in, query_where, search_word) {
      if (!folder_ids.length) {
        folder_ids = ['all']
      }
      const parts = folder_ids.map((folder_id) => `${mode}.${folder_id}.set`)
      return all
        .partition(...parts)
        .in(query_in)
        .where(query_where)
        .search(search_word)
    },

    all_contents(mode, folder_ids, query_in, query_where, search_word, order, asc) {
      return all
        .summary(mode, folder_ids, query_in, query_where, search_word)
        .page(25)
        .order({
          sort: [order, asc],
          page: true,
        })
    },
  }))

  this.deploy(function () {
    let { interval, hour, minute } = this.upd
    if (hour < 10) {
      hour = `0${hour}`
    }
    if (minute < 10) {
      minute = `0${minute}`
    }
    const updated_at = new Date(this.timer.updateddt)

    this.write_at = updated_at - 0

    const in_month = format(updated_at, 'MM月', { locale })
    const yeary = format(updated_at, 'yyyy年', { locale })
    const monthry = yeary + in_month
    this.q = {
      yeary,
      monthry,
      in_month,
      sow_auth_id: this.sow_auth_id.replace(/\./g, '&#2e'),
      folder_id: this.folder.toUpperCase(),
      size: 'x' + this.vpl[0],
      say: this.type.say,
      mob: this.type.mob,
      game: this.type.game,
      upd_at: `${hour}:${minute}`,
      upd_range: `${interval * 24}h`,
      rating: this.rating,
      search_words: this.name,
    }

    if ([null, 0, '0', 'null', 'view'].includes(this.rating)) {
      this.q.rating = 'default'
    }
    if (['R15', 'r15', 'r18'].includes(this.rating)) {
      this.q.rating = 'alert'
    }
    if (['gro'].includes(this.rating)) {
      this.q.rating = 'violence'
    }

    const list = __guard__(
      Query.sow_roletables.find(this.type.roletable).role_ids_list,
      (x) => x[this.q.size]
    )
    if ((list != null ? list.length : undefined) && !this.card.config.length) {
      this.card.config = list
    }
    this.card.option = this.options

    this.folder = Query.folders.find(this.q.folder_id)
    if (this.is_epilogue && this.is_finish) {
      this.href = `${url.store}/stories/${this._id}`
      this.mode = 'oldlog'
    } else {
      if (this.turns.list[0]) {
        this.mode = 'progress'
      } else {
        this.mode = 'prologue'
      }
    }

    return (this.aggregate = { face_ids: [] })
  })

  this.property('model', {
    query: {
      get() {
        return Query.sow_villages.where({ id: this.id })
      },
    },
    roles: {
      get() {
        return this.query.reduce != null ? this.query.reduce : []
      },
    },
    event_length: {
      get() {
        return (this.query.reduce.event != null ? this.query.reduce.event.length : undefined) !=
          null
          ? this.query.reduce.event != null
            ? this.query.reduce.event.length
            : undefined
          : 0
      },
    },
  })

  const cmd = { count: 1 }
  return (this.model = class model extends this.model {
    static map_partition(o, emit) {
      const { id, part_id } = o
      const it = { set: id }
      emit(it)
      emit(o.mode, 'all', it)
      return emit(o.mode, o.q.folder_id, it)
    }

    static map_reduce(o, emit) {
      let card_id
      emit('size_sd', {
        count: 1,
        all: o.vpl[0],
      })
      emit('mode', o.mode, o.q.folder_id, cmd)
      emit('in_month', o.q.in_month, cmd)
      emit('yeary', o.q.yeary, cmd)
      emit('monthry', o.q.monthry, cmd)
      emit('folder_id', o.q.folder_id, cmd)
      emit('upd_range', o.q.upd_range, cmd)
      emit('upd_at', o.q.upd_at, cmd)
      emit('sow_auth_id', o.q.sow_auth_id, cmd)
      emit('rating', o.q.rating, cmd)
      emit('size', o.q.size, cmd)
      emit('say', o.q.say, cmd)
      emit('game', o.q.game, cmd)
      emit('mob', o.q.mob, cmd)
      for (let opt_id of o.card.option) {
        emit('option', opt_id, cmd)
      }
      for (card_id of o.card.event) {
        emit('event', card_id, cmd)
      }
      for (card_id of o.card.discard) {
        emit('discard', card_id, cmd)
      }
      return (() => {
        const result = []
        for (card_id of o.card.config) {
          result.push(emit('config', card_id, cmd))
        }
        return result
      })()
    }
  })
})

new Rule('folder').schema(function () {
  this.scope((all) => ({
    enable: all.where((o) => !o.disabled),

    host(hostname) {
      return all.where({ hostname })
    },
  }))

  return this.deploy(function () {
    let o, path
    if ((o = this.config != null ? this.config.cfg : undefined)) {
      this.rule = o.RULE
      this.title = o.NAME_HOME
      this.max_vils = o.MAX_VILLAGES
      if (this.max_vils) {
        this.href = this.config.cfg.URL_SW + '/sow.cgi'
        const [protocol, _, hostname, ...path_dir] = this.href.split('/')
        this.hostname = hostname
        path = '/' + path_dir.join('/')
      }
    }

    switch (this.folder) {
      case 'LOBBY':
        this.max_vils = 0
        break
    }

    if ((this.disabled = !path)) {
      return
    }
    return (this.route = { path, name: this._id })
  })
})

Set.folder.set(require('../yaml/sow_folder.yml'))
Set.sow_roletable.set(require('../yaml/sow_roletables.yml'))

const welcome = function (h) {
  const chats = {}
  const phases = {}
  const potofs = {}
  for (let key in h) {
    const face_id = h[key]
    potofs[key] = {
      write_at: 1484445101000,
      face_id,
      job: 'ようこそ！',
      name: '',
    }
    phases[key] = {
      write_at: 1484445101000,
      name: '通常発言',
      handle: 'SSAY',
    }
    chats[key + '-1'] = {
      write_at: 1169852700003,
      potof_id: key,
      show: 'post',
      style: 'plain',
      log: `\
祝！人狼議事１０周年！\
`,
    }
  }

  Set.phase.merge(phases)
  Set.potof.merge(potofs)
  return Set.chat.merge(chats)
}

welcome({
  'LOBBY-top-0-0': 'c20',
  'CIEL-top-0-0': 'c24',
  'BRAID-top-0-0': 'c24',
  'PERJURY-top-0-0': 'c25',
  'CABALA-top-0-0': 'c78',
  'top-top-0-0': 't31',
})

Set.chat.merge({
  'LOBBY-top-0-0-2': {
    write_at: 1370662886000,
    potof_id: 'LOBBY-top-0-0',
    show: 'talk',
    style: 'plain',
    log: `\
みなさまの助けになるよう、ロビーを用意いたしました。
相談や困りごと、ちょっとした疑問などをお持ちでしたら、どうぞ、ごゆっくりなさいませ。\
`,
  },

  'CIEL-top-0-0-2': {
    write_at: 1379511895000,
    potof_id: 'CIEL-top-0-0',
    show: 'talk',
    style: 'plain',
    log: `\
<b>勝利を求めないRP村や、勝利も追求するRP村</b>用に、このページは調整してあるよ。
早い者勝ちがよいのだけれど、<a href="http://jsfun525.gamedb.info/wiki/?%B4%EB%B2%E8%C2%BC%CD%BD%C4%EA%C9%BD">企画村予定表</a>という便利なページも見てみましょうね。\
`,
  },

  'BRAID-top-0-0-2': {
    write_at: 1484445101002,
    potof_id: 'BRAID-top-0-0',
    show: 'talk',
    style: 'plain',
    log: `\
こちらのページは<b>（陣営勝利を求めない）完全RP村、勝利追求を含むRP村</b>用に調整してあるよ。
早い者勝ちが原則だけれど、<a href="http://jsfun525.gamedb.info/wiki/?%B4%EB%B2%E8%C2%BC%CD%BD%C4%EA%C9%BD" ng-href="{{link.plan}}">企画村予定表</a>という便利なページも見てみよう。

以下がおおざっぱな、他州との相違点なんだ。
<ul>
<li><a href="sow.cgi?cmd=rule#mind">参加者の心構え</a>。ガチとは違うのだよ。ガチとは。
</li><li><a href="http://crazy-crazy.sakura.ne.jp/giji/?(List)SayCnt">発言ptの量</a>。
</li><li>村の説明は4000字まで記述できます。
</li><li>他、細かい調整が入っています。<a href="http://crazy-crazy.sakura.ne.jp/giji/">仕様変更</a>を参考にしましょう。
</li></ul>\
`,
  },

  'PERJURY-top-0-0-2': {
    write_at: 1393597313000,
    potof_id: 'PERJURY-top-0-0',
    show: 'talk',
    style: 'plain',
    log: `\
<b>勝利を求めないRP村や、勝利も追求するRP村</b>用に、このページは調整してあるのだ。
紳士淑女の諸君には、<a href="http://jsfun525.gamedb.info/wiki/?%B4%EB%B2%E8%C2%BC%CD%BD%C4%EA%C9%BD">企画村予定表</a>を参考に、譲り合いの精神で調整してほしい。\
`,
  },

  'CABALA-top-0-0-2': {
    write_at: 1420047938191,
    potof_id: 'CABALA-top-0-0',
    show: 'talk',
    style: 'plain',
    log: `\
こちらのページは<b>RP村も、勝負も楽しみたい村</b>用に調整してあるよ。
早い者勝ちが原則だけれど、企画村予定表という便利なページも見てみよう。
もし君がRPに没頭したいなら、専用の州でどっぷり楽しもう。きっとそのほうが楽しめる。\
`,
  },
})

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null ? transform(value) : undefined
}
