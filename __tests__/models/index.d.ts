import { Metadata } from '../../lib/index'
import { Query as Q } from '../../lib/base'
import { MODEL_DATA } from '../../lib/type'
declare const react: {
  state: {
    step_faces: number
    step_tags: number
    step_chr_sets: number
    step_chr_jobs: number
  }
  setState(state: any): any
}
declare module '../../lib/index' {
  const Query: {
    icons: Q<Icon>
    markers: Q<Marker>
    folders: Q<Folder>
    sow_turns: Q<SowTurn>
    sow_roletables: Q<MODEL_DATA>
    sow_villages: Q<SowVillage>
    work_names: Q<WorkName>
    work_locations: Q<WorkLocation>
    work_countrys: Q<WorkCountry>
    static: {
      meta: Metadata
      react: typeof react
    }
  }
}
import './random'
import './chr'
import './potof'
import './card'
import './book'
import './part'
import './phase'
import './section'
import './chat'
import './sow'
import './sheet'
import './activity'
import './workflow'
import { Folder, SowTurn, SowVillage } from './sow'
import { Marker, Icon } from './activity'
import { WorkName, WorkLocation, WorkCountry } from './workflow'
export {}
