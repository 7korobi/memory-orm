'use strict'
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Set, Query, Rule } = require('../../lib/index')
const { Model } = require('../../lib/base')

const format = require('date-fns/format/index')
const locale = require('date-fns/locale/ja')

const url = {
  store: '',
}

class SowTurn extends Model {}

class SowVillage extends Model {
  get query() {
    return Query.sow_villages.where({ id: this.id })
  }
  get roles() {
    return this.query.reduce || []
  }
  get event_length() {
    const _r = this.query.reduce.event
    return _r && _r.length
  }
}
class Folder extends Model {}

exports.SowTurn = SowTurn
exports.SowVillage = SowVillage
exports.Folder = Folder

new Rule('sow_roletable').schema(function () {})
new Rule('sow_village_plan').schema(function () {})

new Rule('sow_turn').schema(function () {
  this.sort('turn', 'asc')
  this.belongs_to('village', { target: 'sow_villages', key: 'story_id' })
})

new Rule('sow_village', {
  model: SowVillage,
  scope(all) {
    return {
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
    }
  },
  schema() {
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
    this.habtm('marks')
    this.habtm('option_datas', { target: 'options', key: 'options' })
    this.belongs_to('folder', { target: 'folders', key: 'q.folder' })
    this.belongs_to('say', { target: 'says', key: 'q.say' })
    this.belongs_to('mob', { target: 'roles', key: 'q.mob' })
    this.belongs_to('game', { target: 'games', key: 'q.game' })
  },
  deploy({ o, reduce }) {
    const cmd = { count: 1 }
    let { interval, hour, minute } = o.upd
    if (hour < 10) {
      hour = `0${hour}`
    }
    if (minute < 10) {
      minute = `0${minute}`
    }
    o.timer.nextchargedt = new Date(o.timer.nextchargedt)
    o.timer.nextcommitdt = new Date(o.timer.nextcommitdt)
    o.timer.nextupdatedt = new Date(o.timer.nextupdatedt)
    o.timer.scraplimitdt = new Date(o.timer.scraplimitdt)
    o.timer.updateddt = new Date(o.timer.updateddt)
    const updated_at = new Date(o.timer.updateddt)
    o.write_at = updated_at.getTime()
    const in_month = format(updated_at, 'MM月', { locale })
    const yeary = format(updated_at, 'yyyy年', { locale })
    const monthry = yeary + in_month
    o.q = {
      yeary,
      monthry,
      in_month,
      sow_auth_id: o.sign,
      folder_id: o.folder.toUpperCase(),
      size: 'x' + o.vpl[0],
      say: o.type.say,
      mob: o.type.mob,
      game: o.type.game,
      upd_at: `${hour}:${minute}`,
      upd_range: `${interval * 24}h`,
      rating: o.rating,
      search_words: o.name,
    }
    delete o.folder

    if ([null, 0, '0', 'null', 'view'].includes(o.rating)) {
      o.q.rating = 'default'
    }
    if (['R15', 'r15', 'r18'].includes(o.rating)) {
      o.q.rating = 'alert'
    }
    if (['gro'].includes(o.rating)) {
      o.q.rating = 'violence'
    }
    const list = __guard__(
      Query.sow_roletables.find(o.type.roletable).role_ids_list,
      (x) => x[o.q.size]
    )
    if ((list != null ? list.length : undefined) && !o.card.config.length) {
      o.card.config = list
    }
    o.card.option = o.options
    if (o.is_epilogue && o.is_finish) {
      o.href = `${url.store}/stories/${o._id}`
      o.mode = 'oldlog'
    } else {
      if (o.turns.list[0]) {
        o.mode = 'progress'
      } else {
        o.mode = 'prologue'
      }
    }
    o.aggregate = { face_ids: [] }
    const { id, part_id } = o
    const it = { set: id }

    reduce([], it)
    reduce([o.mode, 'all'], it)
    reduce([o.mode, o.q.folder_id], it)
    reduce('size_sd', {
      count: 1,
      all: o.vpl[0],
    })
    reduce(['mode', o.mode, o.q.folder_id], cmd)
    reduce(['in_month', o.q.in_month], cmd)
    reduce(['yeary', o.q.yeary], cmd)
    reduce(['monthry', o.q.monthry], cmd)
    reduce(['folder_id', o.q.folder_id], cmd)
    reduce(['upd_range', o.q.upd_range], cmd)
    reduce(['upd_at', o.q.upd_at], cmd)
    reduce(['sow_auth_id', o.q.sow_auth_id], cmd)
    reduce(['rating', o.q.rating], cmd)
    reduce(['size', o.q.size], cmd)
    reduce(['say', o.q.say], cmd)
    reduce(['game', o.q.game], cmd)
    reduce(['mob', o.q.mob], cmd)
    for (let opt_id of o.card.option) {
      reduce(['option', opt_id], cmd)
    }
    for (let card_id of o.card.event) {
      reduce(['event', card_id], cmd)
    }
    for (let card_id of o.card.discard) {
      reduce(['discard', card_id], cmd)
    }
    for (let card_id of o.card.config) {
      reduce(['config', card_id], cmd)
    }
  },
})

new Rule('folder', {
  model: Folder,
  scope(all) {
    return {
      enable: all.where((o) => !o.disabled),
      host(hostname) {
        return all.where({ hostname })
      },
    }
  },
  schema() {},
  deploy({ o }) {
    let path
    const _r = o.config
    const c = _r && _r.cfg
    if (c) {
      o.rule = c.RULE
      o.title = c.NAME_HOME
      o.max_vils = c.MAX_VILLAGES
      if (o.max_vils) {
        o.href = o.config.cfg.URL_SW + '/sow.cgi'
        const [protocol, _, hostname, ...path_dir] = o.href.split('/')
        o.hostname = hostname
        path = '/' + path_dir.join('/')
      }
    }

    switch (o.folder) {
      case 'LOBBY':
        o.max_vils = 0
        break
    }

    if ((o.disabled = !path)) {
      return
    }
    o.route = { path, name: o._id }
  },
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
  Set.chat.merge(chats)
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
//# sourceMappingURL=sow.js.map
