/**
 * 도메인 컴포넌트 barrel — 갓깨비 키우기 가이드 v2.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/component-inventory-v2.md §3
 *
 * v1 → v2:
 *  - 재사용 (토큰 swap): TOC / PriorityFlow / PayTier / ScreenshotStrip / Footer
 *  - 재작성 (Firestore 어댑터 P3.C): EventCard / TipCard
 *  - 폐기: DomainAlert / BuildTagBadge
 *  - 신규 (P3.B): HeroMeta / HeroMetaBadge / StatCell / Note / TierStripe / ClassCard / JinryeongCard
 *  - 신규 (P3.C 예정): EquipmentCard / SkillCard
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

// v2 신규 — P3.B
export { HeroMeta, HeroMetaBadge } from './hero-meta';
export { StatCell, type StatCellProps } from './stat-cell';
export { Note, type NoteProps } from './note';
export { TierStripe, type TierStripeProps } from './tier-stripe';
export { ClassCard, type ClassCardProps } from './class-card';
export { JinryeongCard, type JinryeongCardProps } from './jinryeong-card';

// v2 신규 — P3.C
export { SkillCard, type SkillCardProps } from './skill-card';
export { ContentCard, type ContentCardProps } from './content-card';
export { EquipmentCard, type EquipmentCardProps } from './equipment-card';
export { MunpaCard, type MunpaCardProps } from './munpa-card';
