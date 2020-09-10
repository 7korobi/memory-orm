import { Metadata } from './mem'
import { LeafCmd, MODEL, CLASS, MODEL_DATA } from './type'

export class Datum {
  item!: MODEL
  meta!: Metadata
  $group: [string, LeafCmd][]
  static bless(o: Datum, meta: Metadata, model: CLASS<any>) {
    model.bless(o.item as any)
    o.meta = meta
  }

  constructor(meta: Metadata, item: MODEL_DATA) {
    this.meta = meta
    this.item = item as any
    this.$group = []
  }

  toJSON(key) {
    return { item: this.item, $group: this.$group }
  }
}
