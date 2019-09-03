{ Query, State } = require "../../src/index"
react =
  state:
    step_faces: 0
    step_tags:  0
    step_chr_sets: 0
    step_chr_jobs: 0
  setState: (state)->
    Query.static.react = state
State.join { react }


Query.static =
  react: {}
  meta: {}

require "./random"

require "./chr"
require "./potof"
require "./card"

require "./book"
require "./part"
require "./phase"
require "./section"
require "./chat"

require "./sow"


require "./activity"
require "./workflow"

require "./path"