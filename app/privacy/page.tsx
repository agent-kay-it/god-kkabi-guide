/**
 * /privacy — 개인정보처리방침.
 * 출처: docs/sprint/10-sprint-launch/prd.md §F1.2 + 개인정보 보호법(PIPA) 30조 등
 *
 * PIPA 필수 고지사항 — 수집 항목 / 목적 / 보관 / 제3자 제공 / 위탁 / 권리 / 쿠키.
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
  title: '개인정보처리방침',
  description:
    'kkaebizigi 개인정보 처리 방침. PIPA 준수 — 수집 항목, 목적, 보관, 제3자 제공, 위탁, 이용자 권리.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>Legal</HeroMetaBadge>
          <span className="font-mono">최종 갱신 {LAST_UPDATED}</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Privacy Policy" />
          <SectionTitle as="h1">개인정보처리방침</SectionTitle>
          <SectionLead>
            kkaebizigi(이하 &quot;본 사이트&quot;)는 개인정보 보호법(PIPA)에 따라 이용자의 개인정보를
            아래와 같이 수집·이용·보관·파기합니다.
          </SectionLead>
        </SectionHead>
      </header>

      <article className="legal-prose mx-auto mt-10 max-w-3xl space-y-10 text-text-soft">
        <Section id="article-1" title="제1조 (수집하는 개인정보 항목 및 수집 방법)">
          <p>본 사이트는 다음과 같은 개인정보를 수집합니다:</p>

          <Table>
            <Thead>
              <Tr>
                <Th>구분</Th>
                <Th>수집 항목</Th>
                <Th>수집 방법</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>회원가입 — 필수</Td>
                <Td>이메일, 이름, 프로필 사진</Td>
                <Td>Google OAuth 2.0</Td>
              </Tr>
              <Tr>
                <Td>회원가입 — 필수</Td>
                <Td>게임 서버 ID, 게임 UID, 문파명, 닉네임, 직업</Td>
                <Td>등록 폼 직접 입력</Td>
              </Tr>
              <Tr>
                <Td>서비스 이용 — 선택</Td>
                <Td>사용 통계, 페이지 조회, 이벤트 로그</Td>
                <Td>Google Analytics 4 (사용자 동의 시)</Td>
              </Tr>
              <Tr>
                <Td>서비스 이용 — 자동</Td>
                <Td>IP 주소, 접속 시간, User-Agent</Td>
                <Td>Vercel Edge 자동 수집(보안 로그 30일 보관)</Td>
              </Tr>
              <Tr>
                <Td>광고 — 선택</Td>
                <Td>광고 ID, 클릭/노출 데이터</Td>
                <Td>Google AdSense (사용자 동의 시)</Td>
              </Tr>
            </Tbody>
          </Table>
        </Section>

        <Section id="article-2" title="제2조 (개인정보의 수집 및 이용 목적)">
          <ul className="list-inside list-disc space-y-1">
            <li><strong>서비스 제공</strong>: 회원 식별, 게시판/북마크/채팅 기능 제공</li>
            <li><strong>채팅 채널 동기화</strong>: 서버/문파 ID 기반 채널 권한 확인</li>
            <li><strong>커뮤니티 운영</strong>: 신고 검토, 정지 처리, 욕설/스팸 자동 차단</li>
            <li><strong>서비스 개선</strong>: 익명 사용 통계 분석(동의자에 한함)</li>
            <li><strong>광고 게재</strong>: Google AdSense 광고(동의자에 한함)</li>
            <li><strong>법적 의무 이행</strong>: 분쟁 발생 시 증거 보전, 법령에 따른 신고 대응</li>
          </ul>
        </Section>

        <Section id="article-3" title="제3조 (개인정보의 보유 및 이용 기간)">
          <Table>
            <Thead>
              <Tr>
                <Th>항목</Th>
                <Th>보관 기간</Th>
                <Th>근거</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>회원 정보</Td>
                <Td>회원 가입~탈퇴 시까지</Td>
                <Td>서비스 제공</Td>
              </Tr>
              <Tr>
                <Td>탈퇴 후 보관</Td>
                <Td>탈퇴 후 30일(복구 cooldown)</Td>
                <Td>탈퇴 의사 재확인 + 분쟁 대비</Td>
              </Tr>
              <Tr>
                <Td>게시물·댓글·채팅 메시지</Td>
                <Td>익명화 후 무기한 보관(공개 정보)</Td>
                <Td>커뮤니티 가치 보존</Td>
              </Tr>
              <Tr>
                <Td>신고·모더레이션 로그</Td>
                <Td>30일</Td>
                <Td>분쟁 검토 + 재발 방지</Td>
              </Tr>
              <Tr>
                <Td>접속 로그(IP, 시각)</Td>
                <Td>3개월</Td>
                <Td>통신비밀보호법</Td>
              </Tr>
              <Tr>
                <Td>광고 식별자</Td>
                <Td>13개월</Td>
                <Td>Google AdSense 정책</Td>
              </Tr>
            </Tbody>
          </Table>
        </Section>

        <Section id="article-4" title="제4조 (개인정보의 제3자 제공)">
          <p>
            본 사이트는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
            단, 다음의 경우 예외로 합니다:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>법령 또는 수사기관의 적법한 요청이 있는 경우</li>
            <li>이용자가 사전에 공개에 동의한 경우(예: 채팅 메시지는 공개 정보)</li>
            <li>통계 작성·학술 연구 등 목적으로 특정 개인을 식별할 수 없는 형태로 가공한 경우</li>
          </ul>
        </Section>

        <Section id="article-5" title="제5조 (개인정보 처리 위탁)">
          <p>본 사이트는 다음 사업자에게 일부 업무를 위탁합니다:</p>
          <Table>
            <Thead>
              <Tr>
                <Th>위탁 사업자</Th>
                <Th>위탁 업무</Th>
                <Th>위탁 처리 정보</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>Vercel Inc. (미국)</Td>
                <Td>서비스 호스팅, Edge 캐싱</Td>
                <Td>IP, User-Agent, 페이지 URL</Td>
              </Tr>
              <Tr>
                <Td>Google LLC (미국)</Td>
                <Td>OAuth 인증, Analytics, AdSense</Td>
                <Td>이메일, 이름, 사용 통계</Td>
              </Tr>
              <Tr>
                <Td>Google Firebase (싱가포르)</Td>
                <Td>Firestore DB, Realtime Database 채팅</Td>
                <Td>회원 정보 전체, 채팅 메시지</Td>
              </Tr>
            </Tbody>
          </Table>
          <p className="text-xs text-text-mute">
            위탁 사업자는 위탁 업무 외 목적으로 정보를 이용·제공하지 못하며, 보유 기간 종료 시 파기합니다.
          </p>
        </Section>

        <Section id="article-6" title="제6조 (이용자의 권리)">
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>열람</strong>: <Link href="/me" className="text-bronze underline-offset-4 hover:underline">/me</Link> 페이지에서 본인 정보 확인</li>
            <li><strong>수정</strong>: <Link href="/me/profile" className="text-bronze underline-offset-4 hover:underline">/me/profile</Link>에서 서버/문파/닉네임/직업 수정(게임 UID 제외)</li>
            <li><strong>삭제</strong>: <Link href="/me/delete-account" className="text-bronze underline-offset-4 hover:underline">/me/delete-account</Link>에서 탈퇴(30일 cooldown 후 영구 삭제)</li>
            <li><strong>처리 정지</strong>: <Link href={`mailto:${SUPPORT_EMAIL}`} className="text-bronze underline-offset-4 hover:underline">{SUPPORT_EMAIL}</Link>으로 처리 정지 요청</li>
            <li><strong>동의 철회</strong>: 광고/통계 동의는 회원가입 시 거절하거나 추후 프로필에서 변경 가능</li>
          </ul>
        </Section>

        <Section id="article-7" title="제7조 (개인정보의 파기)">
          <p>
            보유 기간이 경과한 개인정보는 지체 없이 파기합니다.
            전자적 파일은 복구 불가능한 방식(다중 덮어쓰기 또는 cryptographic shredding)으로 삭제하며,
            물리적 매체는 분쇄 또는 소각합니다.
          </p>
        </Section>

        <Section id="article-8" title="제8조 (쿠키 사용)">
          <p>본 사이트는 다음의 쿠키를 사용합니다:</p>
          <Table>
            <Thead>
              <Tr>
                <Th>쿠키</Th>
                <Th>목적</Th>
                <Th>보관 기간</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>authjs.session-token</Td>
                <Td>로그인 세션 유지(NextAuth.js)</Td>
                <Td>30일</Td>
              </Tr>
              <Tr>
                <Td>authjs.csrf-token</Td>
                <Td>CSRF 공격 방어</Td>
                <Td>세션</Td>
              </Tr>
              <Tr>
                <Td>recently-viewed</Td>
                <Td>최근 본 항목 표시(localStorage)</Td>
                <Td>30일 또는 사용자가 삭제 시까지</Td>
              </Tr>
              <Tr>
                <Td>_ga, _ga_*</Td>
                <Td>Google Analytics(동의 시)</Td>
                <Td>2년</Td>
              </Tr>
            </Tbody>
          </Table>
          <p>
            쿠키 거부는 브라우저 설정에서 가능하지만, 로그인이 필요한 기능(/me, 댓글, 채팅 등)은 사용할 수 없습니다.
          </p>
        </Section>

        <Section id="article-9" title="제9조 (만 14세 미만 아동의 개인정보)">
          <p>
            본 사이트는 만 14세 이상의 자연인에 한하여 회원가입을 허용합니다.
            회원가입 시 PIPA 동의 항목 중 &quot;만 14세 이상입니다&quot; 체크박스 동의가 필수입니다.
            만 14세 미만의 개인정보가 수집된 사실을 확인한 경우 지체 없이 파기합니다.
          </p>
        </Section>

        <Section id="article-10" title="제10조 (개인정보 보호책임자)">
          <p>본 사이트의 개인정보 처리에 관한 책임자 및 문의처는 다음과 같습니다:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>책임자: kkaebizigi 운영자 (1인 프로젝트)</li>
            <li>연락처: <Link href={`mailto:${SUPPORT_EMAIL}`} className="text-bronze underline-offset-4 hover:underline">{SUPPORT_EMAIL}</Link></li>
            <li>응대 시간: 24시간 이내(주말·공휴일 포함)</li>
          </ul>
          <p className="text-xs text-text-mute">
            개인정보 침해에 대한 신고나 상담이 필요한 경우, 개인정보침해신고센터(privacy.go.kr, 국번 없이 118)에 문의하실 수 있습니다.
          </p>
        </Section>

        <Section id="article-11" title="제11조 (방침의 변경)">
          <p>
            본 처리 방침은 법령 또는 서비스의 변경에 따라 갱신될 수 있습니다.
            중대 변경(수집 항목 추가, 제3자 제공 신설 등)은 시행 30일 전 메인 페이지 공지를 통해 안내합니다.
          </p>
        </Section>

        <footer className="border-t border-ink-line pt-6 text-xs text-text-mute">
          <p>최종 갱신: {LAST_UPDATED}</p>
          <p>
            관련 문서: <Link href="/terms" className="text-bronze underline-offset-4 hover:underline">이용약관</Link>
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

function Table({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-ink-line">
      <table className="w-full text-xs sm:text-sm">{children}</table>
    </div>
  );
}

function Thead({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <thead className="bg-ink-elev/60">{children}</thead>;
}

function Tbody({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <tbody className="divide-y divide-ink-line">{children}</tbody>;
}

function Tr({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <tr>{children}</tr>;
}

function Th({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <th className="px-3 py-2 text-left font-semibold text-text">{children}</th>
  );
}

function Td({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <td className="px-3 py-2 align-top">{children}</td>;
}
