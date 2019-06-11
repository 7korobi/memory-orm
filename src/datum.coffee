module.exports = Datum = (meta, item)->
  $group = []
  o = { meta, item, $group }
  Reflect.setPrototypeOf o, null
  o

Datum.bless = (o, meta, model)->
  model.bless o.item
  o.meta = meta
