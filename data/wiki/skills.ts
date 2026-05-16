/**
 * 직업별 스킬 31종 시드 데이터.
 * 출처: source/godkkabi-guide/index.html §고급 Tip / 직업별 추천 스킬 표 (lines 2169-2205)
 *
 * 구성 원리:
 *  - 전사: 천탈창경 (코어 1) + 액티브 3 + 패시브 4 = 8
 *  - 검객: 운소검경 (코어 1) + 액티브 8 + 패시브 5 = 14
 *  - 영매: 어뢰진결 (코어 1) + 액티브 3 + 패시브 5 = 9
 *
 * 운영 원리:
 *  - 코어 1 + 액티브 3~4 + 패시브 4~5 구성
 *  - 스킬명은 패치로 변경될 수 있으나 구성 원리는 동일
 */
import type { WikiSkillDoc } from '@/types/wiki';

type Skill = Omit<WikiSkillDoc, 'updatedAt'>;

export const WIKI_SKILLS_SEED: readonly Skill[] = [
  // ─── 전사 (8) ───
  {
    id: 'warrior-cheontalchanggyeong',
    name: '천탈창경',
    classId: 'warrior',
    kind: 'core',
    description: '전사의 메인 코어 스킬. 창 화력의 결정타.',
    metaNote: '직업 메인 화력에 매칭 — 전사는 창 계열 코어를 반드시 장착.',
  },
  {
    id: 'warrior-baekhojinsal',
    name: '백호진살',
    classId: 'warrior',
    kind: 'active',
    description: '범위 타격형 액티브. 쿨타임 중간.',
  },
  {
    id: 'warrior-hwanmajeonsin',
    name: '환마전신',
    classId: 'warrior',
    kind: 'active',
    description: '단일 폭딜 액티브. 보스전 활용도 높음.',
  },
  {
    id: 'warrior-gyeonggeumjeongi',
    name: '경금전기',
    classId: 'warrior',
    kind: 'active',
    description: '연속 타격형 액티브. 자동 사냥 효율 보강.',
  },
  {
    id: 'warrior-bunshingichaam',
    name: '분신기참',
    classId: 'warrior',
    kind: 'passive',
    description: '분신 추가 타격 패시브. 자동 사냥 시 누적 효과.',
  },
  {
    id: 'warrior-janyangchanggyeol',
    name: '잔양창결',
    classId: 'warrior',
    kind: 'passive',
    description: '잔여 피해 누적 패시브. 장기 사냥 우수.',
  },
  {
    id: 'warrior-pamagyeok',
    name: '파마격',
    classId: 'warrior',
    kind: 'passive',
    description: '치명타 보정 패시브.',
  },
  {
    id: 'warrior-yeonokchanmanggi',
    name: '연옥창망기',
    classId: 'warrior',
    kind: 'passive',
    description: '광역 피해량 보정 패시브. 다수 적 대응.',
  },

  // ─── 검객 (14) ───
  {
    id: 'swordsman-unsogeomgyeong',
    name: '운소검경',
    classId: 'swordsman',
    kind: 'core',
    description: '검객의 메인 코어. 검기 화력의 정점.',
    metaNote: '메타 정석 — 검객은 운소검경 코어를 반드시 1개 장착.',
  },
  {
    id: 'swordsman-jinsalgeomjin',
    name: '진살검진',
    classId: 'swordsman',
    kind: 'active',
    description: '검진 발동 액티브. 광역 적 처리.',
  },
  {
    id: 'swordsman-geumragerimang',
    name: '금라검망',
    classId: 'swordsman',
    kind: 'active',
    description: '검망 포위 액티브. 단일 보스 폭딜.',
  },
  {
    id: 'swordsman-geomsimtongsin',
    name: '검심통신',
    classId: 'swordsman',
    kind: 'active',
    description: '연속 검기 발사 액티브. 사이클 핵심.',
  },
  {
    id: 'swordsman-ihanmujeong',
    name: '이한무정',
    classId: 'swordsman',
    kind: 'active',
    description: '냉기 검술 액티브. 슬로우 부여.',
  },
  {
    id: 'swordsman-geomgyeopsin',
    name: '검겁신',
    classId: 'swordsman',
    kind: 'active',
    description: '검신 강림 액티브. 짧은 무적 동반.',
  },
  {
    id: 'swordsman-yugeohyeongong',
    name: '육어현공',
    classId: 'swordsman',
    kind: 'active',
    description: '공중 검 소환 액티브. 다단 히트.',
  },
  {
    id: 'swordsman-nacheonjoyoung',
    name: '나천조영',
    classId: 'swordsman',
    kind: 'active',
    description: '환영 검 분신 액티브. 추가 타격.',
  },
  {
    id: 'swordsman-eumyanghyeongcheong',
    name: '음양현청',
    classId: 'swordsman',
    kind: 'active',
    description: '음양 균형 액티브. 공방 동시 보정.',
  },
  {
    id: 'swordsman-tangsaenggeomsul',
    name: '탕생검술',
    classId: 'swordsman',
    kind: 'passive',
    description: '검술 회복 패시브. 생존력 보강.',
  },
  {
    id: 'swordsman-hyeontonggeomui',
    name: '현통검의',
    classId: 'swordsman',
    kind: 'passive',
    description: '검의 강화 패시브. 코어 피해 증폭.',
  },
  {
    id: 'swordsman-haengunryusu',
    name: '행운류수',
    classId: 'swordsman',
    kind: 'passive',
    description: '치명타 회심 패시브. 메타 핵심.',
  },
  {
    id: 'swordsman-mangyunjeonghwa',
    name: '만균정화',
    classId: 'swordsman',
    kind: 'passive',
    description: '공격력 % 패시브. 스탯 비례 강화.',
  },
  {
    id: 'swordsman-ogihwail',
    name: '오기화일',
    classId: 'swordsman',
    kind: 'passive',
    description: '오기 합일 패시브. 후반 폭딜.',
  },

  // ─── 영매 (9) ───
  {
    id: 'medium-eoroejingyeol',
    name: '어뢰진결',
    classId: 'medium',
    kind: 'core',
    description: '영매의 메인 코어. 뇌계열 광역 화력.',
    metaNote: '영매는 뢰(雷) 계열 코어를 반드시 장착.',
  },
  {
    id: 'medium-cheonroein',
    name: '천뢰인',
    classId: 'medium',
    kind: 'active',
    description: '천둥 소환 액티브. 단일 강타.',
  },
  {
    id: 'medium-wonjagameung',
    name: '원자감응',
    classId: 'medium',
    kind: 'active',
    description: '원자 반응 액티브. 연쇄 광역.',
  },
  {
    id: 'medium-roejujin',
    name: '뇌주진',
    classId: 'medium',
    kind: 'active',
    description: '뇌주 진영 액티브. 지속 광역 피해.',
  },
  {
    id: 'medium-eoroe-hwakjang',
    name: '어뢰 확장',
    classId: 'medium',
    kind: 'passive',
    description: '뇌 범위 확장 패시브. 광역기 강화.',
  },
  {
    id: 'medium-eoroe-pokbal',
    name: '어뢰 폭발',
    classId: 'medium',
    kind: 'passive',
    description: '뇌 폭발 추가 피해 패시브.',
  },
  {
    id: 'medium-noewonhakse',
    name: '뇌원학세',
    classId: 'medium',
    kind: 'passive',
    description: '학습형 패시브. 누적 데미지.',
  },
  {
    id: 'medium-mangryeongjiche',
    name: '만령지체',
    classId: 'medium',
    kind: 'passive',
    description: '만령 가호 패시브. 마법 효율 보정.',
  },
  {
    id: 'medium-sinso',
    name: '신소',
    classId: 'medium',
    kind: 'passive',
    description: '신소 가호 패시브. 후반 광역 폭딜.',
  },
];

export function getSkillsByClass(
  classId: WikiSkillDoc['classId'],
): Skill[] {
  return WIKI_SKILLS_SEED.filter((s) => s.classId === classId);
}

export function getSkillsByKind(
  classId: WikiSkillDoc['classId'],
  kind: WikiSkillDoc['kind'],
): Skill[] {
  return WIKI_SKILLS_SEED.filter((s) => s.classId === classId && s.kind === kind);
}
