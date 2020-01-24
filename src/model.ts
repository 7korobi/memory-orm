const model = class Model extends Object {
  static bless(o) {
    Reflect.setPrototypeOf(o, this.prototype);
    return o;
  }

  static deploy(struct) {}

  static update(item, old) {}

  static create(item) {}

  static delete(old) {}

  static map_partition(item, emit) {}

  static map_reduce(item, emit) {}

  static order(item, emit) {}
};

module.exports = model

Object.defineProperties(model.prototype, {
  id: {
    enumerable: true,
    get: function() {
      return this._id;
    },
  }
})