import { Model } from '../../lib/base'
export declare class Marker extends Model {
  book_id: string
  mark_at: string | number | undefined
  get anker(): string
}
export declare class Icon extends Model {}
