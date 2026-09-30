/* جدول — design prototype behaviour.
   Renders the shared chrome (header, mobile menu, footer, mini player) and a
   simulated audio player. In the real build, audio + metadata come from the
   Acast RSS feed; here the timeline is faked so the design can be reviewed
   without a feed. */
(function () {
  'use strict';

  var BASE = document.documentElement.getAttribute('data-base') || '';
  var PAGE = document.documentElement.getAttribute('data-page') || '';

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  function fa(v) { return String(v).replace(/\d/g, function (d) { return FA[d]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(sec) { sec = Math.max(0, Math.round(sec)); return pad(Math.floor(sec / 60)) + ':' + pad(sec % 60); }
  function secs(mmss) { var p = mmss.split(':'); return (+p[0]) * 60 + (+p[1]); }

  var GROUPS = {
    life:   { name: 'گروه زندگی',  col: 1, icon: 'fill',  tile: 'navy' },
    food:   { name: 'گروه خوراکی', col: 2, icon: 'open',  tile: 'cream' },
    body:   { name: 'گروه بدن',    col: 3, icon: 'dot',   tile: '' },
    supp:   { name: 'گروه مکمل',   col: 4, icon: 'steps', tile: 'black' },
    pharma: { name: 'گروه دارو',   col: 5, icon: 'pair',  tile: 'navy' }
  };

  var EPISODES = [
    { n: 1, sym: 'On', g: 'body',   s: 1, len: '26:04', date: '۱۲ اسفند ۱۴۰۳', title: 'پیاز چرا اشکمون رو درمیاره؟', desc: 'یک آنزیم، سی ثانیه فرصت، و ترکیبی که تا لحظه‌ای پیش وجود نداشت.' },
    { n: 2, sym: 'Cf', g: 'food',   s: 1, len: '33:12', date: '۲۶ اسفند ۱۴۰۳', title: 'شیمیِ یک فنجان قهوه', desc: 'قهوه فقط کافئین نیست؛ صدها ترکیبِ کوچک در یک فنجان کنارِ هم نشسته‌اند.' },
    { n: 3, sym: 'Rn', g: 'life',   s: 1, len: '24:40', date: '۲۸ فروردین ۱۴۰۴', title: 'بوی باران از کجا می‌آید؟', desc: 'آن بو، بوی آب نیست. بوی خاکی است که تازه خیس شده.' },
    { n: 4, sym: 'Lf', g: 'life',   s: 1, len: '31:07', date: '۱۱ اردیبهشت ۱۴۰۴', title: 'چرا برگ‌ها تغییر رنگ می‌دهند؟', desc: 'رنگِ پاییز رنگِ تازه‌ای نیست؛ رنگی است که تمام تابستان پنهان بوده.' },
    { n: 5, sym: 'Vd', g: 'supp',   s: 1, len: '28:15', date: '۲۵ اردیبهشت ۱۴۰۴', title: 'نور خورشید چطور ویتامین می‌سازد؟', desc: 'پوست فقط پوشش نیست؛ یک کارخانهٔ کوچک است که با نور کار می‌کند.' },
    { n: 6, sym: 'Sp', g: 'life',   s: 1, len: '29:18', date: '۸ خرداد ۱۴۰۴', title: 'صابون با چربی چه می‌کند؟', desc: 'یک مولکول با دو سر: یکی آب را دوست دارد، دیگری چربی را.' },
    { n: 7, sym: 'Ef', g: 'pharma', s: 2, len: '22:30', date: '۱۷ تیر ۱۴۰۴', title: 'قرصِ جوشان چرا جوش می‌آید؟', desc: 'یک لیوان آب، دو پودرِ خشک، و گازی که تا لحظه‌ای پیش در کار نبود.' },
    { n: 8, sym: 'Na', g: 'life',   s: 2, len: '25:48', date: '۳۱ تیر ۱۴۰۴', title: 'نمک چطور یخِ جاده را آب می‌کند؟', desc: 'نمک یخ را گرم نمی‌کند؛ نقطهٔ ذوبش را جابه‌جا می‌کند.' },
    { n: 9, sym: 'Ap', g: 'food',   s: 2, len: '21:55', date: '۱۴ مرداد ۱۴۰۴', title: 'چرا سیبِ بریده قهوه‌ای می‌شود؟', desc: 'اکسیژن، یک آنزیم، و چند دقیقه صبر؛ همین برای قهوه‌ای‌شدن کافی است.' }
  ];
  function ep(n) { for (var i = 0; i < EPISODES.length; i++) if (EPISODES[i].n === +n) return EPISODES[i]; return EPISODES[0]; }

  function epNum(n) { return 'EP ' + pad(n); }
  function mins(len) { return fa(Math.round(secs(len) / 60)) + ' دقیقه'; }

  function tile(e, opts) {
    opts = opts || {};
    var g = GROUPS[e.g];
    var variant = opts.variant || (g.tile ? 'tile--' + g.tile : '');
    var tag = opts.href ? 'a href="' + opts.href + '"' : 'div';
    var close = opts.href ? 'a' : 'div';
    return '<' + tag + ' class="tile ' + variant + ' ' + (opts.cls || '') + '" aria-label="' + e.title + '">' +
      '<div class="tile__top"><span>' + pad(e.n) + '</span><span>' + fa(g.col) + '</span></div>' +
      '<div class="tile__sym">' + e.sym + '</div>' +
      (opts.name === false ? '' : '<div><div class="tile__name">' + (opts.short || g.name.replace('گروه ', '')) + '</div><div class="tile__mass latin">' + e.len + '</div></div>') +
      '</' + close + '>';
  }
  function emptyTile(n, label) {
    return '<div class="tile tile--empty" aria-label="اپیزودِ ' + fa(n) + '، به‌زودی">' +
      '<div class="tile__top"><span>' + pad(n) + '</span><span></span></div>' +
      '<div class="tile__sym">?</div>' +
      '<div><div class="tile__name">' + (label || 'به‌زودی') + '</div><div class="tile__mass">—</div></div></div>';
  }

  window.Jadval = { EPISODES: EPISODES, GROUPS: GROUPS, ep: ep, tile: tile, emptyTile: emptyTile, fa: fa, pad: pad, epNum: epNum, mins: mins };

  /* ---------------- Shared chrome ---------------- */
  var NAV = [
    ['home', 'خانه', 'pages/home.html'],
    ['episodes', 'اپیزودها', 'pages/episodes.html'],
    ['groups', 'گروه‌ها', 'pages/group.html'],
    ['about', 'دربارهٔ ما', 'pages/about.html'],
    ['contact', 'تماس', 'pages/contact.html']
  ];
  var LATEST = EPISODES[EPISODES.length - 1];

  function logo(light) {
    return '<a class="logo' + (light ? ' logo--light' : '') + '" href="' + BASE + 'pages/home.html" aria-label="جدول — خانه">' +
      '<span class="symbol' + (light ? ' symbol--light' : '') + '"><i></i><i></i></span>' +
      '<span class="logo__word">جدول</span></a>';
  }

  function header() {
    var el = document.querySelector('[data-header]');
    if (!el) return;
    var links = NAV.map(function (n) {
      return '<a href="' + BASE + n[2] + '"' + (PAGE === n[0] ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
    }).join('');
    var mm = NAV.map(function (n, i) {
      return '<a class="mm-link" href="' + BASE + n[2] + '"' + (PAGE === n[0] ? ' aria-current="page"' : '') + '>' + n[1] + '<span>' + pad(i + 1) + '</span></a>';
    }).join('');
    el.outerHTML =
      '<header class="site-header"><div class="wrap site-header__in">' + logo() +
      '<nav class="nav" aria-label="اصلی">' + links + '</nav>' +
      '<div class="header-cta"><button class="btn btn--navy btn--sm" data-play="' + LATEST.n + '"><span class="cta-long">شنیدن اپیزود تازه</span><span class="cta-short">اپیزود تازه</span></button>' +
      '<button class="burger" aria-label="منو" aria-expanded="false" aria-controls="mobile-menu" data-burger><span></span></button></div>' +
      '</div></header>' +
      '<div class="mobile-menu" id="mobile-menu">' + mm +
      '<div class="mobile-menu__foot"><span class="label">شنیدن در</span><div class="platforms"><a href="#">SPOTIFY</a><a href="#">APPLE</a><a href="#">CASTBOX</a><a href="#">YOUTUBE</a></div></div></div>';
  }

  function footer() {
    var el = document.querySelector('[data-footer]');
    if (!el) return;
    el.outerHTML =
      '<footer class="site-footer"><div class="wrap site-footer__grid">' +
      '<div class="stack gap-3">' + logo(true) + '<span class="logo-latin latin" style="opacity:.6">JADVAL</span>' +
      '<p style="max-width:34ch;font-size:15px;line-height:1.9;opacity:.75">شیمیِ چیزهایی که هر روز باهاشون زندگی می‌کنیم.</p></div>' +
      '<nav aria-label="پادکست"><h4>پادکست</h4><a href="' + BASE + 'pages/episodes.html">اپیزودها</a><a href="' + BASE + 'pages/group.html">گروه‌ها</a><a href="' + BASE + 'pages/about.html">دربارهٔ ما</a><a href="' + BASE + 'pages/contact.html">تماس</a></nav>' +
      '<nav aria-label="شنیدن"><h4>شنیدن</h4><a href="#">اسپاتیفای</a><a href="#">اپل پادکست</a><a href="#">کست‌باکس</a><a href="#">یوتیوب</a><a href="#">RSS</a></nav>' +
      '</div><div class="site-footer__bar"><div class="wrap"><span>© ۱۴۰۴ JADVAL</span><span class="latin">SAAKHTEH SHODEH BA KONJKAVI</span></div></div></footer>';
  }

  function menu() {
    var b = document.querySelector('[data-burger]');
    if (!b) return;
    b.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------- Player (simulated) ---------------- */
  var SEGS = 48;
  var RATES = [1, 1.25, 1.5, 2];
  var state = { n: null, pos: 0, playing: false, rate: 1 };
  var timer = null;
  var store = {
    get: function () { try { return JSON.parse(localStorage.getItem('jadval-player') || 'null'); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem('jadval-player', JSON.stringify(v)); } catch (e) {} }
  };

  function segs(dark) {
    var h = '';
    for (var i = 0; i < SEGS; i++) h += '<i></i>';
    return '<div class="segbar' + (dark ? ' segbar--dark' : '') + '" data-seek role="slider" aria-label="پیشرفتِ اپیزود" tabindex="0">' + h + '</div>';
  }
  function icon(playing) { return playing ? '<span class="pause-icon"></span>' : '<span class="play-icon"></span>'; }

  function mini() {
    var el = document.createElement('div');
    el.className = 'miniplayer';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'پخش‌کننده');
    el.innerHTML =
      '<div class="miniplayer__in">' +
      '<button class="pmain" data-toggle aria-label="پخش / توقف">' + icon(false) + '</button>' +
      '<div class="miniplayer__info"><div data-mini-tile></div><div class="miniplayer__txt"><strong data-mini-title></strong><span data-mini-meta></span></div></div>' +
      '<div class="miniplayer__bar">' + segs(true) + '<div class="player__time"><span data-elapsed>00:00</span><span data-total>00:00</span></div></div>' +
      '<div class="miniplayer__ctrls"><button class="pbtn hide-sm" data-skip="-15" aria-label="۱۵ ثانیه عقب">−۱۵</button><button class="pbtn hide-sm" data-skip="15" aria-label="۱۵ ثانیه جلو">+۱۵</button>' +
      '<button class="pbtn pbtn--txt" data-rate aria-label="سرعت پخش">۱×</button><button class="pbtn miniplayer__close" data-close aria-label="بستن">×</button></div></div>';
    document.body.appendChild(el);
    return el;
  }

  var miniEl;
  function total() { return state.n ? secs(ep(state.n).len) : 0; }

  function render() {
    var t = total();
    var frac = t ? state.pos / t : 0;
    var on = Math.floor(frac * SEGS);
    document.querySelectorAll('[data-seek]').forEach(function (bar) {
      var owner = bar.closest('[data-fullplayer]');
      var mine = !owner || +owner.getAttribute('data-fullplayer') === state.n;
      bar.querySelectorAll('i').forEach(function (s, i) {
        s.className = mine && i < on ? 'on' : (mine && i === on && state.n ? 'head' : '');
      });
    });
    document.querySelectorAll('[data-elapsed]').forEach(function (x) {
      var owner = x.closest('[data-fullplayer]');
      x.textContent = !owner || +owner.getAttribute('data-fullplayer') === state.n ? clock(state.pos) : '00:00';
    });
    document.querySelectorAll('[data-toggle]').forEach(function (b) {
      var owner = b.closest('[data-fullplayer]');
      var mine = !owner || +owner.getAttribute('data-fullplayer') === state.n;
      b.innerHTML = icon(mine && state.playing);
    });
    document.querySelectorAll('[data-rate]').forEach(function (b) { b.textContent = fa(state.rate) + '×'; });
    document.querySelectorAll('[data-play]').forEach(function (b) {
      b.classList.toggle('is-playing', +b.getAttribute('data-play') === state.n && state.playing);
    });
  }

  function load(n, keepPos) {
    var e = ep(n);
    if (state.n !== e.n) { state.n = e.n; state.pos = keepPos || 0; }
    miniEl.querySelector('[data-mini-tile]').innerHTML = tile(e, { name: false, cls: 'tile-sm' });
    miniEl.querySelector('[data-mini-title]').textContent = e.title;
    miniEl.querySelector('[data-mini-meta]').textContent = epNum(e.n) + ' — ' + GROUPS[e.g].name;
    miniEl.querySelector('[data-total]').textContent = e.len;
    miniEl.classList.add('is-open');
    document.documentElement.style.setProperty('--player-h', (window.innerWidth < 900 ? 68 : 72) + 'px');
  }

  function tick() {
    state.pos += state.rate;
    if (state.pos >= total()) { state.pos = total(); pause(); }
    save(); render();
  }
  function play(n) {
    if (n && +n !== state.n) load(n);
    state.playing = true;
    clearInterval(timer); timer = setInterval(tick, 1000);
    save(); render();
  }
  function pause() { state.playing = false; clearInterval(timer); save(); render(); }
  function save() { store.set({ n: state.n, pos: state.pos, rate: state.rate }); }

  function bind() {
    document.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-play],[data-toggle],[data-skip],[data-rate],[data-close],[data-seek]');
      if (!t) return;
      if (t.hasAttribute('data-play')) {
        ev.preventDefault();
        var n = +t.getAttribute('data-play');
        if (state.n === n && state.playing) pause(); else play(n);
      } else if (t.hasAttribute('data-toggle')) {
        var owner = t.closest('[data-fullplayer]');
        if (owner && +owner.getAttribute('data-fullplayer') !== state.n) return play(+owner.getAttribute('data-fullplayer'));
        if (!state.n) return;
        state.playing ? pause() : play();
      } else if (t.hasAttribute('data-skip')) {
        if (!state.n) return;
        state.pos = Math.min(total(), Math.max(0, state.pos + (+t.getAttribute('data-skip'))));
        save(); render();
      } else if (t.hasAttribute('data-rate')) {
        state.rate = RATES[(RATES.indexOf(state.rate) + 1) % RATES.length];
        save(); render();
      } else if (t.hasAttribute('data-close')) {
        pause(); miniEl.classList.remove('is-open');
        document.documentElement.style.setProperty('--player-h', '0px');
      } else if (t.hasAttribute('data-seek')) {
        var own = t.closest('[data-fullplayer]');
        if (own && +own.getAttribute('data-fullplayer') !== state.n) load(+own.getAttribute('data-fullplayer'));
        if (!state.n) return;
        var r = t.getBoundingClientRect();
        var frac = (r.right - ev.clientX) / r.width; // RTL: progress grows leftwards
        state.pos = Math.round(frac * total());
        save(); render();
      }
    });
  }

  function restore() {
    var s = store.get();
    if (s && s.n && s.pos > 0) {
      state.rate = s.rate || 1;
      load(s.n, s.pos);
      state.pos = s.pos;
    }
  }

  /* Full players on the page get their segment bar injected */
  function fullPlayers() {
    document.querySelectorAll('[data-segs]').forEach(function (x) { x.outerHTML = segs(false); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    header(); footer(); menu();
    fullPlayers();
    miniEl = mini();
    bind(); restore(); render();
    document.dispatchEvent(new CustomEvent('jadval:ready'));
  });
})();
