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

// Calculate N-day Moving Average (MA)
function calcMA(data, windowSize = 5) {
  return data.map((val, idx, arr) => {
    if (idx < windowSize - 1) return null;
    const slice = arr.slice(idx - windowSize + 1, idx + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    return Number((sum / windowSize).toFixed(2));
  });
}

function renderStockChart(byDateData) {
  const labels = byDateData.map(r => r.label);
  const rates = byDateData.map(r => r.rate);
  const totals = byDateData.map(r => r.total);
  const ma5 = calcMA(rates, 5);

  const ctx = document.getElementById('cStock');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'line',
          label: '\uB610\uC1FC\uC728(%)',
          data: rates,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb',
          pointHoverRadius: 7,
          tension: 0.25,
          fill: true,
          yAxisID: 'yRate'
        },
        {
          type: 'line',
          label: '5\uC77C \uC774\uB3D9\uD3C9\uAD60 (MA5)',
          data: ma5,
          borderColor: '#f59e0b',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0.3,
          fill: false,
          yAxisID: 'yRate'
        },
        {
          type: 'bar',
          label: '\uC608\uC57D \uAC70\uB798\uB7C9(\uAC74)',
          data: totals,
          backgroundColor: 'rgba(148, 163, 184, 0.35)',
          hoverBackgroundColor: 'rgba(148, 163, 184, 0.65)',
          borderRadius: 4,
          barPercentage: 0.6,
          yAxisID: 'yVolume'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: c => '\uC77C\uC790: ' + c[0].label,
            label: c => {
              if (c.dataset.label.includes('MA5')) {
                return '5일 이동평균 노쇼율: ' + c.raw + '%';
              }
              if (c.dataset.yAxisID === 'yRate') {
                return '당일 노쇼율: ' + c.raw + '%';
              }
              return '당일 총 예약 거래량: ' + c.raw.toLocaleString() + '건';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#010736', font: { size: 12, weight: 'bold' } }
        },
        yRate: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: '노쇼율 (%)', color: '#2563eb', font: { size: 13, weight: 'bold' } },
          ticks: { ...pct, color: '#2563eb', font: { size: 13, weight: 'bold' } },
          grid: { color: 'rgba(226, 232, 240, 0.8)' }
        },
        yVolume: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: '예약 거래량 (건)', color: '#64748b', font: { size: 13, weight: 'bold' } },
          ticks: { color: '#64748b', font: { size: 12 } },
          grid: { display: false }
        }
      }
    }
  });
}

(async () => {
  const [s, lead, age, day, gen, sms, nb, byDate] = await Promise.all(
    ['summary','by_lead','by_age','by_weekday','by_gender','sms_by_lead','by_neighbourhood','by_date'].map(get));

  document.getElementById('kpis').innerHTML = [
    ['\uC804\uCCB4 \uC608\uC57D', s.total.toLocaleString() + '\uAC74'],
    ['\uB610\uC1FC \uAC74\uC218', s.noshow.toLocaleString() + '\uAC74'],
    ['\uB610\uC1FC\uC728', s.rate + '%'],
    ['\uD6C6\uADE0 \uC5F0\uB839', s.avg_age + '\uC138'],
    ['\uD6C6\uADE0 \uC120\uD589\uC77C\uC218', s.avg_lead + '\uC77C'],
  ].map(([k, v]) => '<div class="kpi"><span>' + k + '</span><b>' + v + '</b></div>').join('');

  // Render Stock Style Chart
  if (byDate) {
    renderStockChart(byDate);
  }

  bar('cLead', lead.map(r => r.label), lead.map(r => r.rate), C.red, {type: 'line'});
  bar('cAge', age.map(r => r.label), age.map(r => r.rate), C.blue);
  bar('cDay', day.filter(r => r.total > 100).map(r => DAYS[r.label]),
      day.filter(r => r.total > 100).map(r => r.rate), C.teal);
  
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
