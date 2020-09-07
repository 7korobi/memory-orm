import { Name } from './type'

export class Model extends Object {
  idx?: string
  static $name: Name
  private _id!: string
  get id() {
    return this._id
  }

  static bless(o) {
    Reflect.setPrototypeOf(o, this.prototype)
    return o
  }

  static deploy(struct) {}

  static update(item, old) {}

  static create(item) {}

  static delete(old) {}

  static map_partition(item, emit) {}

  static map_reduce(item, emit) {}

  static order(item, emit) {}
}
