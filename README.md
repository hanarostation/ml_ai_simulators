# Machine Learning & AI 모형 시뮬레이터

머신러닝 · 신경망 · 컴퓨터 비전 · 자연어처리 모형을 브라우저에서 직접 조작하며 배우는 시뮬레이터 모음입니다.
빌드 과정이 없는 정적 사이트라 GitHub Pages에 그대로 올리면 됩니다.

## 폴더 구조

```
index.html                      메인 페이지 (분류 탭 4개 → 시뮬레이터 카드)
image/logo1.png                 머리글 로고 · 밝은 화면용 (직접 넣기)
image/logo2.png                 머리글 로고 · 어두운 화면용 (없으면 logo1 사용, 둘 다 없으면 "DATA STATION" 글자)
assets/
  css/site.css                  공통 색·글꼴·머리글·푸터 스타일
  js/site.js                    공통 동작 (밝게/어둡게 전환, 로고 대체)
  js/catalog.js                 시뮬레이터 목록 ← 새 시뮬레이터는 여기에 등록
  vendor/tf.min.js              TensorFlow.js 4.22.0 (시뮬레이터 여러 개가 함께 사용)
simulators/
  ml/                           머신러닝
  nn/                           신경망
  cv/                           컴퓨터 비전
  nlp/                          자연어처리
    lda-gibbs-sampling.html     LDA 깁스 샘플링
    seq2seq-attention.html      Seq2Seq · Attention
    transformer.html            트랜스포머
templates/
  simulator-template.html       새 시뮬레이터용 기본 틀
```

## 새 시뮬레이터 추가

1. `templates/simulator-template.html`을 `simulators/<분류>/<파일명>.html`로 복사합니다.
   (분류 폴더 안에 두어야 `../../` 경로가 맞습니다.)
2. `<title>`, 머리글의 현재 분류(`aria-current="page"`), 위치 표시(홈 › 분류), 제목, 설명을 바꾸고 `.wrap` 안에 시뮬레이터를 작성합니다.
3. `assets/js/catalog.js`의 `DS_SIMULATORS`에 항목을 추가하면 메인 페이지 해당 탭에 카드가 생깁니다.

```js
{
  id: "linear-regression",
  category: "ml",                                  // ml | nn | cv | nlp
  href: "simulators/ml/linear-regression.html",
  title: "선형 회귀 경사하강법",
  summary: "카드에 보일 한두 문장 설명",
  tags: ["회귀", "경사하강법"],
  requires: "tfjs"                                 // TensorFlow.js를 쓸 때만
}
```

## 공통 양식

- 모든 페이지는 `assets/css/site.css`를 먼저 불러오고, 시뮬레이터 고유 스타일은 각 파일의 `<style>`에 둡니다.
- 기본 색은 공통 토큰(`--bg --surface --surface-2 --ink --text --muted --faint --line --line-strong --on-ink`)을 씁니다.
  시뮬레이터 고유의 역할 색(인코더/디코더 등)은 각 파일에서 정의하고 어두운 화면용 값도 함께 적습니다.
- 머리글 로고를 누르면 메인으로, 분류 링크를 누르면 메인의 해당 탭으로 이동합니다.
- 모든 페이지 맨 아래에 **데이터스테이션 바로가기** 버튼이 있습니다 (https://www.data-station.co.kr/index).
- 오른쪽 위 버튼으로 밝은/어두운 화면을 바꿀 수 있고, 선택은 브라우저에 저장됩니다. (강의실 프로젝터에서는 밝은 화면 권장)

## GitHub Pages 배포

```bash
git init
git add .
git commit -m "ML & AI 모형 시뮬레이터 사이트"
git branch -M main
git remote add origin https://github.com/<계정>/<저장소>.git
git push -u origin main
```

저장소 **Settings → Pages → Build and deployment**에서 Source를 `Deploy from a branch`, Branch를 `main` / `/ (root)`로 지정합니다.

## 로컬에서 보기

파일을 더블클릭해도 열리지만, 경로 문제를 피하려면 간단한 서버로 여는 것을 권장합니다.

```bash
python -m http.server 8000
# → http://localhost:8000
```
