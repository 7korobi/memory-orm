/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('lodash')
const { Set, Model, Query, Rule, State } = require('../../lib/index')

new Rule('random').schema(function () {
  this.sort('ratio', 'desc')
  this.order('type', { sort: ['count', 'asc'] })
  this.scope((all) => ({
    deck(type) {
      return all.where({ type })
    },
  }))

  this.deploy(function () {
    const t0 = this.toString(0)
    const t1 = this.toString(1)
    return (this.texts = t0 !== t1 ? [t0, t1] : [t0])
  })

  return (this.model = class model extends this.model {
    static map_reduce(o, emit) {
      emit('type', o.type, { count: 1 })
      return emit('ratio', {
        count: 1,
        all: o.ratio,
      })
    }

    toString(side = _.random(0, 1)) {
      switch (this.type) {
        case 'chess':
          return `${this.symbols[side]} ${['白', '黒'][side]}${this.label}`

        case 'tarot':
          return `${['正', '逆'][side]} ${this.roman}.${this.label}`

        case 'zodiac':
          return `${this.symbol} ${this.roman}.${this.label}`

        case 'planet':
        case 'weather':
          return `${this.symbol} ${this.label}`

        default:
          return `${this.label}`
      }
    }
  })
})

// scope without cache
Query.randoms.choice = function (type) {
  const { list, reduce } = this.deck(type)
  let at = _.random(0, reduce.ratio.all - 1)
  let o = undefined
  for (o of list) {
    at -= o.ratio
    if (at < 0) {
      return o
    }
  }
}

State.transaction(function (m) {
  let _id, label, number, rank, suite
  let type = 'trump'
  const ratio = 1
  const iterable = ['♢', '♡', '♣', '♠']
  for (let idx1 = 0; idx1 < iterable.length; idx1++) {
    suite = iterable[idx1]
    const iterable1 = 'A 2 3 4 5 6 7 8 9 10 J Q K'.split(' ')
    for (let idx2 = 0; idx2 < iterable1.length; idx2++) {
      rank = iterable1[idx2]
      label = `${suite}${rank}`
      const suite_code = idx1 + 1
      number = idx2 + 1
      _id = 100 * suite_code + number
      Set.random.add({ _id, type, ratio, number, suite, rank, label })
    }
  }

  Set.random.add({
    _id: 501,
    type: 'trump',
    ratio: 1,
    number: 0,
    suite: '',
    rank: '',
    label: 'JOKER',
  })

  Set.random.add({
    _id: 502,
    type: 'trump',
    ratio: 1,
    number: 0,
    suite: '',
    rank: '',
    label: 'joker',
  })

  return (() => {
    const result = []
    const object = require('../yaml/random.yml')
    for (type in object) {
      var o = object[type]
      result.push(
        (() => {
          const result1 = []
          for (let key in o) {
            const oo = o[key]
            oo._id = `${type}_${key}`
            oo.type = type
            if (oo.ratio == null) {
              oo.ratio = 1
            }
            result1.push(Set.random.add(oo))
          }
          return result1
        })()
      )
    }
    return result
  })()
}, Query.static.meta)
