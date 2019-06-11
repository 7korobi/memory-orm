_ = require "lodash"


module.exports = class Model
  @bless: (o)->
    Reflect.setPrototypeOf o, @::
    o

  @$deploy: (item, parent)->
    @bless item
    if parent
      _.merge item, parent
    for deploy in @$name.deploys
      deploy.call item, @
    unless item.id
      throw new Error "detect bad data: #{JSON.stringify item}"

  @update: (item, old)->
  @create: (item)->
  @delete: (old)->

  @map_partition:  (item, emit)->
    undefined

  @map_reduce: (item, emit)->
    undefined

  @order: (reduce, emit)->
    undefined
