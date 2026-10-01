DROP TABLE IF EXISTS appointments;
CREATE TABLE appointments (
    appointment_id INTEGER PRIMARY KEY,
    patient_id     TEXT,
    gender         TEXT,
    scheduled_day  TEXT,
    appointment_day TEXT,
    age            INTEGER,
    age_group      TEXT,
    neighbourhood  TEXT,
    sms_received   INTEGER,
    lead_days      INTEGER,
    lead_bucket    TEXT,
    weekday        INTEGER,   -- 0=월 ... 6=일
    no_show        INTEGER    -- 1=노쇼, 0=내원
);
CREATE INDEX idx_age   ON appointments(age_group);
CREATE INDEX idx_lead  ON appointments(lead_bucket);
CREATE INDEX idx_neigh ON appointments(neighbourhood);
