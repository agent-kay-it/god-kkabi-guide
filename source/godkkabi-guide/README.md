# 갓깨비 키우기 — 999뽑기 증정 공략 가이드

> 동양 오컬트 판타지 방치형 RPG **갓깨비 키우기-999뽑기 증정**의 종합 공략 문서입니다.
> 직업·진령·스킬·과금·이벤트까지 한 페이지에서 확인할 수 있도록 정리했습니다.

🔗 **Live URL**: _배포 후 자동 업데이트_
📅 **작성일**: 2026년 5월 14일
🎮 **대상 게임**: [갓깨비 키우기 - Google Play](https://play.google.com/store/apps/details?id=com.zzsjkr.google)
🏢 **개발사**: Joy Nice Games (Juxin Network)

---

## 📚 다루는 내용

| 섹션 | 핵심 내용 |
|---|---|
| ① 게임 개요 | 기본 정보, 5대 핵심 시스템, 진행 흐름 |
| ② 직업별 전략 | 전사·검객·영매 3종 완전 비교 (강점·약점·진령 조합) |
| ③ 진령 티어 | 0~2티어 등급표, 11종 상세 비교, 직업별 추천 조합 TOP 3 |
| ④ 스킬·제련 | 코어/액티브/패시브 스킬, 999뽑기 활용법, 자원 우선순위 |
| ⑤ 던전·PvP | 진령·무한·보스·비경 던전, 결투장 공략 원칙 |
| ⑥ 과금 전략 | 무·소·중과금 단계별 가성비 패키지 우선순위 |
| ⑦ 이벤트·쿠폰 | 6종 이벤트 대응법 + 사용 가능한 쿠폰 코드 10종 |
| ⑧ 실전 팁 | 8가지 핵심 트릭 + 첫 7일 최단기 성장 로드맵 |

---

## 🎨 디자인 특징

- **다크 게이밍 테마**: 흑·자주색 배경에 골드/네온 액센트
- **모바일 반응형**: 600px 이하 자동 1열 그리드, 폰트·여백 최적화
- **인터랙티브 요소**:
  - 쿠폰 클릭 → 클립보드 자동 복사
  - 부드러운 스크롤 + 맨 위로 가기 버튼
- **공식 자료 활용**: Google Play 앱 아이콘 + 스크린샷 6장 CDN 직접 링크

---

## 🛠️ 기술 스택

- **단일 HTML 파일** (Vanilla HTML/CSS/JS)
- **외부 빌드 도구 없음** — 파일 하나로 완결
- **외부 라이브러리 의존성 없음**
- **이미지**: Google Play 및 BlueStacks 공식 CDN 직접 참조 (재배포 불필요)
- **호스팅**: Vercel (정적 사이트 호스팅)

---

## 📂 프로젝트 구조

```
godkkaebi-guide/
├── index.html         # 공략 본문
├── README.md          # 이 문서
├── .gitignore         # Git 제외 패턴
├── vercel.json        # Vercel 정적 사이트 설정
└── images/            # 자체 호스팅 이미지 (현재 비어있음)
```

---

## 🚀 로컬에서 실행하기

별도 빌드 없이 브라우저에서 바로 열 수 있습니다.

```bash
# 방법 1: 파일 더블클릭
open index.html

# 방법 2: 간단한 로컬 서버 (Python)
python3 -m http.server 8080
# → http://localhost:8080

# 방법 3: Node.js
npx serve .
```

---

## 🔄 업데이트 방법

GitHub과 Vercel이 연동된 경우, 파일 수정 후 push만 하면 자동 재배포됩니다.

```bash
# 공략 수정 후
git add .
git commit -m "update: 진령 티어 갱신"
git push
# → Vercel이 자동으로 30초 안에 재배포
```

수동 배포가 필요한 경우:

```bash
vercel --prod
```

---

## 📌 가이드 활용 시 주의사항

본 문서는 **2026년 5월 14일 기준** 정보이며, 실제 게임은 패치/업데이트로 변경될 수 있습니다.

- ✅ 메타·티어는 신규 진령 출시 또는 밸런스 패치 시 변경됨
- ✅ 쿠폰 코드는 만료될 수 있음 — 공식 채널에서 최신 코드 확인 권장
- ✅ 이벤트 일정·보상은 시즌별로 달라짐
- ⚠️ 직업 변경은 **게임 내에서 가능** (스킬 메뉴 → 직업변경, ₩16,000 또는 운명여신 조화석 1개 필요)

**최신 정보 확인 채널**:
- 게임 내 공지사항
- 공식 카카오톡 채널 / 디스코드
- 네이버 공식 카페
- 디시인사이드 갓깨비키우기 마이너 갤러리

---

## 📖 참고 자료

본 가이드는 다음 자료를 종합·재해석하여 작성되었습니다.

- [BlueStacks — 직업 선택 및 성장 전략 가이드](https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-job-strategy-guide-ko.html)
- [BlueStacks — 진령 티어 등급표](https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-tier-list-ko.html)
- [BlueStacks — 진령·스킬·제련 시스템 가이드](https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-core-system-guide-ko.html)
- [BlueStacks — 숨겨진 팁 & 실전 트릭](https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-tips-tricks-ko.html)
- [BlueStacks — 초보자를 위한 가이드](https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-beginners-guide-ko.html)
- [BlueStacks — 쿠폰 코드 모음](https://www.bluestacks.com/ko/blog/redeem-codes/raising-a-goblin-redeem-code-ko.html)
- [LD플레이어 — 진령 추천 및 조합 가이드](https://kr.ldplayer.net/blog/endless-journey-godkkaebi-beginner-guide.html)
- [디시인사이드 — 갓깨비키우기 마이너 갤러리](https://m.dcinside.com/board/up999/58)

---

## 📜 라이선스 / 면책 조항

- 본 문서는 **비공식 팬 메이드 가이드**이며, Joy Nice Games 또는 Juxin Network와 공식 제휴 관계가 없습니다.
- 게임 내 이미지·로고는 해당 권리자에게 귀속됩니다.
- 본 문서의 분석·전략·정보는 작성자의 개인적 견해이며, 정확성을 보장하지 않습니다.
- 비상업적 용도로 자유롭게 공유·인용 가능합니다.

---

## 🤝 기여

오류 발견이나 새로운 공략 정보가 있다면 PR 또는 Issue로 알려주세요.

특히 다음 정보를 환영합니다:
- 신규 진령 추가/밸런스 변경 정보
- 새 이벤트 공략
- 최신 쿠폰 코드
- 신규 콘텐츠 (비경, 던전 등) 공략

---

_즐거운 도깨비 키우기 되세요! 🐉_
