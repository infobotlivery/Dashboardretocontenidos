// ── Storage ──────────────────────────────────────────────────────────────────
const S = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ── Constants ────────────────────────────────────────────────────────────────
const START_DATE       = '2026-04-08';
const DAILY_GOAL       = 7;
const STREAK_THRESHOLD = Math.ceil(DAILY_GOAL * 0.85); // 6

const RANKS = [
  { id: 'sss', label: 'SSS-Rank', title: 'National Level Hunter', min: 2000, color: '#FF3333', next: null },
  { id: 'ss',  label: 'SS-Rank',  title: 'SS-Rank Hunter',        min: 1200, color: '#FF8C00', next: 2000 },
  { id: 's',   label: 'S-Rank',   title: 'S-Rank Hunter',         min: 700,  color: '#FFD700', next: 1200 },
  { id: 'a',   label: 'A-Rank',   title: 'A-Rank Hunter',         min: 350,  color: '#CC44FF', next: 700  },
  { id: 'b',   label: 'B-Rank',   title: 'B-Rank Hunter',         min: 150,  color: '#4488FF', next: 350  },
  { id: 'c',   label: 'C-Rank',   title: 'C-Rank Hunter',         min: 50,   color: '#44BBFF', next: 150  },
  { id: 'd',   label: 'D-Rank',   title: 'D-Rank Hunter',         min: 10,   color: '#44FF88', next: 50   },
  { id: 'e',   label: 'E-Rank',   title: 'E-Rank Hunter',         min: 0,    color: '#888888', next: 10   },
];

const BADGE_DEFS = {
  posts: [
    { id: 'p1',    icon: '👣', name: 'Primer Paso',     check: s => s.totalPosts >= 1 },
    { id: 'p49',   icon: '📅', name: 'Semana Completa', check: s => s.totalPosts >= 49 },
    { id: 'p100',  icon: '💯', name: 'Centenario',      check: s => s.totalPosts >= 100 },
    { id: 'p210',  icon: '🗓️', name: 'Primer Mes',      check: s => s.totalPosts >= 210 },
    { id: 'p500',  icon: '🚀', name: '500 Posts',       check: s => s.totalPosts >= 500 },
    { id: 'p1000', icon: '👑', name: '1,000 Posts',     check: s => s.totalPosts >= 1000 },
  ],
  streak: [
    { id: 's3',  icon: '🔥',  name: '3 Días',          check: s => s.streak >= 3 },
    { id: 's7',  icon: '🔥🔥', name: 'Primera Semana',  check: s => s.streak >= 7 },
    { id: 's14', icon: '⚡',  name: 'Dos Semanas',     check: s => s.streak >= 14 },
    { id: 's30', icon: '🏅',  name: 'Mes Completo',    check: s => s.streak >= 30 },
    { id: 's45', icon: '💎',  name: '45 Días',         check: s => s.streak >= 45 },
    { id: 's60', icon: '🦁',  name: 'Imparable',       check: s => s.streak >= 60 },
    { id: 's75', icon: '🌟',  name: '75 Días',         check: s => s.streak >= 75 },
    { id: 's90', icon: '🤖',  name: 'Máquina',         check: s => s.streak >= 90 },
  ],
  followers: [
    { id: 'f100',  icon: '🌱', name: 'Primeros 100',   check: s => s.totalFollowers >= 100 },
    { id: 'f500',  icon: '🌿', name: '500 Club',        check: s => s.totalFollowers >= 500 },
    { id: 'f1k',   icon: '✨', name: '1K',              check: s => s.totalFollowers >= 1000 },
    { id: 'f2500', icon: '⚡', name: '2.5K',            check: s => s.totalFollowers >= 2500 },
    { id: 'f5k',   icon: '🔥', name: '5K',              check: s => s.totalFollowers >= 5000 },
    { id: 'f10k',  icon: '💫', name: '10K',             check: s => s.totalFollowers >= 10000 },
    { id: 'f25k',  icon: '🏆', name: '25K',             check: s => s.totalFollowers >= 25000 },
    { id: 'f50k',  icon: '👑', name: '50K',             check: s => s.totalFollowers >= 50000 },
    { id: 'f100k', icon: '🎊', name: '100K 🏆',         check: s => s.totalFollowers >= 100000 },
  ],
};

// Protocol tasks by day-of-week (0=Sun … 6=Sat)
const PROTOCOL_DAILY = [
  { id: 'pub',     label: 'Publicar 3 IG + 4 TT desde el buffer', mana: 1 },
  { id: 'stories', label: '3+ Stories (1 con CTA)',                mana: 1 },
  { id: 'dms',     label: 'Responder DMs / comentarios',           mana: 1 },
];
const PROTOCOL_EXTRA = {
  3: [ // Wednesday
    { id: 'medir',   label: '🎯 Medir (30 min) — ¿cuál fue el outlier?',     mana: 1 },
    { id: 'planear', label: '🗂️ Planear (30 min) — ¿qué replico / itero?',   mana: 1 },
    { id: 'grabar5', label: '🎬 Grabar Nivel 5 (2h) — tutoriales → editor',  mana: 1 },
    { id: 'grabar3', label: '🎥 Grabar Nivel 3 (1h) — dinámicos → editor',   mana: 1 },
  ],
  4: [{ id: 'recv4', label: '📥 Recibir 2 videos del editor → buffer', mana: 1 }],
  5: [
    { id: 'recv5',   label: '📥 Recibir 2 videos del editor → buffer',   mana: 1 },
    { id: 'podcast', label: '🎙️ Fake podcast → Opus Clip → editor',       mana: 1 },
    { id: 'talking', label: '🎭 8-10 Talking heads → editar → buffer',    mana: 1 },
  ],
  6: [{ id: 'recv6', label: '📥 Recibir 2 videos del editor → buffer', mana: 1 }],
};

// Total possible mana for each day-of-week
function getDayTaskTotal(dow) {
  const extra = (PROTOCOL_EXTRA[dow] || []).length;
  return PROTOCOL_DAILY.length + extra;
}
function getWeekTotal() {
  let t = 0;
  for (let d = 0; d < 7; d++) t += getDayTaskTotal(d);
  return t; // 30
}

// ── Date helpers ─────────────────────────────────────────────────────────────
function toKey(d) { return d.toISOString().slice(0, 10); }
function today()  { return toKey(new Date()); }
function formatDate(iso) { const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; }
function getWeekKey(iso) {
  const d   = new Date(iso + 'T00:00:00');
  const day = d.getDay(); // 0=Sun
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7)); // Monday of this week
  return toKey(mon);
}
function getWeekDates(monIso) {
  const dates = [];
  const start = new Date(monIso + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    dates.push(toKey(dd));
  }
  return dates;
}

// ── State ─────────────────────────────────────────────────────────────────────
let state = {
  posts:           S.get('posts', {}),
  initialPosts:    S.get('initialPosts', null),
  followers:       S.get('followers', []),
  badges:          S.get('badges', []),
  coins:           S.get('coins', 0),
  totalCoins:      S.get('totalCoins', 0),   // lifetime, for rank
  mana:            S.get('mana', 0),
  rewards:         S.get('rewards', []),
  redeemedHistory: S.get('redeemedHistory', []),
  protocol:        S.get('protocol', {}),    // { "2026-04-26": ["pub","stories",...] }
};

function save() {
  S.set('posts',           state.posts);
  S.set('initialPosts',    state.initialPosts);
  S.set('followers',       state.followers);
  S.set('badges',          state.badges);
  S.set('coins',           state.coins);
  S.set('totalCoins',      state.totalCoins);
  S.set('mana',            state.mana);
  S.set('rewards',         state.rewards);
  S.set('redeemedHistory', state.redeemedHistory);
  S.set('protocol',        state.protocol);
}

// ── Computed ──────────────────────────────────────────────────────────────────
function getTodayPosts() { return state.posts[today()] || { ig: 0, tk: 0 }; }

function getTotalPosts() {
  const init = state.initialPosts || { ig: 0, tk: 0 };
  let t = init.ig + init.tk;
  for (const v of Object.values(state.posts)) t += (v.ig||0) + (v.tk||0);
  return t;
}

function computeStreak() {
  const todayKey = today();
  let streak = 0;
  let d = new Date(todayKey + 'T00:00:00');

  const todayTotal = getTodayPosts();
  if ((todayTotal.ig + todayTotal.tk) >= STREAK_THRESHOLD) {
    streak = 1;
  } else {
    d.setDate(d.getDate() - 1);
  }
  while (true) {
    const key = toKey(d);
    if (key < START_DATE) break;
    const p = state.posts[key];
    if ((p?.ig||0) + (p?.tk||0) >= STREAK_THRESHOLD) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

function getLatestFollowers() {
  if (!state.followers.length) return { ig: 0, tk: 0, total: 0 };
  const last = state.followers[state.followers.length - 1];
  return { ig: last.ig, tk: last.tk, total: last.ig + last.tk };
}

function getFollowerGrowth() {
  if (state.followers.length < 2) return null;
  const a = state.followers[state.followers.length - 1];
  const b = state.followers[state.followers.length - 2];
  return (a.ig + a.tk) - (b.ig + b.tk);
}

function getRank(totalCoins) {
  for (const r of RANKS) if (totalCoins >= r.min) return r;
  return RANKS[RANKS.length - 1];
}

// Protocol helpers
function getTodayProtocolTasks() {
  const dow = new Date().getDay();
  return [...PROTOCOL_DAILY, ...(PROTOCOL_EXTRA[dow] || [])];
}
function getTodayProtocolDone() {
  return state.protocol[today()] || [];
}

function getWeekProtocolStats(weekMonKey) {
  const dates = getWeekDates(weekMonKey);
  let total = 0, done = 0;
  dates.forEach(dateKey => {
    const dow = new Date(dateKey + 'T00:00:00').getDay();
    total += getDayTaskTotal(dow);
    const completed = state.protocol[dateKey] || [];
    done += completed.length;
  });
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function buildCheckState() {
  return {
    totalPosts:     getTotalPosts(),
    streak:         computeStreak(),
    totalFollowers: getLatestFollowers().total,
  };
}

function checkBadges() {
  const cs = buildCheckState();
  const newly = [];
  for (const group of Object.values(BADGE_DEFS)) {
    for (const b of group) {
      if (!state.badges.includes(b.id) && b.check(cs)) {
        state.badges.push(b.id);
        newly.push(b);
      }
    }
  }
  return newly;
}

// ── Celebrate queue ───────────────────────────────────────────────────────────
let celebQueue = [], celebrating = false;

function celebrate(badge) {
  celebQueue.push(badge);
  if (!celebrating) showNextCeleb();
}
function showNextCeleb() {
  if (!celebQueue.length) { celebrating = false; return; }
  celebrating = true;
  const b = celebQueue.shift();
  document.getElementById('celebrate-emoji').textContent = b.icon;
  document.getElementById('celebrate-title').textContent = '¡LOGRO DESBLOQUEADO!';
  document.getElementById('celebrate-desc').textContent  = b.name;
  document.getElementById('celebrate-modal').classList.remove('hidden');
}
document.getElementById('celebrate-close').addEventListener('click', () => {
  document.getElementById('celebrate-modal').classList.add('hidden');
  showNextCeleb();
});

// ── Render ────────────────────────────────────────────────────────────────────
function renderHeader() {
  const rank = getRank(state.totalCoins);
  const el   = document.getElementById('rank-badge');
  el.style.color = rank.color;
  el.style.borderColor = rank.color;
  el.style.textShadow  = `0 0 10px ${rank.color}`;

  document.getElementById('rank-label').textContent     = rank.label;
  document.getElementById('coins-display').textContent  = state.coins;
  document.getElementById('mana-display').textContent   = state.mana;
  document.getElementById('total-posts-display').textContent = getTotalPosts();
  document.getElementById('streak-display').textContent = computeStreak();
}

function renderDaily() {
  const t   = today();
  const p   = getTodayPosts();
  const tot = p.ig + p.tk;
  const pct = Math.min(100, (tot / DAILY_GOAL) * 100);

  document.getElementById('today-date').textContent = formatDate(t);
  document.getElementById('daily-count').innerHTML =
    `${tot} <span class="daily-sep">/</span> ${DAILY_GOAL}`;
  document.getElementById('daily-bar').style.width = pct + '%';
  document.getElementById('ig-today').textContent  = `${p.ig} hoy`;
  document.getElementById('tk-today').textContent  = `${p.tk} hoy`;

  const badge = document.getElementById('day-complete-badge');
  tot >= DAILY_GOAL ? badge.classList.remove('hidden') : badge.classList.add('hidden');
}

function renderRank() {
  const rank = getRank(state.totalCoins);
  const el   = document.getElementById('rank-big');
  el.textContent  = rank.id.toUpperCase();
  el.style.color  = rank.color;
  el.style.textShadow = `0 0 30px ${rank.color}`;

  document.getElementById('rank-title').textContent = rank.title;
  document.getElementById('rank-coins-label').textContent = `${state.totalCoins} coins totales`;

  const nextRank = RANKS.find(r => r.min > state.totalCoins);
  const xpPct    = nextRank
    ? Math.min(100, ((state.totalCoins - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;

  document.getElementById('rank-xp-fill').style.width = xpPct + '%';
  document.getElementById('rank-xp-current').textContent = state.totalCoins;

  if (nextRank) {
    document.getElementById('rank-next-label').textContent  = `→ ${nextRank.label}`;
    document.getElementById('rank-xp-needed').textContent   = `${nextRank.min - state.totalCoins} coins`;
  } else {
    document.getElementById('rank-next-label').textContent  = '¡RANGO MÁXIMO!';
    document.getElementById('rank-xp-needed').textContent   = '';
  }

  // Rank pips
  const preview = document.getElementById('rank-preview');
  preview.innerHTML = '';
  [...RANKS].reverse().forEach(r => {
    const pip = document.createElement('span');
    pip.className = 'rank-pip';
    pip.textContent = r.id.toUpperCase();
    pip.style.color = r.color;
    pip.style.borderColor = r.color;
    if (r.id === rank.id) pip.classList.add('current');
    else if (state.totalCoins >= r.min) pip.classList.add('done');
    preview.appendChild(pip);
  });
}

function renderFollowers() {
  const { ig, tk, total } = getLatestFollowers();
  document.getElementById('followers-total').textContent = total.toLocaleString('es');
  document.getElementById('ig-followers').textContent   = ig.toLocaleString('es');
  document.getElementById('tk-followers').textContent   = tk.toLocaleString('es');

  const pct = Math.min(100, (total / 100000) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent  = pct.toFixed(1) + '%';

  // Growth
  const g  = getFollowerGrowth();
  const gE = document.getElementById('followers-growth');
  if (g !== null) {
    const sign = g >= 0 ? '+' : '';
    gE.innerHTML = `vs anterior: <span class="${g>=0?'growth-up':'growth-down'}">${sign}${g.toLocaleString('es')}</span>`;
  } else {
    gE.textContent = 'Actualiza seguidores para ver el crecimiento';
  }

  // Milestones every 5K
  const ms = document.getElementById('milestones');
  ms.innerHTML = '';
  for (let m = 5000; m < 100000; m += 5000) {
    const tick  = document.createElement('div');
    tick.className = 'milestone-tick' + (total >= m ? ' passed' : '');
    tick.style.left = (m / 1000) + '%';
    const lbl = document.createElement('span');
    lbl.className = 'milestone-label';
    lbl.textContent = (m/1000) + 'K';
    tick.appendChild(lbl);
    ms.appendChild(tick);
  }

  // Follower history with dates
  const hist = document.getElementById('followers-history');
  hist.innerHTML = '';
  const entries = state.followers.slice(-6).reverse();
  entries.forEach((e, i) => {
    const row = document.createElement('div');
    row.className = 'followers-history-row';
    const tot2 = e.ig + e.tk;
    const prev = i < entries.length - 1 ? (entries[i+1].ig + entries[i+1].tk) : null;
    const diff = prev !== null ? tot2 - prev : null;
    const diffStr = diff !== null ? ` <span class="${diff>=0?'growth-up':'growth-down'}">${diff>=0?'+':''}${diff.toLocaleString('es')}</span>` : '';
    row.innerHTML = `
      <span class="followers-history-date">${formatDate(e.date)}</span>
      <span>📸 ${e.ig.toLocaleString('es')} | 🎵 ${e.tk.toLocaleString('es')}</span>
      <span class="followers-history-total">${tot2.toLocaleString('es')}${diffStr}</span>
    `;
    hist.appendChild(row);
  });
}

function renderStreak() {
  const streak = computeStreak();
  document.getElementById('streak-big').textContent = streak;

  const hist = document.getElementById('streak-history');
  hist.innerHTML = '';
  const todayKey = today();
  for (let i = 29; i >= 0; i--) {
    const d   = new Date(todayKey + 'T00:00:00');
    d.setDate(d.getDate() - i);
    const key = toKey(d);
    const p   = state.posts[key];
    const tot = (p?.ig||0) + (p?.tk||0);
    const sq  = document.createElement('div');
    sq.title  = `${formatDate(key)} — ${tot} posts`;
    if (key === todayKey) {
      sq.className = 'streak-day today' + (tot >= STREAK_THRESHOLD ? ' done' : tot > 0 ? ' partial' : '');
    } else {
      sq.className = 'streak-day ' + (tot >= STREAK_THRESHOLD ? 'done' : tot > 0 ? 'partial' : '');
    }
    hist.appendChild(sq);
  }
}

function render14Days() {
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  const todayKey = today();
  for (let i = 13; i >= 0; i--) {
    const d   = new Date(todayKey + 'T00:00:00');
    d.setDate(d.getDate() - i);
    const key = toKey(d);
    const p   = state.posts[key];
    const ig  = p?.ig || 0;
    const tk  = p?.tk || 0;
    const tot = ig + tk;
    const pct = Math.min(100, (tot / DAILY_GOAL) * 100);
    const cls = tot >= DAILY_GOAL ? 'goal-hit' : tot >= STREAK_THRESHOLD ? 'goal-partial' : 'goal-miss';
    const barColor = tot >= DAILY_GOAL ? 'var(--gold)' : tot >= STREAK_THRESHOLD ? 'var(--red2)' : 'var(--border2)';

    const row = document.createElement('div');
    row.className = `history-row ${cls}`;
    row.innerHTML = `
      <span class="history-date">${formatDate(key)}</span>
      <div class="history-bar-wrap"><div class="history-bar" style="width:${pct}%;background:${barColor}"></div></div>
      <span class="history-ig">📸 ${ig}</span>
      <span class="history-tk">🎵 ${tk}</span>
      <span class="history-total" style="color:${tot>=DAILY_GOAL?'var(--gold)':tot>=STREAK_THRESHOLD?'var(--red2)':'var(--muted2)'}">${tot}</span>
    `;
    list.appendChild(row);
  }
}

function renderProtocol() {
  const todayKey  = today();
  const todayDone = state.protocol[todayKey] || [];
  const tasks     = getTodayProtocolTasks();
  const weekMonKey = getWeekKey(todayKey);
  const { total: wTotal, done: wDone, pct: wPct } = getWeekProtocolStats(weekMonKey);

  // Week % and bar
  document.getElementById('protocol-week-pct').textContent = wPct + '%';
  document.getElementById('protocol-mana-fill').style.width = Math.min(100, wPct) + '%';
  document.getElementById('protocol-mana-count').textContent = `${wDone}/${wTotal}`;

  // Today's tasks
  const container = document.getElementById('protocol-tasks');
  container.innerHTML = '';

  const dailyLabel = document.createElement('div');
  dailyLabel.className = 'protocol-section-label';
  dailyLabel.textContent = 'Tareas diarias';
  container.appendChild(dailyLabel);

  PROTOCOL_DAILY.forEach(task => renderProtocolTask(container, task, todayKey, todayDone));

  const dow   = new Date().getDay();
  const extra = PROTOCOL_EXTRA[dow] || [];
  if (extra.length) {
    const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const label = document.createElement('div');
    label.className = 'protocol-section-label';
    label.textContent = `Tareas de ${dayNames[dow]}`;
    container.appendChild(label);
    extra.forEach(task => renderProtocolTask(container, task, todayKey, todayDone));
  }

  // Week history (last 5 weeks)
  const histContainer = document.getElementById('protocol-history');
  histContainer.innerHTML = '';
  const weeks = [];
  let d = new Date(todayKey + 'T00:00:00');
  for (let i = 0; i < 5; i++) {
    const wKey = getWeekKey(toKey(d));
    if (!weeks.includes(wKey)) weeks.push(wKey);
    d.setDate(d.getDate() - 7);
  }
  weeks.forEach(wKey => {
    const stats = getWeekProtocolStats(wKey);
    const hit   = stats.pct >= 85;
    const row   = document.createElement('div');
    row.className = 'protocol-week-row';
    row.innerHTML = `
      <span class="pw-label">${formatDate(wKey)}</span>
      <div class="pw-bar-wrap"><div class="pw-bar ${hit?'hit':'miss'}" style="width:${Math.min(100,stats.pct)}%"></div></div>
      <span class="pw-pct ${hit?'hit':'miss'}">${stats.pct}%</span>
    `;
    histContainer.appendChild(row);
  });
}

function renderProtocolTask(container, task, dateKey, done) {
  const isDone = done.includes(task.id);
  const el = document.createElement('div');
  el.className = 'protocol-task' + (isDone ? ' done' : '');
  el.dataset.id = task.id;
  el.dataset.date = dateKey;
  el.innerHTML = `
    <div class="protocol-task-check">${isDone ? '✓' : ''}</div>
    <span class="protocol-task-label">${escHtml(task.label)}</span>
    <span class="protocol-task-mana">+${task.mana} 💧</span>
  `;
  el.addEventListener('click', () => toggleProtocolTask(dateKey, task));
  container.appendChild(el);
}

function toggleProtocolTask(dateKey, task) {
  if (!state.protocol[dateKey]) state.protocol[dateKey] = [];
  const arr = state.protocol[dateKey];
  const idx = arr.indexOf(task.id);
  if (idx === -1) {
    arr.push(task.id);
    state.mana += task.mana;
  } else {
    arr.splice(idx, 1);
    state.mana = Math.max(0, state.mana - task.mana);
  }
  save();
  renderProtocol();
  renderHeader();
}

function renderRewards() {
  const grid = document.getElementById('rewards-grid');
  const active = state.rewards.filter(r => !r.redeemed);
  if (!active.length) {
    grid.innerHTML = '<div class="rewards-empty">Agrega recompensas para canjear con coins ⚔️</div>';
  } else {
    grid.innerHTML = '';
    active.forEach(r => {
      const card = document.createElement('div');
      card.className = 'reward-card' + (state.coins >= r.cost ? ' affordable' : '');
      card.innerHTML = `
        <div class="reward-name">${escHtml(r.name)}</div>
        <div class="reward-cost-tag">🪙 ${r.cost}</div>
        <button class="btn-redeem" data-id="${r.id}" ${state.coins < r.cost ? 'disabled' : ''}>CANJEAR</button>
      `;
      grid.appendChild(card);
    });
  }
  const sec  = document.getElementById('redeemed-section');
  const list = document.getElementById('redeemed-list');
  if (state.redeemedHistory.length) {
    sec.style.display = 'block';
    list.innerHTML = state.redeemedHistory.slice(-8).reverse().map(h =>
      `<li>${escHtml(h.name)} <span>${formatDate(h.date)}</span></li>`
    ).join('');
  } else {
    sec.style.display = 'none';
  }
}

function renderBadges() {
  const groups = { posts: 'badges-posts', streak: 'badges-streak', followers: 'badges-followers' };
  let total = 0;
  for (const [g, cId] of Object.entries(groups)) {
    const c = document.getElementById(cId);
    c.innerHTML = '';
    for (const b of BADGE_DEFS[g]) {
      const unlocked = state.badges.includes(b.id);
      if (unlocked) total++;
      const el = document.createElement('div');
      el.className = 'badge' + (unlocked ? ' unlocked' : '');
      el.title = b.name;
      el.innerHTML = `<span class="badge-icon">${b.icon}</span><span class="badge-name">${b.name}</span>`;
      c.appendChild(el);
    }
  }
  const allCount = Object.values(BADGE_DEFS).flat().length;
  document.getElementById('badges-unlocked-count').textContent = `${total} / ${allCount}`;
}

function renderAll() {
  renderHeader();
  renderDaily();
  renderRank();
  renderFollowers();
  renderStreak();
  render14Days();
  renderProtocol();
  renderRewards();
  renderBadges();
}

// ── Events: posts ─────────────────────────────────────────────────────────────
let lastAction = null;

function addPost(platform) {
  const t = today();
  if (!state.posts[t]) state.posts[t] = { ig: 0, tk: 0 };
  state.posts[t][platform]++;
  lastAction = { platform, date: t };

  // 1 coin per post
  state.coins++;
  state.totalCoins++;

  save();
  renderAll();
  const newly = checkBadges();
  if (newly.length) { save(); renderBadges(); renderHeader(); newly.forEach(celebrate); }
}

document.getElementById('btn-ig').addEventListener('click', () => addPost('ig'));
document.getElementById('btn-tk').addEventListener('click', () => addPost('tk'));

document.getElementById('btn-undo').addEventListener('click', () => {
  if (!lastAction) return;
  const { platform, date } = lastAction;
  if (state.posts[date]?.[platform] > 0) {
    state.posts[date][platform]--;
    state.coins      = Math.max(0, state.coins - 1);
    state.totalCoins = Math.max(0, state.totalCoins - 1);
  }
  lastAction = null;
  save();
  renderAll();
});

// ── Events: followers ─────────────────────────────────────────────────────────
document.getElementById('btn-update-followers').addEventListener('click', () => {
  const { ig, tk } = getLatestFollowers();
  document.getElementById('input-ig-followers').value = ig || '';
  document.getElementById('input-tk-followers').value = tk || '';
  document.getElementById('followers-form').classList.remove('hidden');
  document.getElementById('btn-update-followers').style.display = 'none';
});
document.getElementById('cancel-followers').addEventListener('click', () => {
  document.getElementById('followers-form').classList.add('hidden');
  document.getElementById('btn-update-followers').style.display = '';
});
document.getElementById('save-followers').addEventListener('click', () => {
  const ig = parseInt(document.getElementById('input-ig-followers').value) || 0;
  const tk = parseInt(document.getElementById('input-tk-followers').value) || 0;
  state.followers.push({ date: today(), ig, tk });
  save();
  document.getElementById('followers-form').classList.add('hidden');
  document.getElementById('btn-update-followers').style.display = '';
  renderAll();
  const newly = checkBadges();
  if (newly.length) { save(); renderBadges(); renderHeader(); newly.forEach(celebrate); }
});

// ── Events: rewards ───────────────────────────────────────────────────────────
document.getElementById('btn-add-reward').addEventListener('click', () => {
  document.getElementById('add-reward-form').classList.remove('hidden');
  document.getElementById('reward-name').focus();
});
document.getElementById('cancel-reward').addEventListener('click', () => {
  document.getElementById('add-reward-form').classList.add('hidden');
});
document.getElementById('save-reward').addEventListener('click', () => {
  const name = document.getElementById('reward-name').value.trim();
  const cost = parseInt(document.getElementById('reward-cost').value) || 1;
  if (!name) return;
  state.rewards.push({ id: Date.now().toString(), name, cost, redeemed: false });
  document.getElementById('reward-name').value = '';
  document.getElementById('add-reward-form').classList.add('hidden');
  save();
  renderRewards();
});
document.getElementById('rewards-grid').addEventListener('click', e => {
  const btn = e.target.closest('.btn-redeem');
  if (!btn) return;
  const r = state.rewards.find(r => r.id === btn.dataset.id);
  if (!r || state.coins < r.cost) return;
  state.coins -= r.cost;
  r.redeemed = true;
  state.redeemedHistory.push({ name: r.name, date: today() });
  save();
  renderRewards();
  renderHeader();
});

// ── Events: setup modal ───────────────────────────────────────────────────────
function checkSetup() {
  if (state.initialPosts === null) {
    document.getElementById('setup-modal').classList.remove('hidden');
  }
}
document.getElementById('setup-save').addEventListener('click', () => {
  const ig  = parseInt(document.getElementById('init-ig').value) || 0;
  const tk  = parseInt(document.getElementById('init-tk').value) || 0;
  const igF = parseInt(document.getElementById('init-ig-followers').value) || 0;
  const tkF = parseInt(document.getElementById('init-tk-followers').value) || 0;
  state.initialPosts = { ig, tk };
  if (igF > 0 || tkF > 0) {
    state.followers.push({ date: today(), ig: igF, tk: tkF });
  }
  save();
  document.getElementById('setup-modal').classList.add('hidden');
  renderAll();
});

// ── Util ──────────────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Seed historical data (Apr 8–24) on first load ────────────────────────────
function seedHistoricalData() {
  const SEED_POSTS = {
    '2026-04-08': { ig: 2, tk: 4 },
    '2026-04-09': { ig: 5, tk: 3 },
    '2026-04-10': { ig: 3, tk: 4 },
    '2026-04-11': { ig: 3, tk: 4 },
    '2026-04-12': { ig: 3, tk: 4 },
    '2026-04-13': { ig: 2, tk: 1 },
    '2026-04-14': { ig: 3, tk: 3 },
    '2026-04-15': { ig: 3, tk: 2 },
    '2026-04-16': { ig: 1, tk: 2 },
    '2026-04-17': { ig: 0, tk: 0 },
    '2026-04-18': { ig: 2, tk: 1 },
    '2026-04-19': { ig: 1, tk: 2 },
    '2026-04-20': { ig: 1, tk: 1 },
    '2026-04-21': { ig: 2, tk: 2 },
    '2026-04-22': { ig: 2, tk: 1 },
    '2026-04-23': { ig: 2, tk: 2 },
    '2026-04-24': { ig: 2, tk: 2 },
  };
  // Only seed if no posts exist yet
  if (Object.keys(state.posts).length === 0) {
    state.posts = SEED_POSTS;
    // 75 posts históricos = 75 coins iniciales
    state.coins      = 75;
    state.totalCoins = 75;
    state.badges     = ['p1', 'p49']; // Primer Paso + Semana Completa ya ganados
    save();
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
seedHistoricalData();
checkSetup();
renderAll();
