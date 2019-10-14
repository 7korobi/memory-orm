const struct = class Struct extends Array {
  static bless(o) {
    Reflect.setPrototypeOf(o, this.prototype);
    return o;
  }

  static deploy(struct) { }

  static update(item, old) { }

  static create(item) { }

  static delete(old) { }

  static map_partition(item, emit) {
    return void 0;
  }

  static map_reduce(item, emit) {
    return void 0;
  }

  static order(item, emit) {
    return void 0;
  }

};

module.exports = struct

Object.defineProperties(struct.prototype, {
  id: {
    enumerable: true,
    get: function () {
      return this[0];
    },
  }
})