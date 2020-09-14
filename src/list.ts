import _ from 'lodash'
import { Query } from './query'
import { ReduceOrder, NameBase, MODEL_DATA, PlainData, DIC } from './type'

export class List<O extends MODEL_DATA> extends Array {
  query!: Query<O>
  static $name: NameBase
  get first(): O {
    return this[0]
  }

  get last(): O {
    return this[this.length - 1]
  }

  get head(): O {
    return this[0]
  }

  get tail(): O {
    return this[this.length - 1]
  }

  get uniq(): this {
    return (this.constructor as typeof List).bless(_.uniq(this), this.query) as this
  }

  pluck(...keys) {
    let cb
    switch (keys.length) {
      case 0:
        cb = function () {
          return null
        }
        break
      case 1:
        cb = _.property(keys[0])
        break
      default:
        cb = function (o) {
          return _.at(o, ...keys)
        }
        break
    }
    return (this.constructor as typeof List).bless(this.map(cb), this.query) as List<any>
  }

  static bless<O extends MODEL_DATA>(list: any[], query: Query<O>) {
    Reflect.setPrototypeOf(list, this.prototype)
    if (query && query.where && query.in) {
      ;(list as any).query = query
    }
    return list as List<O>
  }

  constructor(query: Query<O>) {
    super()
    if (query && query.where && query.in) {
      this.query = query
    }
  }

  sort(...sort: any[]) {
    const o = (_.orderBy(this, ...sort) as unknown) as this
    Reflect.setPrototypeOf(o, Reflect.getPrototypeOf(this))
    return o
  }

  group_by(cb) {
    const o = _.groupBy(this, cb) as DIC<List<O>>
    for (const key in o) {
      const oo = o[key]
      Reflect.setPrototypeOf(oo, Reflect.getPrototypeOf(this))
    }
    return o
  }

  page_by(per) {
    let idx = 0
    return Object.values(
      this.group_by(function (o) {
        return Math.floor(idx++ / per)
      })
    )
  }

  where(req) {
    return this.query.where(req)
  }

  in(req) {
    return this.query.in(req)
  }
}
