require('./models/index')
const { State, Set, Query, Model } = require('../lib/index')

const { stories, events } = require('./json/story_progress.json')
const { plans } = require('./json/plan_progress.json')
const { SowVillage } = require('./models/sow')
const metaP = State.transaction(() => {
  Set.sow_village_plan.reset(plans)
}, {})

stories.forEach((o) => {
  const sign = o.sow_auth_id.replace(/\./g, '&#2e')
  Object.assign(o, {
    label: o.name,
    sign: sign,
    mark_ids: (() => {
      switch (o.rating) {
        case 'default':
          return []
        case 'child':
          return ['age_A']
        case 'fireplace':
          return ['cat']
        case 'sexylove':
          return ['sexy', 'love']
        case 'sexyviolence':
          return ['sexy', 'violence']
        default:
          return [o.rating]
      }
    })(),
  })
})

const metaS = State.transaction(() => {
  Set.sow_village.reject(Query.sow_villages.prologue.list)
  Set.sow_village.reject(Query.sow_villages.progress.list)
  Set.sow_turn.merge(events)
  Set.sow_village.merge(stories)
}, {})

Set.sow_village_plan.reset([])
Set.sow_village.reset([])
Set.sow_turn.reset([])

State.store(JSON.parse(JSON.stringify(metaP)))
State.store(JSON.parse(JSON.stringify(metaS)))

describe('path', function () {
  test('metaS snapshot', () => expect(metaS).toMatchSnapshot())
  test('partition snapshot', () => expect(Query.sow_villages.progress.reduce).toMatchSnapshot())
})
