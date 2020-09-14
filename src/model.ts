import { ID, NameBase } from './type'

export class Model extends Object {
  idx?: string
  _id!: ID
  get id() {
    return this._id
  }

  static $name: NameBase

  static bless(o: Object) {
    Reflect.setPrototypeOf(o, this.prototype)
  }

  static deploy(struct) {}

  static update(item, old) {}

  static create(item) {}

  static delete(old) {}

  static map_partition(item, emit) {}

  static map_reduce(item, emit) {}

  static order(item, emit) {}
}
