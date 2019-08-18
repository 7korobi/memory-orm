const _ = require("lodash");

module.exports = class Model {

  get id() {
    return this._id;
  }

  static bless(o) {
    Reflect.setPrototypeOf(o, this.prototype);
    return o;
  }

  static $deploy(item, parent) {
    this.bless(item);
    if (parent) {
      _.merge(item, parent);
    }
    const ref = this.$name.deploys
    for (let i = 0, len = ref.length; i < len; i++) {
      const deploy = ref[i];
      deploy.call(item, this);
    }
    if (!item.id) {
      throw new Error(`detect bad data: ${JSON.stringify(item)}`);
    }
  }

  static update(item, old) {}

  static create(item) {}

  static delete(old) {}

  static map_partition(item, emit) {
    return void 0;
  }

  static map_reduce(item, emit) {
    return void 0;
  }

  static order(reduce, emit) {
    return void 0;
  }

};
