'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const index_1 = require('../../lib/index')
const react = {
  state: {
    step_faces: 0,
    step_tags: 0,
    step_chr_sets: 0,
    step_chr_jobs: 0,
  },
  setState(state) {
    return (index_1.Query.static.react = state)
  },
}
index_1.State.join({ react })
index_1.Query.static = {
  react: {},
  meta: {},
}

require('./gryph')
require('./random')

require('./chr')
require('./potof')
require('./card')

require('./book')
require('./part')
require('./phase')
require('./section')
require('./chat')

require('./sow')

require('./activity')
require('./workflow')

require('./path')
