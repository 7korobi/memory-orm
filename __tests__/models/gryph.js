/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Set, Model, Query, Rule } = require('../../lib/index')

new Rule('point').schema(function () {
  return this.struct('x', 'y', 'r', 'color', function () {
    return this.join('*')
  })
})

new Rule('line').schema(function () {
  return this.struct(function () {
    return this.join('*')
  })
})

new Rule('delta').schema(function () {
  return this.struct(function () {
    return this.join('*')
  })
})

Set.point.reset([
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
])

Set.line.reset([
  [
    [1, 1],
    [-1, -1],
  ],
  [
    [1, -1],
    [-1, 1],
  ],
  [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ],
])
