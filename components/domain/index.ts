/**
 * 도메인 컴포넌트 barrel — 갓깨비 키우기 가이드.
 * v2 P3.A 진행 중 — 토큰 교체 재사용 8개 + P3.B에서 재작성 6개.
 *
 * 재사용 (토큰 교체 예정): TOC, Alert, EventCard, PayTier, TipCard,
 *   PriorityFlow, BuildTagBadge, ScreenshotStrip, Footer
 *
 * 재작성 예정 (P3.B):
 *   - Hero (banner-korean-carry 배경)
 *   - ClassCard (StatsGrid + accent stripe)
 *   - JinryeongCard (catalog 모티프)
 *   - TierList (JinryeongCard 의존)
 *   - CouponCode (신고 버튼 추가)
 *   - ComboCard (SynergyBlock으로 흡수)
 */
export { TOC, type TOCProps, type TOCItem } from './toc';
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
