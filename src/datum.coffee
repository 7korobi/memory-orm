module.exports = class Datum
  @bless: (o, meta, model)->
    model.bless o.item
    o.meta = meta

  constructor: (@meta, @item)->
    @$group = []

  toJSON: (key)->
    { @item, @$group }
