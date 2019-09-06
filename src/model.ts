const _ = require("lodash");

const model = class Model {
  static bless(o) {
    Reflect.setPrototypeOf(o, this.prototype);
    return o;
  }

  static deploy(model) {}

  static update(item, old) {}

  static create(item) {}

  static delete(old) {}

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

module.exports = model

Object.defineProperties(model.prototype, {
  id: {
    enumerable: true,
    get: function() {
      return this._id;
    },
  }
})