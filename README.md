
## Install
```shell
yarn add vue-markup
```

## Quick Start
``` javascript
import Vue from 'vue'
import markup from 'vue-markup'

Vue.use(markup)

// or
import {
  Marked,
  Dagre
} from 'vue-markup'

Vue.component(Marked.name, Marked)
Vue.component(Dagre.name, Dagre)
```