/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Query, State } = require('../../lib/index')
const react = {
  state: {
    step_faces: 0,
    step_tags: 0,
    step_chr_sets: 0,
    step_chr_jobs: 0,
  },
  setState(state) {
    return (Query.static.react = state)
  },
}
State.join({ react })

Query.static = {
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
