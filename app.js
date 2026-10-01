const get = n => fetch('/api/' + n).then(r => r.json());
const C = {blue:'#4f6ef7', red:'#f0556a', gray:'#9aa4b8', teal:'#1fb5a0'};
const DAYS = ['월','화','수','목','금','토','일'];
const style = getComputedStyle(document.documentElement);
Chart.defaults.color = style.getPropertyValue('--sub').trim() || '#667085';
Chart.defaults.font.family = '"Pretendard","Malgun Gothic",sans-serif';
const pct = {callback: v => v + '%'};

function bar(id, labels, data, color, opts = {}) {
  new Chart(id, {type: opts.type || 'bar',
    data: {labels, datasets: [{label: '노쇼율(%)', data, backgroundColor: color,
      borderColor: color, borderRadius: 6, tension: .35, fill: false}]},
    options: {indexAxis: opts.horizontal ? 'y' : 'x', plugins: {legend: {display: false},
      tooltip: {callbacks: {label: c => `${c.parsed[opts.horizontal ? 'x' : 'y']}%`}}},
      scales: {[opts.horizontal ? 'x' : 'y']: {beginAtZero: true, ticks: pct}}}});
}

(async () => {
  const [s, lead, age, day, gen, sms, nb] = await Promise.all(
    ['summary','by_lead','by_age','by_weekday','by_gender','sms_by_lead','by_neighbourhood'].map(get));

  document.getElementById('kpis').innerHTML = [
    ['전체 예약', s.total.toLocaleString() + '건'],
    ['노쇼 건수', s.noshow.toLocaleString() + '건'],
    ['노쇼율', s.rate + '%'],
    ['평균 연령', s.avg_age + '세'],
    ['평균 선행일수', s.avg_lead + '일'],
  ].map(([k, v]) => `<div class="kpi"><span>${k}</span><b>${v}</b></div>`).join('');

  bar('cLead', lead.map(r => r.label), lead.map(r => r.rate), C.red, {type: 'line'});
  bar('cAge', age.map(r => r.label), age.map(r => r.rate), C.blue);
  bar('cDay', day.filter(r => r.total > 100).map(r => DAYS[r.label]),
      day.filter(r => r.total > 100).map(r => r.rate), C.teal);
  bar('cNeigh', nb.map(r => r.label), nb.map(r => r.rate), C.red, {horizontal: true});

  new Chart('cGender', {type: 'doughnut',
    data: {labels: gen.map(r => r.label === 'F' ? '여성' : '남성'),
      datasets: [{data: gen.map(r => r.total), backgroundColor: [C.red, C.blue], borderWidth: 0}]},
    options: {cutout: '62%'}});

  const buckets = [...new Set(sms.map(r => r.label))];
  const pick = f => buckets.map(b => (sms.find(r => r.label === b && r.sms === f) || {}).rate ?? null);
  new Chart('cSms', {type: 'bar',
    data: {labels: buckets, datasets: [
      {label: 'SMS 미발송', data: pick(0), backgroundColor: C.gray, borderRadius: 6},
      {label: 'SMS 발송', data: pick(1), backgroundColor: C.blue, borderRadius: 6}]},
    options: {scales: {y: {beginAtZero: true, ticks: pct}}}});
})();
