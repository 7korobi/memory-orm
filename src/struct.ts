import { Name } from './type'

export class Struct extends Array {
  idx?: string
  get id() {
    return this[0]
  }

  static $name: Name

  static bless(o: any[]) {
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
