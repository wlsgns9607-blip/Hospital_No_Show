# 🏥 병원 노쇼(No-show) 분석 대시보드

약 11만 건의 병원 예약 데이터(Kaggle Medical Appointment No Shows) 기반 노쇼 원인 분석 웹 대시보드 프로젝트입니다.

## 🚀 실행 방법

```bash
pip install pandas        # 데이터 전처리용
python build_db.py        # medical.csv -> noshow.db (SQLite DB 적재)
python app.py             # http://localhost:8000 실행
```

## 📂 프로젝트 구조

- `db/schema.sql`: 데이터베이스 테이블 정의
- `db/queries.sql`: 데이터 분석 쿼리 (`-- name:` 단위로 `/api/<name>` 엔드포인트 자동 매핑)
- `static/`: 프론트엔드 컴포넌트 (HTML, CSS, Vanilla JS, Chart.js)

---

## 🤖 Claude AI 데이터 분석 인사이트

- **전체 노쇼율:** 전체 노쇼율은 20.2%입니다.
- **선행일수(리드타임) 영향:** 당일 예약은 노쇼율이 4.7%인데, 15~30일 전에 잡은 예약은 32.6%까지 올라가요. 선행일수가 가장 큰 변수입니다.
- **연령대별 특성:** 연령대별로는 13~19세가 26.0%로 가장 높고, 60세 이상이 15.3%로 가장 낮아요.
- **SMS 발송 효과 분석:** SMS를 받은 환자의 노쇼율이 전체로 보면 더 높아 보여요. 하지만 선행일수를 맞춰 비교하면 SMS 발송군이 오히려 낮아서, 겉보기 결과는 발송이 긴 선행 예약에 몰린 영향으로 보입니다.

- **파이썬(Python)**은 데이터 수집과 백엔드(DB/SQL) 영역에 사용하고,
- **HTML/CSS/JavaScript(JS)**는 사용자가 눈으로 보는 화면과 시각화를 담당하는 **프론트엔드** 영역에 사용하며,
- **바이브 코딩(Vibe Coding)**과 **API(JSON) 규격**을 활용하여 각각의 기술을 연결하고 **프로덕션 레벨의 서비스**로 구현한다.

### 기술별 역할

- **SQL**
  - 데이터베이스 관리
  - 모델 학습용 데이터셋 관리
  - 사용자 및 서비스 데이터 저장·조회

- **Python**
  - 데이터 수집 및 전처리
  - 백엔드 로직 구현
  - AI/머신러닝 모델 연동
  - **FastAPI** 등을 활용한 경량 예측 API 구축

- **HTML / CSS / JavaScript**
  - 사용자가 직접 보는 웹 화면 구현
  - 쇼핑몰, 대시보드 등의 UI 구성
  - 데이터 시각화 및 사용자 인터랙션 구현

- **JSON / API**
  - 프론트엔드와 백엔드 간 데이터 전달
  - Python 백엔드 ↔ 웹 화면 간 통신
  - 실시간 데이터 조회 및 서비스 기능 연동

### 전체 구조

```text
[사용자]
   ↓
HTML / CSS / JavaScript
   ↓
JSON / API
   ↓
Python / FastAPI
   ↓
SQL / Database
   ↓
데이터 수집 · 분석 · AI 모델
