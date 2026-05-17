/**
 * /terms — 이용약관.
 * 출처: docs/sprint/10-sprint-launch/prd.md §F1.2 + PIPA
 *
 * 비공식 팬 가이드 명시 + 권리자 요청 시 24h 대응 + 만 14세 이상 + 면책.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { SUPPORT_EMAIL } from '@/lib/config/support';

const LAST_UPDATED = '2026-05-17';

export const metadata: Metadata = {
  title: '이용약관',
  description: 'kkaebizigi(깨비지기 비공식 팬 가이드) 이용약관. 만 14세 이상 + 권리자 요청 시 24h 내 대응.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>Legal</HeroMetaBadge>
          <span className="font-mono">최종 갱신 {LAST_UPDATED}</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Terms of Service" />
          <SectionTitle as="h1">이용약관</SectionTitle>
          <SectionLead>
            본 약관은 kkaebizigi(이하 &quot;본 사이트&quot;) 서비스 이용 시 적용됩니다. 회원가입 또는 서비스 이용 시 본 약관에 동의한 것으로 간주됩니다.
          </SectionLead>
        </SectionHead>
      </header>

      <article className="legal-prose mx-auto mt-10 max-w-3xl space-y-10 text-text-soft">
        <Section id="provision-1" title="제1조 (목적)">
          <p>
            본 약관은 kkaebizigi(이하 &quot;본 사이트&quot;)가 제공하는 비공식 팬 가이드 서비스의
            이용 조건 및 절차, 이용자와 운영자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </Section>

        <Section id="provision-2" title="제2조 (서비스의 성격 — 비공식 팬 가이드)">
          <p>
            본 사이트는 모바일 게임 &quot;갓깨비 키우기&quot;에 대한 정보·전략·커뮤니티를 제공하는
            <strong> 비공식 팬 가이드</strong>로, Joy Nice Games / JOY MOBILE NETWORK PTE. LTD. / 4399 / Kakao Games 등
            게임 운영사 및 저작권자와 무관합니다.
          </p>
          <p>
            본 사이트의 콘텐츠 중 게임사의 저작권에 속하는 자료(이미지, 텍스트, 데이터)는
            인용·해설 목적의 공정 이용(Fair Use)으로 사용되며,
            <strong> 저작권자의 요청 시 24시간 이내에 해당 콘텐츠를 수정 또는 삭제</strong>합니다.
            요청은 <Link href={`mailto:${SUPPORT_EMAIL}`} className="text-bronze underline-offset-4 hover:underline">{SUPPORT_EMAIL}</Link>으로 보내주세요.
          </p>
        </Section>

        <Section id="provision-3" title="제3조 (이용 자격)">
          <ul className="list-inside list-disc space-y-1">
            <li>본 사이트는 <strong>만 14세 이상</strong>의 자연인에 한하여 이용 가능합니다. 만 14세 미만은 개인정보 보호법에 따라 법정대리인의 동의가 별도로 필요합니다.</li>
            <li>가입 시 Google 계정으로 인증하며, 1인 1계정을 원칙으로 합니다.</li>
            <li>운영자(role=admin)는 신고·악용·법령 위반 사용자의 계정을 일시 정지 또는 영구 차단할 수 있습니다.</li>
          </ul>
        </Section>

        <Section id="provision-4" title="제4조 (회원 정보)">
          <p>회원가입 시 다음 정보를 수집·저장합니다:</p>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>Google 계정으로부터</strong>: 이메일, 이름, 프로필 사진</li>
            <li><strong>사용자가 직접 입력</strong>: 게임 서버 ID, 게임 UID, 문파명, 닉네임, 직업</li>
            <li>회원가입 후 게임 UID는 변경할 수 없으며, 나머지 항목은 <Link href="/me/profile" className="text-bronze underline-offset-4 hover:underline">/me/profile</Link>에서 수정 가능합니다.</li>
          </ul>
          <p>
            상세 처리 방침은 <Link href="/privacy" className="text-bronze underline-offset-4 hover:underline">개인정보처리방침</Link>을 참조하세요.
          </p>
        </Section>

        <Section id="provision-5" title="제5조 (이용자의 의무 — 금지 행위)">
          <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>욕설·비방·차별·혐오 표현 작성</li>
            <li>저작권·초상권을 침해하는 콘텐츠 업로드</li>
            <li>스팸·도배·광고성 게시</li>
            <li>타인 사칭, 운영자 사칭</li>
            <li>본인 계정 외 타인 계정 이용 또는 부정 거래</li>
            <li>법령 위반 또는 공공질서를 해치는 행위</li>
          </ul>
          <p>
            위반 시 운영자는 사전 통보 없이 콘텐츠를 숨김·삭제하고, 반복 위반 시 계정을 정지 또는 영구 차단할 수 있습니다.
            정지 사용자는 신고 검토를 위해 30일간 콘텐츠 메타데이터(작성자 UID, 시각)가 보관됩니다.
          </p>
        </Section>

        <Section id="provision-6" title="제6조 (운영자의 의무 — 신고 응대)">
          <ul className="list-inside list-disc space-y-1">
            <li>운영자는 <strong>24시간 이내</strong> 신고에 응대합니다.</li>
            <li>명백한 욕설/스팸은 자동 시스템이 즉시 숨김 처리한 후 운영자 검토를 거칩니다.</li>
            <li>저작권자 요청에 대해 <strong>24시간 이내</strong> 수정 또는 삭제합니다.</li>
            <li>중대 시스템 장애 시 메인 페이지 또는 이메일을 통해 공지합니다.</li>
          </ul>
        </Section>

        <Section id="provision-7" title="제7조 (콘텐츠 권리)">
          <p>
            이용자가 작성한 콘텐츠(게시물, 댓글, 채팅 메시지)의 저작권은 작성자에게 귀속됩니다.
            단, 본 사이트는 서비스 운영·홍보 목적으로 해당 콘텐츠를 비독점적·전 세계적·로열티 프리 라이선스로 이용할 수 있습니다.
          </p>
          <p>
            본 사이트가 제작한 가이드·해설·시뮬레이터 등의 저작권은 본 사이트에 귀속되며,
            비상업적 인용은 출처(<Link href="https://kkaebizigi.com" className="text-bronze underline-offset-4 hover:underline">kkaebizigi.com</Link>) 표기 시 허용됩니다.
          </p>
        </Section>

        <Section id="provision-8" title="제8조 (회원 탈퇴 및 자격 상실)">
          <ul className="list-inside list-disc space-y-1">
            <li>이용자는 언제든지 <Link href="/me/delete-account" className="text-bronze underline-offset-4 hover:underline">/me/delete-account</Link>에서 탈퇴할 수 있습니다.</li>
            <li>탈퇴 시 닉네임·프로필 정보는 즉시 익명화되며, 작성한 게시물·댓글은 작성자 표시가 &quot;삭제된 사용자&quot;로 변경됩니다.</li>
            <li>탈퇴 후 30일간 데이터가 보관된 뒤 영구 삭제됩니다(PIPA 준수). 30일 내 동일 Google 계정으로 재가입 시 데이터 복구를 신청할 수 있습니다.</li>
            <li>운영자가 약관 위반으로 강제 탈퇴 처리한 경우, 동일 Google 계정으로의 재가입이 제한될 수 있습니다.</li>
          </ul>
        </Section>

        <Section id="provision-9" title="제9조 (서비스 변경 및 중단)">
          <p>
            본 사이트는 1인 개인 프로젝트로 운영되며, 운영자 사정에 따라 서비스가 일시 중단되거나 종료될 수 있습니다.
            중대 변경 또는 종료 시 최소 30일 전 메인 페이지 공지를 통해 안내합니다.
          </p>
        </Section>

        <Section id="provision-10" title="제10조 (광고 및 후원)">
          <p>
            본 사이트는 운영비용 충당을 위해 Google AdSense 광고를 게시할 수 있습니다.
            맞춤 광고는 사용자가 회원가입 시 <strong>광고 동의 체크박스</strong>에 명시 동의한 경우에만 활성화됩니다.
            거절 시 비-맞춤 광고가 표시되거나 광고가 표시되지 않습니다(GDPR/PIPA 준수).
          </p>
        </Section>

        <Section id="provision-11" title="제11조 (면책)">
          <p>본 사이트는 다음 사항에 대해 책임지지 않습니다:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>게임 운영사의 패치·업데이트로 인한 가이드 정보의 시점적 오차</li>
            <li>이용자 간 분쟁 또는 거래(예: 계정 거래, 아이템 거래)</li>
            <li>천재지변, 정전, 외부 서비스 장애(Vercel, Google, Firebase) 등 불가항력으로 인한 서비스 중단</li>
            <li>이용자의 부주의로 인한 손해(계정 비밀번호 노출 등)</li>
          </ul>
        </Section>

        <Section id="provision-12" title="제12조 (준거법 및 분쟁 해결)">
          <p>
            본 약관 및 본 사이트 이용과 관련된 분쟁은 대한민국법을 준거법으로 하며, 운영자의 주소지 관할 법원을 합의 관할로 합니다.
            제소 전 운영자와 이용자는 성실히 협의하여 해결합니다.
          </p>
        </Section>

        <Section id="contact" title="문의">
          <p>
            본 약관 및 서비스 이용에 관한 문의는{' '}
            <Link href={`mailto:${SUPPORT_EMAIL}`} className="text-bronze underline-offset-4 hover:underline">
              {SUPPORT_EMAIL}
            </Link>
            으로 보내주세요.
          </p>
        </Section>

        <footer className="border-t border-ink-line pt-6 text-xs text-text-mute">
          <p>최종 갱신: {LAST_UPDATED}</p>
          <p>
            관련 문서: <Link href="/privacy" className="text-bronze underline-offset-4 hover:underline">개인정보처리방침</Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

interface SectionProps {
  readonly id: string;
  readonly title: string;
  readonly children: React.ReactNode;
}

function Section({ id, title, children }: SectionProps): React.JSX.Element {
  return (
    <section id={id} className="space-y-3 scroll-mt-20">
      <h2 className="text-xl font-bold tracking-tight text-text">{title}</h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
