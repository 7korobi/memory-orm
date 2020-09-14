import { ID, NameBase } from './type'

export class Struct extends Array {
  idx?: string
  get id(): ID {
    return this[0]
  }

  static $name: NameBase

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
