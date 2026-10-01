"""medical.csv -> 정제 -> SQLite(noshow.db) 적재"""
import sqlite3, pandas as pd, pathlib

BASE = pathlib.Path(__file__).parent
df = pd.read_csv(BASE / "db/medical.csv")
df = df.rename(columns={"No-show": "no_show", "PatientId": "patient_id",
    "AppointmentID": "appointment_id", "ScheduledDay": "scheduled_day",
    "AppointmentDay": "appointment_day", "Gender": "gender", "Age": "age",
    "Neighbourhood": "neighbourhood", "SMS_received": "sms_received"})

sch = pd.to_datetime(df.scheduled_day).dt.tz_localize(None).dt.normalize()
apt = pd.to_datetime(df.appointment_day).dt.tz_localize(None).dt.normalize()
df["lead_days"] = (apt - sch).dt.days
df["weekday"] = apt.dt.weekday
df["no_show"] = (df.no_show == "Yes").astype(int)
df["patient_id"] = df.patient_id.astype("int64").astype(str)

# 정제: 나이 음수, 예약일 > 진료일(lead<0) 오류 제거
before = len(df)
df = df[(df.age >= 0) & (df.lead_days >= 0)].copy()
print(f"오류 행 제거: {before - len(df)}건")

df["age_group"] = pd.cut(df.age, [-1, 12, 19, 39, 59, 200],
    labels=["0-12세", "13-19세", "20-39세", "40-59세", "60세+"]).astype(str)
df["lead_bucket"] = pd.cut(df.lead_days, [-1, 0, 3, 7, 14, 30, 1000],
    labels=["당일", "1-3일", "4-7일", "8-14일", "15-30일", "30일+"]).astype(str)
df["scheduled_day"] = sch.dt.strftime("%Y-%m-%d")[df.index]
df["appointment_day"] = apt.dt.strftime("%Y-%m-%d")[df.index]

con = sqlite3.connect(BASE / "noshow.db")
con.executescript((BASE / "db/schema.sql").read_text(encoding="utf-8"))
cols = ["appointment_id","patient_id","gender","scheduled_day","appointment_day","age",
        "age_group","neighbourhood","sms_received","lead_days","lead_bucket","weekday","no_show"]
df[cols].to_sql("appointments", con, if_exists="append", index=False)
con.commit(); con.close()
print(f"적재 완료: {len(df):,}건 -> noshow.db")

