import _at from 'lodash/at'
import _uniq from 'lodash/uniq'
import _orderBy from 'lodash/orderBy'
import _groupBy from 'lodash/groupBy'
import _property from 'lodash/property'

import { Query } from './query'
import { NameBase, DIC, ID, DEFAULT_RULE_TYPE } from './type'

export class List<A extends DEFAULT_RULE_TYPE> extends Array<A[0]> {
  query!: Query<A>
  static $name: NameBase
  get first(): A[0] {
    return this[0]
  }

  get last(): A[0] {
    return this[this.length - 1]
  }

  get head(): A[0] {
    return this[0]
  }

  get tail(): A[0] {
    return this[this.length - 1]
  }

  get uniq(): this {
    return (this.constructor as typeof List).bless(_uniq(this), this.query) as this
  }

  pluck(...keys: ID[]): List<any> {
    let cb
    switch (keys.length) {
      case 0:
        cb = function () {
          return null
        }
        break
      case 1:
        cb = _property(keys[0])
        break
      default:
        cb = function (o) {
          return _at(o, ...keys)
        }
        break
    }
    return (this.constructor as typeof List).bless(this.map(cb), this.query)
  }

  static bless<A extends DEFAULT_RULE_TYPE>(list: any[], query: Query<A>) {
    Reflect.setPrototypeOf(list, this.prototype)
    if (query && query.where && query.in) {
      ;(list as any).query = query
    }
    return (list as any) as List<A>
  }

  constructor(query: Query<A>) {
    super()
    if (query && query.where && query.in) {
      this.query = query
    }
  }

  sort(...cmd: any[]) {
    const o = (_orderBy(this, cmd[0], cmd[1]) as any) as this
    Reflect.setPrototypeOf(o, Reflect.getPrototypeOf(this))
    return o
  }

  group_by(cb) {
    const o = (_groupBy(this, cb) as any) as DIC<List<A>>
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
