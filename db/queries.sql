-- name: summary
SELECT COUNT(*) AS total, SUM(no_show) AS noshow,
       ROUND(100.0*SUM(no_show)/COUNT(*),2) AS rate,
       ROUND(AVG(age),1) AS avg_age, ROUND(AVG(lead_days),1) AS avg_lead
FROM appointments;

-- name: by_age
SELECT age_group AS label, COUNT(*) AS total,
       ROUND(100.0*SUM(no_show)/COUNT(*),2) AS rate
FROM appointments GROUP BY age_group ORDER BY MIN(age);

-- name: by_lead
SELECT lead_bucket AS label, COUNT(*) AS total,
       ROUND(100.0*SUM(no_show)/COUNT(*),2) AS rate
FROM appointments GROUP BY lead_bucket ORDER BY MIN(lead_days);

-- name: by_weekday
SELECT weekday AS label, COUNT(*) AS total,
       ROUND(100.0*SUM(no_show)/COUNT(*),2) AS rate
FROM appointments GROUP BY weekday ORDER BY weekday;

-- name: by_gender
SELECT gender AS label, COUNT(*) AS total,
       ROUND(100.0*SUM(no_show)/COUNT(*),2) AS rate
FROM appointments GROUP BY gender;

-- name: sms_by_lead
SELECT lead_bucket AS label, sms_received AS sms, COUNT(*) AS total,
       ROUND(100.0*SUM(no_show)/COUNT(*),2) AS rate
FROM appointments
WHERE lead_days > 0
GROUP BY lead_bucket, sms_received ORDER BY MIN(lead_days), sms_received;

-- name: by_neighbourhood
SELECT neighbourhood AS label, COUNT(*) AS total,
       ROUND(100.0*SUM(no_show)/COUNT(*),2) AS rate
FROM appointments GROUP BY neighbourhood
HAVING COUNT(*) >= 300
ORDER BY rate DESC LIMIT 12;
