const _ = require("lodash");
const Mem = require("./mem.coffee");
const Query = require("./query.coffee");

module.exports = class List extends Array {

  get first(){
    return this[0];
  }

  get last(){
    return this[this.length - 1];
  }

  get head(){
    return this[0];
  }

  get tail(){
    return this[this.length - 1];
  }

  get uniq(){
    return this.constructor.bless(_.uniq(this));
  }

  pluck(...keys){
    let cb;
    switch (keys.length) {
      case 0:
        cb = function() {
          return null;
        };
        break;
      case 1:
        cb = _.property(keys[0]);
        break;
      default:
        cb = function(o) {
          return _.at(o, ...keys);
        };
        break;
    };
    return this.constructor.bless(this.map(cb))
  }

  static bless(list, query) {
    Reflect.setPrototypeOf(list, this.prototype);
    if ( query && query.where && query.in ) {
      list.query = query;
    }
    return list;
  }

  constructor(query) {
    super();
    if ( query && query.where && query.in ) {
      this.query = query;
    }
  }

  sort(...sort) {
    const o = _.orderBy(this, ...sort);
    Reflect.setPrototypeOf(o, Reflect.getPrototypeOf(this));
    return o;
  }

  group_by(cb) {
    const o = _.groupBy(this, cb);
    for (const key in o) {
      const oo = o[key];
      Reflect.setPrototypeOf(oo, Reflect.getPrototypeOf(this));
    }
    return o;
  }

  page_by(per) {
    let idx = 0;
    return Object.values(this.group_by(function(o) {
      return Math.floor(idx++ / per);
    }));
  }

  where(req) {
    return this.query.where(req);
  }

  in(req) {
    return this.query.in(req);
  }

};
