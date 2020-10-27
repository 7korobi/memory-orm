/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Set, Rule } = require('../../lib/index')
const { Struct, Structure } = require('../../lib/struct')

const Points = Structure(['x', 'y', 'r', 'color'], function () {
  return this.join('*')
})
class Point extends Struct {
  get id() {
    return this.join('*')
  }
}

class Line extends Struct {
  get id() {
    return this.join('*')
  }
}

class Delta extends Struct {
  get id() {
    return this.join('*')
  }
}

new Rule('point', { model: Points, schema() {} })

new Rule('line', { model: Line, schema() {} })

new Rule('delta', { model: Delta, schema() {} })

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
