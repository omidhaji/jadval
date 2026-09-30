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

  // Topic groups are parked until the catalogue grows (see archive/v2-groups). Kept for data only.
  var GROUPS = {
    life:   { name: 'گروه زندگی',  col: 1, icon: 'fill',  tile: 'navy' },
    food:   { name: 'گروه خوراکی', col: 2, icon: 'open',  tile: 'cream' },
    body:   { name: 'گروه بدن',    col: 3, icon: 'dot',   tile: '' },
    supp:   { name: 'گروه مکمل',   col: 4, icon: 'steps', tile: 'black' },
    pharma: { name: 'گروه دارو',   col: 5, icon: 'pair',  tile: 'navy' }
  };

  var EPISODES = [
    { n: 1, sym: 'On', obj: 'پیاز', tone: '', g: 'body', month: 'mordad', len: '26:04', date: 'سه‌شنبه ۱۳ مرداد ۱۴۰۵', title: 'پیاز چرا اشکمون رو درمیاره؟', desc: 'یک آنزیم، سی ثانیه فرصت، و ترکیبی که تا لحظه‌ای پیش وجود نداشت.' },
    { n: 2, sym: 'Cf', obj: 'قهوه', tone: 'cream', g: 'food', month: 'mordad', len: '33:12', date: 'سه‌شنبه ۲۰ مرداد ۱۴۰۵', title: 'شیمیِ یک فنجان قهوه', desc: 'قهوه فقط کافئین نیست؛ صدها ترکیبِ کوچک در یک فنجان کنارِ هم نشسته‌اند.' },
    { n: 3, sym: 'Rn', obj: 'باران', tone: 'navy', g: 'life', month: 'mordad', len: '24:40', date: 'سه‌شنبه ۲۷ مرداد ۱۴۰۵', title: 'بوی باران از کجا می‌آید؟', desc: 'آن بو، بوی آب نیست. بوی خاکی است که تازه خیس شده.' },
    { n: 4, sym: 'Lf', obj: 'برگ', tone: 'navy', g: 'life', month: 'shahrivar', len: '31:07', date: 'سه‌شنبه ۳ شهریور ۱۴۰۵', title: 'چرا برگ‌ها تغییر رنگ می‌دهند؟', desc: 'رنگِ پاییز رنگِ تازه‌ای نیست؛ رنگی است که تمام تابستان پنهان بوده.' },
    { n: 5, sym: 'Vd', obj: 'خورشید', tone: 'black', g: 'supp', month: 'shahrivar', len: '28:15', date: 'سه‌شنبه ۱۰ شهریور ۱۴۰۵', title: 'نور خورشید چطور ویتامین می‌سازد؟', desc: 'پوست فقط پوشش نیست؛ یک کارخانهٔ کوچک است که با نور کار می‌کند.' },
    { n: 6, sym: 'Sp', obj: 'صابون', tone: 'navy', g: 'life', month: 'shahrivar', len: '29:18', date: 'سه‌شنبه ۱۷ شهریور ۱۴۰۵', title: 'صابون با چربی چه می‌کند؟', desc: 'یک مولکول با دو سر: یکی آب را دوست دارد، دیگری چربی را.' },
    { n: 7, sym: 'Ef', obj: 'قرصِ جوشان', tone: '', g: 'pharma', month: 'shahrivar', len: '22:30', date: 'سه‌شنبه ۲۴ شهریور ۱۴۰۵', title: 'قرصِ جوشان چرا جوش می‌آید؟', desc: 'یک لیوان آب، دو پودرِ خشک، و گازی که تا لحظه‌ای پیش در کار نبود.' },
    { n: 8, sym: 'Na', obj: 'نمک', tone: 'navy', g: 'life', month: 'shahrivar', len: '25:48', date: 'سه‌شنبه ۳۱ شهریور ۱۴۰۵', title: 'نمک چطور یخِ جاده را آب می‌کند؟', desc: 'نمک یخ را گرم نمی‌کند؛ نقطهٔ ذوبش را جابه‌جا می‌کند.' },
    { n: 9, sym: 'Ap', obj: 'سیب', tone: 'cream', g: 'food', month: 'mehr', len: '21:55', date: 'سه‌شنبه ۷ مهر ۱۴۰۵', title: 'چرا سیبِ بریده قهوه‌ای می‌شود؟', desc: 'اکسیژن، یک آنزیم، و چند دقیقه صبر؛ همین برای قهوه‌ای‌شدن کافی است.' }
  ];
  var ICON_PATHS = {"applepodcasts": "M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59.12 2.2.007 2.864a8.506 8.506 0 01-3.24 5.296c-.608.46-2.096 1.261-2.336 1.261-.088 0-.096-.091-.056-.46.072-.592.144-.715.48-.856.536-.224 1.448-.874 2.008-1.435a7.644 7.644 0 002.008-3.536c.208-.824.184-2.656-.048-3.504-.728-2.696-2.928-4.792-5.624-5.352-.784-.16-2.208-.16-3 0-2.728.56-4.984 2.76-5.672 5.528-.184.752-.184 2.584 0 3.336.456 1.832 1.64 3.512 3.192 4.512.304.2.672.408.824.472.336.144.408.264.472.856.04.36.03.464-.056.464-.056 0-.464-.176-.896-.384l-.04-.03c-2.472-1.216-4.056-3.274-4.632-6.012-.144-.706-.168-2.392-.03-3.04.36-1.74 1.048-3.1 2.192-4.304 1.648-1.737 3.768-2.656 6.128-2.656zm.134 2.81c.409.004.803.04 1.106.106 2.784.62 4.76 3.408 4.376 6.174-.152 1.114-.536 2.03-1.216 2.88-.336.43-1.152 1.15-1.296 1.15-.023 0-.048-.272-.048-.603v-.605l.416-.496c1.568-1.878 1.456-4.502-.256-6.224-.664-.67-1.432-1.064-2.424-1.246-.64-.118-.776-.118-1.448-.008-1.02.167-1.81.562-2.512 1.256-1.72 1.704-1.832 4.342-.264 6.222l.413.496v.608c0 .336-.027.608-.06.608-.03 0-.264-.16-.512-.36l-.034-.011c-.832-.664-1.568-1.842-1.872-2.997-.184-.698-.184-2.024.008-2.72.504-1.878 1.888-3.335 3.808-4.019.41-.145 1.133-.22 1.814-.211zm-.13 2.99c.31 0 .62.06.844.178.488.253.888.745 1.04 1.259.464 1.578-1.208 2.96-2.72 2.254h-.015c-.712-.331-1.096-.956-1.104-1.77 0-.733.408-1.371 1.112-1.745.224-.117.534-.176.844-.176zm-.011 4.728c.988-.004 1.706.349 1.97.97.198.464.124 1.932-.218 4.302-.232 1.656-.36 2.074-.68 2.356-.44.39-1.064.498-1.656.288h-.003c-.716-.257-.87-.605-1.164-2.644-.341-2.37-.416-3.838-.218-4.302.262-.616.974-.966 1.97-.97z", "castbox": "M12 0c-.29 0-.58.068-.812.206L2.417 5.392c-.46.272-.804.875-.804 1.408v10.4c0 .533.344 1.135.804 1.407l8.77 5.187c.465.275 1.162.275 1.626 0l8.77-5.187c.46-.272.804-.874.804-1.407V6.8c0-.533-.344-1.136-.804-1.408L12.813.206A1.618 1.618 0 0012 0zm-.85 8.304c.394 0 .714.303.714.676v2.224c0 .207.191.375.427.375s.428-.168.428-.375V9.57c0-.373.32-.675.713-.675.394 0 .712.302.712.675v4.713c0 .374-.318.676-.712.676-.394 0-.713-.302-.713-.676v-1.31c0-.206-.192-.374-.428-.374s-.427.168-.427.374v1.226c0 .374-.32.676-.713.676-.394 0-.713-.302-.713-.676v-1.667c0-.207-.192-.375-.428-.375-.235 0-.427.168-.427.375v3.31c0 .373-.319.676-.712.676-.394 0-.713-.303-.713-.676v-2.427c0-.206-.191-.374-.428-.374-.235 0-.427.168-.427.374v.178a.71.71 0 01-.712.708.71.71 0 01-.713-.708v-2.123a.71.71 0 01.713-.708.71.71 0 01.712.708v.178c0 .206.192.373.427.373.237 0 .428-.167.428-.373v-1.53c0-.374.32-.676.713-.676.393 0 .712.303.712.676v.646c0 .206.192.374.427.374.236 0 .428-.168.428-.374V8.98c0-.373.319-.676.713-.676zm4.562 2.416c.393 0 .713.302.713.676v2.691c0 .374-.32.676-.713.676-.394 0-.712-.303-.712-.676v-2.691c0-.374.319-.676.712-.676zm2.28 1.368c.395 0 .713.303.713.676v.67c0 .374-.318.676-.712.676-.394 0-.713-.302-.713-.675v-.67c0-.374.32-.677.713-.677Z", "spotify": "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z", "youtube": "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"};

  // Where to listen. Fidibo has no public icon set; its mark is a placeholder until the official asset is supplied.
  var PLATFORMS = [
    { id: 'applepodcasts', name: 'اپل پادکست', latin: 'APPLE PODCASTS', href: '#' },
    { id: 'castbox',       name: 'کست‌باکس',  latin: 'CASTBOX',        href: '#' },
    { id: 'fidibo',        name: 'فیدیبو',    latin: 'FIDIBO',         href: '#' },
    { id: 'spotify',       name: 'اسپاتیفای', latin: 'SPOTIFY',        href: '#' },
    { id: 'youtube',       name: 'یوتیوب',    latin: 'YOUTUBE',        href: '#' }
  ];
  function picon(id, size) {
    size = size || 24;
    if (ICON_PATHS[id]) return '<svg class="picon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + ICON_PATHS[id] + '"/></svg>';
    return '<span class="picon picon--text" style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.62) + 'px" aria-hidden="true">ف</span>';
  }

  var HOSTS = [
    { sym: 'Ar', n: 1, tile: '', name: 'افسانه رشیدی‌زاده', role: 'میزبان — نگاه متخصص',
      bio: 'دکترای شیمی آلی از دانشگاه علم و صنعت ایران. کارشناس ارشد و مسئول فرمولاسیون داروهای تزریقی در واحد تحقیق و توسعهٔ یک شرکت داروسازی، با شش سال سابقه در صنعت دارو.',
      tags: ['شیمی آلی', 'فرمولاسیون دارو', 'تحقیق و توسعه'] },
    { sym: 'Oh', n: 2, tile: 'tile--navy', name: 'امید حاجی‌شکری', role: 'میزبان — نگاه کنجکاو',
      bio: 'کارشناسی مهندسی صنایع از دانشگاه صنعتی ارومیه. فعال در صنعت فناوری اطلاعات؛ ادمین Jira و طراح فرایندهای سازمانی.',
      tags: ['مهندسی صنایع', 'فناوری اطلاعات', 'طراحی فرایند'] }
  ];

  function hostsHTML() {
    return '<div class="hosts">' + HOSTS.map(function (h) {
      return '<article class="host">' +
        '<div class="tile host__tile ' + h.tile + '"><div class="tile__top"><span>' + pad(h.n) + '</span><span>میزبان</span></div><div class="tile__sym">' + h.sym + '</div><div class="tile__name">' + h.name.split(' ')[0] + '</div></div>' +
        '<div class="host__txt"><span class="meta">' + h.role + '</span><h3>' + h.name + '</h3><p>' + h.bio + '</p>' +
        '<div class="host__tags">' + h.tags.map(function (t) { return '<span class="chip">' + t + '</span>'; }).join('') + '</div></div></article>';
    }).join('') + '</div>';
  }

  function listenHTML() {
    return '<div class="listen">' + PLATFORMS.map(function (p) {
      return '<a class="listen__item" href="' + p.href + '">' + picon(p.id, 36) +
        '<span class="listen__txt"><span class="listen__small">شنیدن در</span><strong>' + p.name + '</strong></span>' +
        '<span class="listen__arrow" aria-hidden="true">←</span></a>';
    }).join('') + '</div>';
  }

  function platformLinks(size) {
    return PLATFORMS.map(function (p) {
      return '<a href="' + p.href + '" aria-label="' + p.name + '" title="' + p.name + '">' + picon(p.id, size || 20) + '</a>';
    }).join('');
  }
  // No seasons: one continuous run, a new episode every Tuesday.
  var MONTHS = { mehr: 'مهر ۱۴۰۵', shahrivar: 'شهریور ۱۴۰۵', mordad: 'مرداد ۱۴۰۵' };
  var UPCOMING = { 10: '۱۴ مهر', 11: '۲۱ مهر', 12: '۲۸ مهر' };
  var NEXT = { n: 10, day: 'سه‌شنبه', date: '۱۴ مهر' };
  function ep(n) { for (var i = 0; i < EPISODES.length; i++) if (EPISODES[i].n === +n) return EPISODES[i]; return EPISODES[0]; }

  function epNum(n) { return 'EP ' + pad(n); }
  function mins(len) { return fa(Math.round(secs(len) / 60)) + ' دقیقه'; }

  function tile(e, opts) {
    opts = opts || {};
    var variant = opts.variant || (e.tone ? 'tile--' + e.tone : '');
    var tag = opts.href ? 'a href="' + opts.href + '"' : 'div';
    var close = opts.href ? 'a' : 'div';
    return '<' + tag + ' class="tile ' + variant + ' ' + (opts.cls || '') + '" aria-label="' + e.title + '">' +
      '<div class="tile__top"><span>' + pad(e.n) + '</span><span></span></div>' +
      '<div class="tile__sym">' + e.sym + '</div>' +
      (opts.name === false ? '' : '<div><div class="tile__name">' + (opts.short !== undefined ? opts.short : e.obj) + '</div><div class="tile__mass latin">' + e.len + '</div></div>') +
      '</' + close + '>';
  }
  function emptyTile(n, label) {
    return '<div class="tile tile--empty" aria-label="اپیزودِ ' + fa(n) + '، به‌زودی">' +
      '<div class="tile__top"><span>' + pad(n) + '</span><span></span></div>' +
      '<div class="tile__sym">?</div>' +
      '<div><div class="tile__name">' + (label !== undefined ? label : (UPCOMING[n] || 'به‌زودی')) + '</div><div class="tile__mass">' + (UPCOMING[n] ? 'سه‌شنبه' : '—') + '</div></div></div>';
  }

  window.Jadval = { MONTHS: MONTHS, UPCOMING: UPCOMING, NEXT: NEXT, EPISODES: EPISODES, GROUPS: GROUPS, PLATFORMS: PLATFORMS, HOSTS: HOSTS, ep: ep, tile: tile, emptyTile: emptyTile, fa: fa, pad: pad, epNum: epNum, mins: mins, picon: picon, hostsHTML: hostsHTML, listenHTML: listenHTML, platformLinks: platformLinks };

  /* ---------------- Shared chrome ---------------- */
  var NAV = [
    ['home', 'خانه', 'pages/home.html'],
    ['episodes', 'اپیزودها', 'pages/episodes.html'],
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
      '<div class="mobile-menu__foot"><span class="label">شنیدن در</span><div class="picons">' + platformLinks(24) + '</div></div></div>';
  }

  function footer() {
    var el = document.querySelector('[data-footer]');
    if (!el) return;
    el.outerHTML =
      '<footer class="site-footer"><div class="wrap site-footer__grid">' +
      '<div class="stack gap-3">' + logo(true) + '<span class="logo-latin latin" style="opacity:.6">JADVAL</span>' +
      '<p style="max-width:34ch;font-size:15px;line-height:1.9;opacity:.75">شیمیِ چیزهایی که هر روز باهاشون زندگی می‌کنیم.</p></div>' +
      '<nav aria-label="پادکست"><h4>پادکست</h4><a href="' + BASE + 'pages/episodes.html">اپیزودها</a><a href="' + BASE + 'pages/about.html">دربارهٔ ما</a><a href="' + BASE + 'pages/contact.html">تماس</a></nav>' +
      '<nav aria-label="شنیدن"><h4>شنیدن</h4>' + PLATFORMS.map(function (p) { return '<a href="' + p.href + '" class="flink">' + picon(p.id, 16) + p.name + '</a>'; }).join('') + '<a href="#" class="flink latin">RSS</a></nav>' +
      '</div><div class="site-footer__bar"><div class="wrap"><span>© ۱۴۰۵ JADVAL</span><span class="latin">SAAKHTEH SHODEH BA KONJKAVI</span></div></div></footer>';
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
    miniEl.querySelector('[data-mini-meta]').textContent = epNum(e.n) + ' — ' + e.date;
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
