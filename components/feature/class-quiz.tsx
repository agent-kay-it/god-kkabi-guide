/**
 * <ClassQuiz> — 갓깨비 직업 진단 인터랙티브 퀴즈 (7문항).
 * 출처: docs/sprint/02-sprint-mvp/design.md §2.2 class-quiz
 *
 * Client Component:
 *  - 7문항 × 4선택지 객관식
 *  - 각 선택지 → warrior / swordsman / medium 점수 가산
 *  - 결과 화면: 최고 점수 직업 + ClassCard 요약 + 메타 빌드 링크
 *  - 완료 시 logEvent('class_diagnose_complete', { result_class, answer_count })
 *
 * 상태 구조:
 *  - currentQ: 현재 문항 인덱스
 *  - scores: Record<ClassId, number>
 *  - phase: 'quiz' | 'result'
 */
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { logEvent } from '@/lib/firebase/analytics';
import type { ClassId } from '@/types';

// ─────────────────────────────────────────────────────────────────
// 문항 데이터 (운영자 8주 플레이 데이터 기반 설계)
// ─────────────────────────────────────────────────────────────────

interface QuizChoice {
  label: string;
  scores: Partial<Record<ClassId, number>>;
}

interface QuizQuestion {
  id: number;
  question: string;
  choices: [QuizChoice, QuizChoice, QuizChoice, QuizChoice];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '게임을 시작했을 때 가장 하고 싶은 것은?',
    choices: [
      { label: '강하게 버텨서 후반을 지배하고 싶다', scores: { warrior: 3, swordsman: 1 } },
      { label: '화려한 콤보로 적을 끊임없이 처치하고 싶다', scores: { swordsman: 3, warrior: 1 } },
      { label: '마법으로 여러 적을 한 번에 쓸어버리고 싶다', scores: { medium: 3 } },
      { label: '빠르게 스테이지를 밀어나가고 싶다', scores: { medium: 2, swordsman: 1 } },
    ],
  },
  {
    id: 2,
    question: 'PvP 결투장에서 선호하는 전략은?',
    choices: [
      { label: '맞으면서도 버티다가 반격하는 스타일', scores: { warrior: 3 } },
      { label: '치명타 한 방으로 적을 녹이는 폭딜', scores: { swordsman: 3, warrior: 1 } },
      { label: '광역으로 압도해서 빠르게 끝내기', scores: { medium: 3 } },
      { label: '결투장보다 PvE 콘텐츠가 더 즐겁다', scores: { warrior: 1, medium: 1, swordsman: 1 } },
    ],
  },
  {
    id: 3,
    question: '자동 사냥 중 가장 마음에 드는 상황은?',
    choices: [
      { label: '몬스터가 아무리 때려도 죽지 않을 때', scores: { warrior: 3 } },
      { label: '치명타 터질 때 화면이 번쩍이는 연출', scores: { swordsman: 3 } },
      { label: '광역 마법으로 화면이 가득 찰 때', scores: { medium: 3 } },
      { label: '장시간 자리를 비워도 보상이 쌓여 있을 때', scores: { warrior: 2, swordsman: 1 } },
    ],
  },
  {
    id: 4,
    question: '과금 성향은 어느 쪽에 가깝나요?',
    choices: [
      { label: '완전 무과금 — 자원 관리로 승부', scores: { warrior: 2, swordsman: 1 } },
      { label: '소과금 — 월정액 정도는 괜찮다', scores: { swordsman: 2, warrior: 1 } },
      { label: '중과금 — 좋은 진령이 있으면 뽑는다', scores: { medium: 2, swordsman: 1 } },
      { label: '과금 계획이 없어 최대한 효율을 따진다', scores: { warrior: 2, medium: 1 } },
    ],
  },
  {
    id: 5,
    question: '보스전에서 나의 역할은?',
    choices: [
      { label: '딜 받아가면서 어그로를 끌어 파티 보호', scores: { warrior: 3 } },
      { label: '치명타 집중 딜로 보스 HP를 순식간에 삭제', scores: { swordsman: 3 } },
      { label: '광역 기술로 보스 주변 잡몹까지 처리', scores: { medium: 3 } },
      { label: '상황 보며 필요한 역할로 유연하게 대응', scores: { swordsman: 2, warrior: 1 } },
    ],
  },
  {
    id: 6,
    question: '선호하는 스킬 연출은?',
    choices: [
      { label: '묵직한 타격감, 진동과 땅울림', scores: { warrior: 3 } },
      { label: '검기와 칼날이 번쩍이는 빠른 슬래시', scores: { swordsman: 3 } },
      { label: '불꽃·번개·마법진이 폭발하는 화려함', scores: { medium: 3 } },
      { label: '연출보다는 실전 효율이 중요하다', scores: { swordsman: 2, warrior: 1 } },
    ],
  },
  {
    id: 7,
    question: '진령 수집에서 우선순위는?',
    choices: [
      { label: '탱킹·생존 진령 (치우, 항아 등)', scores: { warrior: 3 } },
      { label: '치명타 강화 진령 (음영귀, 서해용왕)', scores: { swordsman: 3 } },
      { label: '광역·버프 진령 (구미요호, 태양여신)', scores: { medium: 3 } },
      { label: '범용 딜러 진령 (홍길동, 명왕)', scores: { warrior: 1, swordsman: 2, medium: 1 } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// 결과 직업 데이터
// ─────────────────────────────────────────────────────────────────

interface ClassResult {
  id: ClassId;
  emoji: string;
  name: string;
  tag: string;
  summary: string;
  strengths: string[];
  recommendedJinryeong: string[];
  buildLinkHref?: string;
  buildLinkLabel?: string;
}

const CLASS_RESULTS: Record<ClassId, ClassResult> = {
  warrior: {
    id: 'warrior',
    emoji: '⚔️',
    name: '전사 (도깨비)',
    tag: '탱딜 · 근접 물리',
    summary:
      '빠른 공격과 높은 생존력으로 자동 사냥 효율이 최상입니다. 조작 부담이 적고 직관적이라 초보자도 쉽게 적응합니다. 전투 몰입감을 중시하는 플레이어에게 적합합니다.',
    strengths: [
      '자동 전투 중 사망 위험이 가장 낮음',
      '탱+딜을 겸해 PvP에서 버티기 전략 가능',
      '장시간 자리비움 사냥에 최적화',
      '초보도 쉽게 다룰 수 있는 직관적 조작',
    ],
    recommendedJinryeong: ['홍길동', '서해용왕', '치우'],
  },
  swordsman: {
    id: 'swordsman',
    emoji: '🗡️',
    name: '검객 (무당)',
    tag: '폭딜 · 하이브리드 메타',
    summary:
      '치명타 기반 순간 폭딜과 안정적인 생존력을 모두 갖춘 메타 직업입니다. 상위 랭커 채용률 1위. 검기 연출이 화려해 플레이 만족감이 높습니다.',
    strengths: [
      '치명타 한 방 폭딜로 보스 HP 순식간에 삭제',
      '딜·생존 균형 — 모든 PvE 콘텐츠 범용',
      '결투장 메타 상위권 직업',
      '스킬 연출이 가장 화려한 직업군',
    ],
    recommendedJinryeong: ['음영귀', '강림도', '백림명'],
    buildLinkHref: '/builds/meta-swordsman',
    buildLinkLabel: '검객 메타 빌드 보기',
  },
  medium: {
    id: 'medium',
    emoji: '🔮',
    name: '영매 (저승사자)',
    tag: '유틸 · 원거리 광역',
    summary:
      '원소 마법을 이용한 광역 딜러. 초반 스테이지 밀기 효율이 가장 뛰어나며, 다수의 적을 한 번에 처리하는 쾌감이 압도적입니다. 화려한 마법 연출을 선호하는 플레이어에게 최적.',
    strengths: [
      '광역기 최상 — 초반 스테이지 진도 가장 빠름',
      '원거리 안전 거리로 생존 시간 확보',
      '진령·스킬 조합 폭이 넓어 후반 잠재력 우수',
      '시각적으로 가장 화려한 마법 연출',
    ],
    recommendedJinryeong: ['서해용왕', '구미요호', '항아'],
  },
};

// ─────────────────────────────────────────────────────────────────
// 점수 집계 → 결과 직업 결정
// ─────────────────────────────────────────────────────────────────

function determineResult(scores: Record<ClassId, number>): ClassId {
  let maxScore = -1;
  let result: ClassId = 'swordsman';
  (Object.keys(scores) as ClassId[]).forEach((cls) => {
    if (scores[cls] > maxScore) {
      maxScore = scores[cls];
      result = cls;
    }
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────────

type Phase = 'quiz' | 'result';

const INITIAL_SCORES: Record<ClassId, number> = { warrior: 0, swordsman: 0, medium: 0 };

export function ClassQuiz(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [scores, setScores] = useState<Record<ClassId, number>>({ ...INITIAL_SCORES });
  const [resultClass, setResultClass] = useState<ClassId>('swordsman');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const totalQuestions = QUESTIONS.length;
  const question = QUESTIONS[currentQ];

  const handleChoice = useCallback(
    (choiceIdx: number) => {
      if (selectedIdx !== null) return; // 이미 선택됨
      setSelectedIdx(choiceIdx);

      const choice = QUESTIONS[currentQ]?.choices[choiceIdx];
      if (!choice) return;

      const newScores = { ...scores };
      (Object.entries(choice.scores) as [ClassId, number][]).forEach(([cls, pts]) => {
        newScores[cls] = (newScores[cls] ?? 0) + pts;
      });
      setScores(newScores);

      // 0.5초 후 다음 문항으로
      window.setTimeout(() => {
        setSelectedIdx(null);
        if (currentQ + 1 < totalQuestions) {
          setCurrentQ((q) => q + 1);
        } else {
          const result = determineResult(newScores);
          setResultClass(result);
          setPhase('result');
          void logEvent('class_diagnose_complete', {
            result_class: result,
            answer_count: totalQuestions,
          });
        }
      }, 500);
    },
    [currentQ, scores, selectedIdx, totalQuestions],
  );

  const handleReset = useCallback(() => {
    setPhase('quiz');
    setCurrentQ(0);
    setScores({ ...INITIAL_SCORES });
    setSelectedIdx(null);
  }, []);

  if (phase === 'result') {
    const result = CLASS_RESULTS[resultClass];
    return (
      <ResultScreen result={result} onReset={handleReset} scores={scores} />
    );
  }

  if (!question) return <div />;

  const progressPct = ((currentQ / totalQuestions) * 100).toFixed(0);

  return (
    <section
      aria-label={`직업 진단 문항 ${currentQ + 1}/${totalQuestions}`}
      className="space-y-6"
    >
      {/* 진행 표시 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>진단 진행 중</span>
          <span>
            {currentQ + 1} / {totalQuestions}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentQ + 1}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
          aria-label="진단 진행률"
          className="h-1.5 w-full overflow-hidden rounded-full bg-bg-secondary"
        >
          <div
            className="h-full rounded-full bg-accent-gold transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 문항 */}
      <div className="rounded-card border border-border-gold bg-bg-card p-5 sm:p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-gold">
          Q{question.id}
        </p>
        <h2 className="mb-5 text-lg font-bold leading-snug text-text-primary sm:text-xl">
          {question.question}
        </h2>

        <ul className="space-y-3" role="list">
          {question.choices.map((choice, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => handleChoice(idx)}
                  disabled={selectedIdx !== null}
                  aria-pressed={isSelected}
                  aria-label={`선택지 ${String.fromCharCode(65 + idx)}: ${choice.label}`}
                  className={[
                    'w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-accent-gold bg-accent-gold/15 text-accent-gold'
                      : 'border-border-soft bg-bg-secondary text-text-primary hover:border-accent-gold/50 hover:bg-bg-card-hover',
                    selectedIdx !== null && !isSelected
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className="mr-2 inline-block w-5 text-center text-text-muted"
                  >
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {choice.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 결과 화면
// ─────────────────────────────────────────────────────────────────

interface ResultScreenProps {
  result: ClassResult;
  scores: Record<ClassId, number>;
  onReset: () => void;
}

function ResultScreen({ result, scores, onReset }: ResultScreenProps): React.JSX.Element {
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <section aria-label="직업 진단 결과" className="space-y-6">
      <div className="rounded-card border border-accent-gold bg-bg-card p-5 sm:p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-gold">
          진단 결과
        </p>
        <div className="mb-4 flex items-center gap-3">
          <span className="text-5xl" aria-hidden="true">
            {result.emoji}
          </span>
          <div>
            <h2 className="text-2xl font-black text-accent-gold">{result.name}</h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {result.tag}
            </span>
          </div>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-text-secondary">{result.summary}</p>

        {/* 핵심 강점 */}
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-text-secondary">핵심 강점</h3>
          <ul className="space-y-1.5">
            {result.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-text-primary">
                <span
                  aria-hidden="true"
                  className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gold"
                />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* 추천 진령 */}
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-text-secondary">추천 진령 조합</h3>
          <ul className="flex flex-wrap gap-2">
            {result.recommendedJinryeong.map((j) => (
              <li
                key={j}
                className="rounded-pill bg-bg-secondary px-3 py-1 text-xs font-semibold text-text-primary"
              >
                {j}
              </li>
            ))}
          </ul>
        </div>

        {/* 점수 분포 */}
        <div className="mb-5 rounded-lg bg-bg-secondary p-3">
          <h3 className="mb-2 text-xs font-semibold text-text-muted">점수 분포</h3>
          <div className="space-y-1.5">
            {(
              [
                { id: 'warrior' as ClassId, label: '전사', emoji: '⚔️' },
                { id: 'swordsman' as ClassId, label: '검객', emoji: '🗡️' },
                { id: 'medium' as ClassId, label: '영매', emoji: '🔮' },
              ] as const
            ).map(({ id, label, emoji }) => {
              const pct = totalScore > 0 ? Math.round((scores[id] / totalScore) * 100) : 0;
              return (
                <div key={id} className="flex items-center gap-2 text-xs">
                  <span aria-hidden="true" className="w-4 text-center">
                    {emoji}
                  </span>
                  <span className="w-10 text-text-secondary">{label}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-bg-card">
                    <div
                      className={[
                        'h-1.5 rounded-full',
                        id === result.id ? 'bg-accent-gold' : 'bg-border-soft',
                      ].join(' ')}
                      style={{ width: `${pct}%` }}
                      role="meter"
                      aria-label={`${label} 점수 ${pct}%`}
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span className="w-7 text-right text-text-muted">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {result.buildLinkHref ? (
            <Link
              href={result.buildLinkHref}
              className="flex-1 rounded-lg bg-accent-gold px-4 py-3 text-center text-sm font-bold text-bg-primary transition-card hover:bg-accent-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2"
              aria-label={result.buildLinkLabel}
            >
              {result.buildLinkLabel ?? '메타 빌드 보기'}
            </Link>
          ) : null}
          <Link
            href="/jinryeong"
            className="flex-1 rounded-lg border border-border-gold px-4 py-3 text-center text-sm font-semibold text-accent-gold transition-card hover:bg-bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2"
          >
            진령 티어 확인하기
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-lg border border-border-soft px-4 py-2.5 text-sm font-medium text-text-muted transition-card hover:border-border-gold hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold focus-visible:ring-offset-2"
        aria-label="직업 진단 다시 하기"
      >
        다시 진단하기
      </button>
    </section>
  );
}
