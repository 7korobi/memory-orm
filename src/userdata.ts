import { DIC, NameBase } from './type'
import { Finder as FinderBase } from './finder'
import { Set as SetBase } from './set'
import { Map as MapBase } from './map'
import { Query as QueryBase } from './query'

export const Name: DIC<NameBase> = {}
export const Set: DIC<SetBase<any>> = {}
export const Map: DIC<MapBase<any>> = {}
export const Query: DIC<QueryBase<any>> = {}
export const Finder: DIC<FinderBase<any>> = {}

export function merge(o: DIC<any>) {
  for (const key in o) {
    if (Query[key]) {
      const sk = Name[key].base
      const val = o[key]
      Set[sk].merge(val)
    }
    if (Set[key]) {
      const val = o[key]
      Set[key].append(val)
    }
  }
}
