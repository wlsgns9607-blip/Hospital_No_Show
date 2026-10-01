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
