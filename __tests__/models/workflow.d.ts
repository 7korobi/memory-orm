import { Model } from '../../lib/base'
export declare class WorkLocation extends Model {
  zipcode: string
  on: string
  get id_ary(): string[]
  get prefecture(): string
}
export declare class WorkCountry extends Model {
  q: {
    search_words: any
  }
  country: any
}
export declare class WorkName extends Model {
  spell: string
  key: string
  spot: string
  mark: string
  name: string
  work_country_id: string
  q: {
    search_words: string
  }
}
