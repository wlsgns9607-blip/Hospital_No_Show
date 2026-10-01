const get = n => fetch('/api/' + n).then(r => r.json());
const C = {blue:'#4f6ef7', red:'#f0556a', gray:'#9aa4b8', teal:'#1fb5a0'};
const DAYS = ['\uC6D4','\uD654','\uC218','\uBAA9','\uAE08','\uD1A0','\uC77C'];
const style = getComputedStyle(document.documentElement);
Chart.defaults.color = style.getPropertyValue('--sub').trim() || '#667085';
Chart.defaults.font.family = 'Pretendard, Malgun Gothic, sans-serif';
const pct = {callback: v => v + '%'};

function bar(id, labels, data, color, opts = {}) {
  const yTicksOption = opts.font18 ? {
    font: { size: 18, weight: 'bold' },
    color: '#010736'
  } : {
    font: { size: 14, weight: 'bold' },
    color: '#010736'
  };

  const xTicksOption = opts.horizontal ? {
    ...pct,
    font: { size: 14, weight: 'bold' },
    color: '#010736'
  } : {
    font: { size: 14, weight: 'bold' },
    color: '#010736'
  };

  new Chart(id, {
    type: opts.type || 'bar',
    data: {
      labels,
      datasets: [{
        label: '\uB610\uC1FC\uC728(%)',
        data,
        backgroundColor: color,
        borderColor: color,
        borderRadius: 6,
        tension: .35,
        fill: false
      }]
    },
    options: {
      indexAxis: opts.horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => '\uB610\uC1FC\uC728: ' + c.parsed[opts.horizontal ? 'x' : 'y'] + '%' } }
      },
      scales: {
        x: { beginAtZero: true, ticks: xTicksOption },
        y: { beginAtZero: true, ticks: yTicksOption }
      }
    }
  });
}

(async () => {
  const [s, lead, age, day, gen, sms, nb] = await Promise.all(
    ['summary','by_lead','by_age','by_weekday','by_gender','sms_by_lead','by_neighbourhood'].map(get));

  document.getElementById('kpis').innerHTML = [
    ['\uC804\uCCB4 \uC608\uC57D', s.total.toLocaleString() + '\uAC74'],
    ['\uB610\uC1FC \uAC74\uC218', s.noshow.toLocaleString() + '\uAC74'],
    ['\uB610\uC1FC\uC728', s.rate + '%'],
    ['\uD6C6\uADE0 \uC5F0\uB839', s.avg_age + '\uC138'],
    ['\uD6C6\uADE0 \uC120\uD589\uC77C\uC218', s.avg_lead + '\uC77C'],
  ].map(([k, v]) => '<div class="kpi"><span>' + k + '</span><b>' + v + '</b></div>').join('');

  bar('cLead', lead.map(r => r.label), lead.map(r => r.rate), C.red, {type: 'line'});
  bar('cAge', age.map(r => r.label), age.map(r => r.rate), C.blue);
  bar('cDay', day.filter(r => r.total > 100).map(r => DAYS[r.label]),
      day.filter(r => r.total > 100).map(r => r.rate), C.teal);
  
  // 원본 영문 지역명 사용 + Y축 텍스트 18px Strong(Bold) 유지
  bar('cNeigh', nb.map(r => r.label), nb.map(r => r.rate), C.red, {horizontal: true, font18: true});

  new Chart('cGender', {type: 'doughnut',
    data: {labels: gen.map(r => r.label === 'F' ? '\uC5EC\uC131' : '\uB2F8\uC131'),
      datasets: [{data: gen.map(r => r.total), backgroundColor: [C.red, C.blue], borderWidth: 0}]},
    options: {cutout: '62%'}});

  const buckets = [...new Set(sms.map(r => r.label))];
  const pick = f => buckets.map(b => (sms.find(r => r.label === b && r.sms === f) || {}).rate ?? null);
  new Chart('cSms', {type: 'bar',
    data: {labels: buckets, datasets: [
      {label: 'SMS \uB9C8\uBC1C\uC1A1', data: pick(0), backgroundColor: C.gray, borderRadius: 6},
      {label: 'SMS \uBC1C\uC1A1', data: pick(1), backgroundColor: C.blue, borderRadius: 6}]},
    options: {scales: {y: {beginAtZero: true, ticks: pct}}}});
})();
