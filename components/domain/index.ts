/**
 * 도메인 컴포넌트 barrel — 갓깨비 키우기 가이드 15종.
 * 외부에서는 본 파일을 통해 import (`import { Hero, TOC } from '@/components/domain'`).
 */
export { Hero, type HeroProps } from './hero';
export { TOC, type TOCProps, type TOCItem } from './toc';
export { ClassCard, type ClassCardProps } from './class-card';
export {
  JinryeongCard,
  type JinryeongCardProps,
  type JinryeongRarity,
} from './jinryeong-card';
export { TierList, type TierListProps, type TierRow } from './tier-list';
export { ComboCard, type ComboCardProps, type ComboType } from './combo-card';
export { CouponCode, type CouponCodeProps } from './coupon-code';
export { Alert as DomainAlert, type AlertProps, type AlertVariant } from './alert';
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
export { BuildTagBadge, type BuildTagBadgeProps } from './build-tag-badge';
