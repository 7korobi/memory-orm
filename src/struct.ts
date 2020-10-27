import { ID, NameBase } from './type'

export type STRUCT<T extends string> = Struct & { [label in T]: any }

export class Struct extends Array {
  idx?: string
  get id(): string {
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

export function Structure<T extends string>(
  labels: readonly T[],
  get: (this: STRUCT<T>) => ID
): { new (): STRUCT<T> } {
  class struct extends Struct {}
  labels.forEach((label, idx) => {
    Object.defineProperty(struct.prototype, label, {
      enumerable: true,
      get() {
        return this[idx]
      },
    })
  })

  Object.defineProperty(struct.prototype, 'id', {
    enumerable: true,
    get,
  })
  return struct as { new (): STRUCT<T> }
}
