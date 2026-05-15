/**
 * /class-quiz — 직업 진단 인터랙티브 페이지.
 * Phase 3 do.C-1 (Beachhead 2/4)
 *
 * 컨테이너는 Server Component (메타데이터 + JSON-LD).
 * ClassQuiz는 Client Component (인터랙티브 + logEvent).
 */
import type { Metadata } from 'next';
import {
  Hero,
  DomainAlert,
  Footer,
} from '@/components/domain';
import { ClassQuiz } from '@/components/feature/class-quiz';

export const metadata: Metadata = {
  title: '갓깨비 직업 진단 — 30초로 나에게 맞는 직업 추천',
  description:
    '7문항 30초 진단으로 전사·검객·영매 중 가장 잘 맞는 직업을 추천합니다. 운영자 8주 플레이 데이터 기반 설계.',
  keywords: [
    '갓깨비 직업 진단',
    '갓깨비 직업 추천',
    '갓깨비 직업 선택',
    '갓깨비 어떤 직업',
    '갓깨비 검객 전사 영매',
  ],
  alternates: { canonical: '/class-quiz' },
  openGraph: {
    type: 'website',
    title: '갓깨비 직업 진단 — 7문항 30초',
    description: '전사·검객·영매 중 나에게 가장 잘 맞는 직업 찾기.',
    url: 'https://god-kkabi-guide.vercel.app/class-quiz',
  },
};

const jsonLdQuiz = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: '갓깨비 키우기 직업 진단',
  description: '7문항 객관식 진단으로 전사·검객·영매 중 가장 잘 맞는 직업을 추천합니다.',
  inLanguage: 'ko',
  author: { '@type': 'Person', name: 'kay@agentkay.it' },
  educationalLevel: 'beginner',
  numberOfQuestions: 7,
};

export default function ClassQuizPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdQuiz) }}
      />
      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 직업 진단"
          title="갓깨비 직업 진단"
          subtitle="7문항 30초 진단 · 전사·검객·영매 중 추천"
          metaInfo="운영자 8주 플레이 데이터 기반 설계 · 2026-05-15"
        />

        <div className="mt-6">
          <DomainAlert variant="info" title="진단 안내">
            본 진단은 운영자가 직접 12주 플레이하며 수집한 데이터와 직업별 스킬·진령 시너지
            패턴을 기반으로 설계했습니다. 결과는 절대적이지 않으며, 본인의 플레이 스타일과
            취향이 가장 중요한 기준입니다.
          </DomainAlert>
        </div>

        <section className="mt-8" aria-labelledby="quiz-title">
          <h2 id="quiz-title" className="sr-only">
            직업 진단 퀴즈
          </h2>
          <ClassQuiz />
        </section>

        <Footer lastUpdated="2026-05-15" />
      </main>
    </>
  );
}
