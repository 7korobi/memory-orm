import _ from 'lodash'
import { Query } from './query'
import { ReduceOrder, Name, MODEL } from './type'

export class List<M extends MODEL> extends Array {
  query!: Query<M>
  static $name: Name
  get first() {
    return this[0]
  }

  get last() {
    return this[this.length - 1]
  }

  get head() {
    return this[0]
  }

  get tail() {
    return this[this.length - 1]
  }

  get uniq() {
    return (this.constructor as typeof List).bless(_.uniq(this), this.query)
  }

  pluck(...keys): any[] {
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
    return (this.constructor as typeof List).bless(this.map(cb), this.query)
  }

  static bless<M extends MODEL>(list: ReduceOrder<M>, query: Query<M>) {
    Reflect.setPrototypeOf(list, this.prototype)
    if (query && query.where && query.in) {
      list.query = query
    }
    return list
  }

  constructor(query: Query<M>) {
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
    const o = _.groupBy(this, cb)
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
