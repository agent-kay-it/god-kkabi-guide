/**
 * 도메인 컴포넌트 barrel — 갓깨비 키우기 가이드 v2.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/component-inventory-v2.md §3
 *
 * v1 → v2:
 *  - 재사용 (토큰 swap): TOC / PriorityFlow / PayTier / ScreenshotStrip / Footer
 *  - 재작성 (P3.A 단계 토큰만, P3.C에서 Firestore 어댑터화): EventCard / TipCard
 *  - 폐기: DomainAlert (→ ui/alert), BuildTagBadge (→ ui/badge + lib/wiki/build-tag.ts)
 *  - 신규 (P3.B/C 추가 예정): HeroMeta / StatCell / Note / TierStripe / ClassCard / JinryeongCard / EquipmentCard / SkillCard
 */
export { TOC, type TOCProps, type TOCItem } from './toc';
export {
  PriorityFlow,
  type PriorityFlowProps,
  type PriorityStep,
} from './priority-flow';
export { PayTier, type PayTierProps, type PayTierLevel } from './pay-tier';
export { EventCard, type EventCardProps, type EventType } from './event-card';
export { TipCard, type TipCardProps, type TipCategory } from './tip-card';
export {
  ScreenshotStrip,
  type ScreenshotStripProps,
  type ScreenshotItem,
} from './screenshot-strip';
export { Footer, type FooterProps, type FooterSource } from './footer';
