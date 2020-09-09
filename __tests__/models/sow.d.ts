import { Query as Q, Model } from '../../lib/base'
import { SAYCNTS, TRSIDS, CSIDS, GAMES, VOTETYPES, BOOLS } from '../lib/dic'
export declare class SowTurn extends Model {}
export declare class SowVillage extends Model {
  timer: any
  write_at: number
  sign: any
  folder: any
  vpl: any
  type: any
  rating: any
  name: any
  card: any
  options: any
  is_epilogue: any
  is_finish: any
  href: string
  mode: string
  turns: Q<SowTurn>
  upd: {
    interval: any
    hour: any
    minute: any
  }
  aggregate: {
    face_ids: never[]
  }
  q: {
    yeary: string
    monthry: string
    in_month: string
    sow_auth_id: any
    folder_id: any
    size: string
    say: any
    mob: any
    game: any
    upd_at: string
    upd_range: string
    rating: any
    search_words: any
  }
  get query(): Q<SowVillage>
  get roles():
    | never[]
    | {
        [key: string]: import('../../lib/type').Reduce
      }
    | Partial<{
        id: string
        list: (Model | import('../../lib/struct').Struct)[]
        hash: {
          [key: string]: Model | import('../../lib/struct').Struct
        }
        navi: import('../../lib/type').NAVI
        set: string[]
        max_is: any
        min_is: any
        max: string | number
        min: string | number
        variance_data: number[]
        variance: number
        count: number
        all: number
        pow: number
        avg: number
        sd: number
        standard(this: Partial<any>, data: number): number
        range: number
        density: number
      }>
  get event_length(): any
}
export declare class Folder extends Model {
  disabled: boolean
  epi_url: string
  folder: string
  hostname: string
  href: string
  info_url: string
  livelog: string
  max_vils: number
  nation: string
  oldlog: string
  rule: string
  server: string
  title: string
  vid_code: string
  route: {
    path: string
    name: string
  }
  story: {
    evil: string
    role_play: boolean
  }
  config: {
    saycnt: typeof SAYCNTS[number][]
    trsid: typeof TRSIDS[number][]
    csid: typeof CSIDS[number][]
    game: typeof GAMES[number][]
    pl: string
    erb: string
    cd_default: string
    is_angular: string
    cfg: {
      BASEDIR_CGI: '.'
      BASEDIR_CGIERR: 'http://crazy-crazy.sakura.ne.jp//giji_lobby/lobby'
      BASEDIR_DAT: './data'
      BASEDIR_DOC: 'http://giji-assets.s3-website-ap-northeast-1.amazonaws.com'
      ENABLED_VMAKE: 0
      MAX_LOG: 750
      MAX_VILLAGES: 10
      NAME_HOME: '人狼議事 ロビー'
      RULE: 'LOBBY'
      TIMEOUT_ENTRY: 3
      TIMEOUT_SCRAP: 365
      TOPPAGE_INFO: './_info.pl'
      TYPE: 'BRAID'
      URL_SW: 'http://crazy-crazy.sakura.ne.jp/giji_lobby/lobby'
      USERID_ADMIN: 'master'
      USERID_NPC: 'master'
    }
    enable: {
      DEFAULT_VOTETYPE: [typeof VOTETYPES[number], '標準の投票方法(sign: 記名、anonymity:無記名)']
      ENABLED_AIMING: [BOOLS, '1:対象を指定した発言（内緒話）を含める']
      ENABLED_AMBIDEXTER: [
        BOOLS,
        '1:狂人の裏切りを認める（狂人は、人狼陣営ではなく裏切りの陣営＝村が負ければよい）'
      ]
      ENABLED_BITTY: [BOOLS, '少女や交霊者ののぞきみがひらがなのみ。']
      ENABLED_DELETED: [BOOLS, '削除発言を表示するかどうか']
      ENABLED_MAX_ESAY: [BOOLS, 'エピローグを発言制限対象に 0:しない、1:する']
      ENABLED_MOB_AIMING: [BOOLS, '1:見物人が内緒話を使える。']
      ENABLED_PERMIT_DEAD: [BOOLS, '墓下の人狼/共鳴者/コウモリ人間が囁きを見られるかどうか']
      ENABLED_RANDOMTARGET: [BOOLS, '1:投票・能力先に「ランダム」を含める']
      ENABLED_SEQ_EVENT: [BOOLS, '0:ランダムイベント 1:順序通りのイベント']
      ENABLED_SUDDENDEATH: [BOOLS, '1:突然死あり']
      ENABLED_SUICIDE_VOTE: [BOOLS, '1:自殺投票']
      ENABLED_UNDEAD: [BOOLS, '1:幽界トーク村を設定可能']
      ENABLED_WINNER_LABEL: [BOOLS, '1:勝利者表示をする。']
    }
    maxsize: {
      MAXSIZE_ACTION: number
      MAXSIZE_MEMOCNT: number
      MAXSIZE_MEMOLINE: number
    }
    path: {
      DIR_LIB: './lib'
      DIR_HTML: './html'
      DIR_RS: './rs'
      DIR_VIL: './data/vil'
      DIR_USER: '../data/user'
    }
  }
}
