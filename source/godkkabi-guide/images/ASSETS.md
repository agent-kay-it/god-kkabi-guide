# 이미지 자산 인벤토리

이 폴더의 모든 이미지는 코드베이스 자산으로 관리됩니다.
원본 PNG는 `raw/` 하위에 보관, 최종 사용본은 WebP로 변환합니다.

## 파일명 규칙

영문 케밥-슬러그(`kebab-case`), 의미 단위 prefix.

---

## A. 게임 마케팅 배너 (Google Play 등재)

| 파일명 | 내용 | 사용 섹션 | 비고 |
|---|---|---|---|
| `app-icon.webp` | 갓깨비 키우기 공식 앱 아이콘 (도깨비 + 마법 구슬) | favicon · topbar · hero | 정사각형, 512×512 권장 |
| `banner-fantasy-explore.webp` | "동양 판타지 탐험" · 백호 + 캐릭터 풍경 | Overview "동양 설화를 입은 방치형 RPG" | 가로 배너 |
| `banner-coop-battle.webp` | "협력 전투" · 여러 직업 동료 집합 | Dungeon (협동 콘텐츠) | 가로 배너 |
| `banner-demon-king.webp` | "만인지상" · 주인공이 대마왕이 되는 컷 | Class 섹션 헤더 또는 Hero | 가로 배너 |
| `banner-infinite-gear.webp` | "무한 장비" · 장비 제련 화면 | Systems "제련 시스템" | 가로 배너 |
| `banner-baekgwi.webp` | "백귀야행" · 보스 군세 모드 | Dungeon "보스 던전" | 가로 배너 |
| `banner-korean-carry.webp` | "출시하자마자 한국캐리" · 5직업 라인업 | Hero backdrop 또는 Class 섹션 | 인기 게임 마크업 포함 |

## B. 게임 내 스크린샷 (인게임 캡처)

| 파일명 | 내용 | 사용 섹션 | 비고 |
|---|---|---|---|
| `catalog-jinryeong-ssr.webp` | 도록(catalog) — SSR급 진령 전체 목록 (15+ 캐릭터) | Jinryeong "티어 리스트" | 세로 모바일 캡처, 신/요/인 진영 탭 보임 |
| `jinryeong-detail-yongwang.webp` | 진령 상세 화면 — 서해용왕 (Lv45, ★5, 치명타 회심 버프) | Jinryeong "진령 예시" | 세로 캡처 |
| `skills-list-swordsman.webp` | 스킬목록 — 검객 (운소검경, 진살검진 등) | Advanced "직업별 추천 스킬" | 세로 캡처, 실제 스킬명 정확 확인 가능 |

## C. Google Play 등재 스크린샷 (CDN 원본 → 로컬화)

| 파일명 | 원본 URL key | 비고 |
|---|---|---|
| `screenshot-01.webp` | `kC_conifhC...` | 인게임 전투 |
| `screenshot-02.webp` | `oVoqGDTsgn...` | 진령 캐릭터 |
| `screenshot-03.webp` | `iH5kazfksx...` | 직업 라인업 |
| `screenshot-04.webp` | `62OPQh7U6m...` | 전투 화면 |
| `screenshot-05.webp` | `I4xcYk7qwm...` | 던전 콘텐츠 |
| `screenshot-06.webp` | `oxcOzuZLAD...` | 던전 모드 |
| `screenshot-07.webp` | `0No9tDBq6L...` | 자동 전투 |
| `screenshot-08.webp` | `vTXHnEaDk6...` | 진령 소환 |
| `screenshot-09.webp` | `FyiQb2mdC3...` | 장비 제련 |

---

## HTML 내 참조 경로

모든 이미지는 `./images/파일명.webp` 형태로 상대 경로 참조.

```html
<link rel="icon" type="image/webp" href="./images/app-icon.webp" />
<img src="./images/banner-fantasy-explore.webp" alt="..." />
```

## 변환 절차 (로컬 Mac 기준)

1. Kay님이 채팅에서 받은 10장의 인라인 이미지를 우클릭 → 다른 이름으로 저장하여
   `./images/raw/` 폴더에 위 A·B 표의 파일명(.png 확장자)으로 저장
2. Google Play 9장은 `prepare-assets.sh` 스크립트가 자동 다운로드
3. 스크립트가 PNG → WebP 변환 (sips 또는 cwebp 사용)
4. 변환된 webp만 `./images/` 루트에 남기고 raw는 보존
