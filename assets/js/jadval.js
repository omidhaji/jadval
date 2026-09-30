/* جدول — design prototype behaviour.
   Renders the shared chrome (header, mobile menu, footer, mini player) and a
   real HTML5 audio player. In the real build, audio + metadata come from the
   Acast RSS feed; in this prototype every episode plays one short sample. */
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
    { n: 7, sym: 'Ef', obj: 'قرص', tone: '', g: 'pharma', month: 'shahrivar', len: '22:30', date: 'سه‌شنبه ۲۴ شهریور ۱۴۰۵', title: 'قرصِ جوشان چرا جوش می‌آید؟', desc: 'یک لیوان آب، دو پودرِ خشک، و گازی که تا لحظه‌ای پیش در کار نبود.' },
    { n: 8, sym: 'Na', obj: 'نمک', tone: 'navy', g: 'life', month: 'shahrivar', len: '25:48', date: 'سه‌شنبه ۳۱ شهریور ۱۴۰۵', title: 'نمک چطور یخِ جاده را آب می‌کند؟', desc: 'نمک یخ را گرم نمی‌کند؛ نقطهٔ ذوبش را جابه‌جا می‌کند.' },
    { n: 9, sym: 'Ap', obj: 'سیب', tone: 'cream', g: 'food', month: 'mehr', len: '21:55', date: 'سه‌شنبه ۷ مهر ۱۴۰۵', title: 'چرا سیبِ بریده قهوه‌ای می‌شود؟', desc: 'اکسیژن، یک آنزیم، و چند دقیقه صبر؛ همین برای قهوه‌ای‌شدن کافی است.' }
  ];
  var ICON_PATHS = {"applepodcasts": "M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59.12 2.2.007 2.864a8.506 8.506 0 01-3.24 5.296c-.608.46-2.096 1.261-2.336 1.261-.088 0-.096-.091-.056-.46.072-.592.144-.715.48-.856.536-.224 1.448-.874 2.008-1.435a7.644 7.644 0 002.008-3.536c.208-.824.184-2.656-.048-3.504-.728-2.696-2.928-4.792-5.624-5.352-.784-.16-2.208-.16-3 0-2.728.56-4.984 2.76-5.672 5.528-.184.752-.184 2.584 0 3.336.456 1.832 1.64 3.512 3.192 4.512.304.2.672.408.824.472.336.144.408.264.472.856.04.36.03.464-.056.464-.056 0-.464-.176-.896-.384l-.04-.03c-2.472-1.216-4.056-3.274-4.632-6.012-.144-.706-.168-2.392-.03-3.04.36-1.74 1.048-3.1 2.192-4.304 1.648-1.737 3.768-2.656 6.128-2.656zm.134 2.81c.409.004.803.04 1.106.106 2.784.62 4.76 3.408 4.376 6.174-.152 1.114-.536 2.03-1.216 2.88-.336.43-1.152 1.15-1.296 1.15-.023 0-.048-.272-.048-.603v-.605l.416-.496c1.568-1.878 1.456-4.502-.256-6.224-.664-.67-1.432-1.064-2.424-1.246-.64-.118-.776-.118-1.448-.008-1.02.167-1.81.562-2.512 1.256-1.72 1.704-1.832 4.342-.264 6.222l.413.496v.608c0 .336-.027.608-.06.608-.03 0-.264-.16-.512-.36l-.034-.011c-.832-.664-1.568-1.842-1.872-2.997-.184-.698-.184-2.024.008-2.72.504-1.878 1.888-3.335 3.808-4.019.41-.145 1.133-.22 1.814-.211zm-.13 2.99c.31 0 .62.06.844.178.488.253.888.745 1.04 1.259.464 1.578-1.208 2.96-2.72 2.254h-.015c-.712-.331-1.096-.956-1.104-1.77 0-.733.408-1.371 1.112-1.745.224-.117.534-.176.844-.176zm-.011 4.728c.988-.004 1.706.349 1.97.97.198.464.124 1.932-.218 4.302-.232 1.656-.36 2.074-.68 2.356-.44.39-1.064.498-1.656.288h-.003c-.716-.257-.87-.605-1.164-2.644-.341-2.37-.416-3.838-.218-4.302.262-.616.974-.966 1.97-.97z", "castbox": "M12 0c-.29 0-.58.068-.812.206L2.417 5.392c-.46.272-.804.875-.804 1.408v10.4c0 .533.344 1.135.804 1.407l8.77 5.187c.465.275 1.162.275 1.626 0l8.77-5.187c.46-.272.804-.874.804-1.407V6.8c0-.533-.344-1.136-.804-1.408L12.813.206A1.618 1.618 0 0012 0zm-.85 8.304c.394 0 .714.303.714.676v2.224c0 .207.191.375.427.375s.428-.168.428-.375V9.57c0-.373.32-.675.713-.675.394 0 .712.302.712.675v4.713c0 .374-.318.676-.712.676-.394 0-.713-.302-.713-.676v-1.31c0-.206-.192-.374-.428-.374s-.427.168-.427.374v1.226c0 .374-.32.676-.713.676-.394 0-.713-.302-.713-.676v-1.667c0-.207-.192-.375-.428-.375-.235 0-.427.168-.427.375v3.31c0 .373-.319.676-.712.676-.394 0-.713-.303-.713-.676v-2.427c0-.206-.191-.374-.428-.374-.235 0-.427.168-.427.374v.178a.71.71 0 01-.712.708.71.71 0 01-.713-.708v-2.123a.71.71 0 01.713-.708.71.71 0 01.712.708v.178c0 .206.192.373.427.373.237 0 .428-.167.428-.373v-1.53c0-.374.32-.676.713-.676.393 0 .712.303.712.676v.646c0 .206.192.374.427.374.236 0 .428-.168.428-.374V8.98c0-.373.319-.676.713-.676zm4.562 2.416c.393 0 .713.302.713.676v2.691c0 .374-.32.676-.713.676-.394 0-.712-.303-.712-.676v-2.691c0-.374.319-.676.712-.676zm2.28 1.368c.395 0 .713.303.713.676v.67c0 .374-.318.676-.712.676-.394 0-.713-.302-.713-.675v-.67c0-.374.32-.677.713-.677Z", "spotify": "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z", "youtube": "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", "telegram": "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z", "instagram": "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077", "x": "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"};

  // Where to listen. Fidibo has no public icon set; its mark is a placeholder until the official asset is supplied.
  var PLATFORMS = [
    { id: 'applepodcasts', name: 'اپل پادکست', en: 'Apple Podcasts', href: '#' },
    { id: 'castbox',       name: 'کست‌باکس',  en: 'Castbox',        href: '#' },
    { id: 'fidibo',        name: 'فیدیبو',    en: 'Fidibo',         href: '#' },
    { id: 'spotify',       name: 'اسپاتیفای', en: 'Spotify',        href: '#' },
    { id: 'youtube',       name: 'یوتیوب',    en: 'YouTube',        href: '#' }
  ];
  // Social accounts (footer only). Handles are placeholders until the real ones are supplied.
  var SOCIALS = [
    { id: 'telegram',  name: 'تلگرام',     handle: '@jadvalfm',  href: '#' },
    { id: 'instagram', name: 'اینستاگرام', handle: '@jadval.fm', href: '#' },
    { id: 'x',         name: 'ایکس',       handle: '@jadvalfm',  href: '#' }
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
      '<div><div class="tile__name">' + (label !== undefined ? label : 'به‌زودی') + '</div><div class="tile__mass">—</div></div></div>';
  }

  window.Jadval = { MONTHS: MONTHS, EPISODES: EPISODES, GROUPS: GROUPS, PLATFORMS: PLATFORMS, HOSTS: HOSTS, ep: ep, tile: tile, emptyTile: emptyTile, fa: fa, pad: pad, epNum: epNum, mins: mins, picon: picon, hostsHTML: hostsHTML, listenHTML: listenHTML, platformLinks: platformLinks };

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
      '<div class="stack gap-3">' + logo(true) +
      '<p style="max-width:34ch;font-size:15px;line-height:1.9;opacity:.75">شیمیِ چیزهایی که هر روز باهاشون زندگی می‌کنیم.</p></div>' +
      '<nav aria-label="پادکست"><h4>پادکست</h4><a href="' + BASE + 'pages/episodes.html">اپیزودها</a><a href="' + BASE + 'pages/about.html">دربارهٔ ما</a><a href="' + BASE + 'pages/contact.html">تماس</a></nav>' +
      '<nav aria-label="شنیدن"><h4>شنیدن</h4>' + PLATFORMS.map(function (p) { return '<a href="' + p.href + '" class="flink">' + picon(p.id, 16) + '<span class="latin">' + p.en + '</span></a>'; }).join('') + '<a href="#" class="flink latin">RSS</a></nav>' +
      '<nav aria-label="دنبال کنید"><h4>دنبال کنید</h4>' + SOCIALS.map(function (x) { return '<a href="' + x.href + '" class="flink" aria-label="' + x.name + ' ' + x.handle + '">' + picon(x.id, 16) + '<span class="flink__handle latin">' + x.handle + '</span></a>'; }).join('') + '</nav>' +
      '</div><div class="site-footer__bar"><div class="wrap"><span>© ۱۴۰۵ جدول. همهٔ حقوق محفوظ است.</span><span>ساخته‌شده با کنجکاویِ یک بچه‌شیطون</span></div></div></footer>';
  }

  function menu() {
    var b = document.querySelector('[data-burger]');
    if (!b) return;
    b.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------- Player ----------------
     One HTMLAudioElement drives every player UI on the page (the mini player
     and any full player). The UI keeps no clock of its own: it renders from
     the element's state and events, so the controls can't drift out of sync.
     Acast rules, so every listen is counted and monetised: the enclosure URL
     is used as-is, nothing is fetched before a click (preload="none"), and
     nothing starts on its own (no autoplay, no auto-advance). */
  var SEGS = 48;
  var RATES = [1, 1.25, 1.5, 2];
  var SKIP_BACK = 15, SKIP_FWD = 30;
  // Prototype only: every episode points at one short sample file. The real
  // build uses each item's <enclosure url> from the Acast feed.
  var SAMPLE_AUDIO = BASE + 'assets/audio/sample.mp3';

  var audio = new Audio();
  audio.preload = 'none';
  var cur = null;           // current episode
  var status = 'idle';      // idle | loading | playing | paused | ended | error
  var errorMsg = '';
  var pendingSeek = null;   // seconds to apply once metadata is known
  var scrub = null;         // { bar, sec } while a progress bar is dragged
  var lastSave = 0;
  var statusKey = '';
  var miniEl;

  var store = {
    read: function () { try { return JSON.parse(localStorage.getItem('jadval-player') || '{}') || {}; } catch (e) { return {}; } },
    write: function (v) { try { localStorage.setItem('jadval-player', JSON.stringify(v)); } catch (e) {} }
  };
  var saved = store.read();  // { last, rate, pos: { [episode]: seconds } }
  if (!saved.pos || typeof saved.pos !== 'object') saved.pos = {};

  function segs(dark) {
    var h = '';
    for (var i = 0; i < SEGS; i++) h += '<i></i>';
    return '<div class="segbar' + (dark ? ' segbar--dark' : '') + '" data-seek role="slider" aria-label="پیشرفتِ اپیزود" tabindex="0">' + h + '</div>';
  }
  function mini() {
    var el = document.createElement('div');
    el.className = 'miniplayer';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'پخش‌کننده');
    // RTL order, right → left: close · episode · back/forward/speed · progress · play.
    el.innerHTML =
      '<div class="miniplayer__in">' +
      '<button class="pbtn miniplayer__close" data-close aria-label="بستن">×</button>' +
      '<div class="miniplayer__info"><div data-mini-tile></div><div class="miniplayer__txt"><strong data-mini-title></strong><span data-mini-meta></span><span class="miniplayer__status" data-status role="status" aria-live="polite"></span></div></div>' +
      '<div class="miniplayer__ctrls"><button class="pbtn hide-sm" data-skip="-' + SKIP_BACK + '" aria-label="۱۵ ثانیه عقب">−۱۵</button><button class="pbtn hide-sm" data-skip="' + SKIP_FWD + '" aria-label="۳۰ ثانیه جلو">+۳۰</button>' +
      '<button class="pbtn pbtn--txt" data-rate aria-label="سرعت پخش">۱×</button></div>' +
      '<div class="miniplayer__bar"><div class="player__time"><span data-elapsed>00:00</span><span data-total>00:00</span></div>' + segs(true) + '</div>' +
      '<button class="pmain" data-toggle aria-label="پخش"><span class="play-icon"></span></button></div>';
    document.body.appendChild(el);
    // Collapsed state: a floating button, bottom-left, that opens the player.
    fabEl = document.createElement('button');
    fabEl.className = 'player-fab';
    fabEl.setAttribute('data-open-player', '');
    fabEl.setAttribute('aria-label', 'باز کردنِ پخش‌کننده');
    fabEl.innerHTML = '<span class="play-icon"></span><span class="player-fab__sym latin" data-fab-sym></span>';
    document.body.appendChild(fabEl);
    return el;
  }
  var fabEl;

  /* ---- state helpers ---- */
  function audioUrl(e) { return e.audio || SAMPLE_AUDIO; }
  function duration() {
    if (!cur) return 0;
    return isFinite(audio.duration) && audio.duration > 0 ? audio.duration : secs(cur.len);
  }
  function position() {
    if (scrub) return scrub.sec;
    if (pendingSeek !== null) return pendingSeek;
    return audio.currentTime || 0;
  }
  function nextEpisode() {
    for (var i = 0; cur && i < EPISODES.length; i++) if (EPISODES[i].n === cur.n + 1) return EPISODES[i];
    return null;
  }
  function ownerOf(el) { var o = el.closest('[data-fullplayer]'); return o ? +o.getAttribute('data-fullplayer') : null; }
  function isMine(el) { var o = ownerOf(el); return !!cur && (o === null || o === cur.n); }
  function inPlayer(el) { return !!el.closest('.miniplayer:not(.is-static), [data-fullplayer]'); }
  function rateLabel(r) { return fa(String(r).replace('.', '٫')) + '×'; }

  function persist(force) {
    if (!cur) return;
    var now = Date.now();
    if (!force && now - lastSave < 5000) return;
    lastSave = now;
    var p = position(), d = duration();
    // The last seconds count as finished: next time the episode starts from the top.
    if (status === 'ended' || (d && p > d - 15)) delete saved.pos[cur.n];
    else if (p > 5) saved.pos[cur.n] = Math.round(p);
    saved.last = cur.n;
    saved.rate = audio.playbackRate;
    store.write(saved);
  }

  /* ---- commands ---- */
  // quiet: load the episode without opening the player (page load, ?t= links).
  function setEpisode(n, quiet) {
    var e = ep(n);
    if (cur && cur.n === e.n) { if (!quiet) openMini(); return; }
    if (cur) persist(true);
    cur = e;
    status = 'idle';
    audio.src = audioUrl(e);   // preload="none": nothing is fetched until play()
    audio.playbackRate = audio.defaultPlaybackRate = saved.rate || 1;
    pendingSeek = saved.pos[e.n] || null;
    miniEl.querySelector('[data-mini-tile]').innerHTML = tile(e, { name: false, cls: 'tile-sm' });
    miniEl.querySelector('[data-mini-title]').textContent = e.title;
    miniEl.querySelector('[data-mini-meta]').textContent = epNum(e.n) + ' — ' + e.date;
    fabEl.querySelector('[data-fab-sym]').textContent = e.sym;
    fabEl.title = e.title;
    if (!quiet) openMini();
    mediaSessionMeta();
    render();
  }

  function play(n) {
    if (n !== undefined && (!cur || cur.n !== +n)) setEpisode(n);
    if (!cur) return;
    if (status === 'ended') seek(0);
    status = 'loading';
    render();
    var p = audio.play();
    if (p && p.catch) p.catch(function (err) {
      if (err && err.name === 'AbortError') return;   // superseded by a newer play/pause/src
      fail(err && err.name === 'NotAllowedError' ? 'مرورگر اجازهٔ پخش نداد؛ دوباره بزن.' : 'فایلِ صوتی بارگذاری نشد.');
    });
  }
  function pause() { if (cur && !audio.paused) audio.pause(); }
  function toggle(n) {
    if (n !== undefined && (!cur || cur.n !== +n)) return play(n);
    if (!cur) return;
    if (status === 'playing' || status === 'loading') pause(); else play();
  }
  function seek(sec) {
    if (!cur) return;
    sec = Math.max(0, Math.min(duration(), sec || 0));
    if (audio.readyState >= 1) { audio.currentTime = sec; pendingSeek = null; }
    else pendingSeek = sec;
    if (status === 'ended') status = 'paused';
    persist(true);
    render();
  }
  function skip(d) { seek(position() + d); }
  function cycleRate() {
    var i = RATES.indexOf(audio.playbackRate);
    var r = RATES[(i + 1) % RATES.length];
    audio.playbackRate = audio.defaultPlaybackRate = r;
    saved.rate = r; store.write(saved);
    render();
  }
  function retry() {
    var p = position();
    errorMsg = '';
    audio.src = audioUrl(cur);
    pendingSeek = p || null;
    play();
  }
  function fail(msg) { status = 'error'; errorMsg = msg; render(); }

  // The player never opens by itself on page load; it opens on a play click or
  // from the floating button, and closing it only collapses it back to that button.
  function openMini() {
    miniEl.classList.add('is-open');
    fabEl.classList.add('is-hidden');
    document.documentElement.style.setProperty('--player-h', (window.innerWidth < 900 ? 68 : 72) + 'px');
  }
  function closeMini() {
    pause(); persist(true);
    miniEl.classList.remove('is-open');
    fabEl.classList.remove('is-hidden');
    document.documentElement.style.setProperty('--player-h', '0px');
  }
  function openFromFab() {
    if (!cur) setEpisode(LATEST.n, true);
    openMini();
    var b = miniEl.querySelector('.pmain');
    if (b) b.focus();
  }

  function shareAt(btn) {
    var own = ownerOf(btn);
    var t = cur && (own === null || own === cur.n) ? Math.floor(position()) : 0;
    var url = location.href.split('#')[0].split('?')[0] + '?t=' + t;
    var label = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', label);
    function done() { btn.textContent = 'کپی شد'; setTimeout(function () { btn.textContent = label; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt('لینک:', url); });
    else window.prompt('لینک:', url);
  }

  /* ---- lock screen, headphones, media keys ---- */
  function mediaSessionMeta() {
    if (!('mediaSession' in navigator) || !cur) return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: cur.title, artist: 'جدول', album: 'پادکستِ جدول',
        artwork: [{ src: new URL(BASE + 'assets/img/favicon.svg', location.href).href, sizes: '512x512', type: 'image/svg+xml' }]
      });
    } catch (e) {}
    var h = {
      play: function () { play(); }, pause: pause, stop: pause,
      seekbackward: function (d) { skip(-((d && d.seekOffset) || SKIP_BACK)); },
      seekforward: function (d) { skip((d && d.seekOffset) || SKIP_FWD); },
      seekto: function (d) { if (d && d.seekTime !== undefined) seek(d.seekTime); }
    };
    Object.keys(h).forEach(function (k) { try { navigator.mediaSession.setActionHandler(k, h[k]); } catch (e) {} });
  }
  function mediaSessionPosition() {
    if (!('mediaSession' in navigator) || !cur) return;
    try { navigator.mediaSession.playbackState = status === 'playing' ? 'playing' : 'paused'; } catch (e) {}
    var d = duration();
    if (!d || !navigator.mediaSession.setPositionState || !isFinite(audio.duration)) return;
    try { navigator.mediaSession.setPositionState({ duration: d, playbackRate: audio.playbackRate, position: Math.min(position(), d) }); } catch (e) {}
  }

  /* ---- render: every player UI reflects the single audio element ---- */
  function render() {
    var active = status === 'playing' || status === 'loading';
    var d = duration(), p = position();
    var on = d ? Math.floor(Math.min(1, p / d) * SEGS) : 0;

    document.querySelectorAll('[data-seek]').forEach(function (bar) {
      if (!inPlayer(bar)) return;
      var mine = isMine(bar);
      var own = ownerOf(bar);
      var tot = mine ? d : (own ? secs(ep(own).len) : 0);
      var now = mine ? p : 0;
      bar.classList.toggle('is-loading', mine && status === 'loading');
      bar.querySelectorAll('i').forEach(function (s, i) {
        s.className = mine && i < on ? 'on' : (mine && i === on && p > 0 && on < SEGS ? 'head' : '');
      });
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', String(Math.round(tot)));
      bar.setAttribute('aria-valuenow', String(Math.round(now)));
      bar.setAttribute('aria-valuetext', fa(clock(now)) + ' از ' + fa(clock(tot)));
    });
    document.querySelectorAll('[data-elapsed]').forEach(function (x) { x.textContent = isMine(x) ? clock(p) : '00:00'; });
    document.querySelectorAll('[data-total]').forEach(function (x) {
      var own = ownerOf(x);
      x.textContent = isMine(x) ? clock(d) : (own ? ep(own).len : '00:00');
    });
    document.querySelectorAll('[data-toggle]').forEach(function (b) {
      if (!inPlayer(b)) return;
      var here = isMine(b) && active;
      var want = here ? 'pause-icon' : 'play-icon';
      var ic = b.querySelector('span');
      if (!ic || ic.className !== want) b.innerHTML = '<span class="' + want + '"></span>';
      b.setAttribute('aria-label', here ? 'توقف' : 'پخش');
      b.classList.toggle('is-loading', isMine(b) && status === 'loading');
    });
    document.querySelectorAll('[data-play]').forEach(function (b) {
      var here = !!cur && +b.getAttribute('data-play') === cur.n && active;
      b.classList.toggle('is-playing', here);
      b.setAttribute('aria-pressed', here ? 'true' : 'false');
      var ic = b.querySelector('.play-icon, .pause-icon');
      if (ic) ic.className = here ? 'pause-icon' : 'play-icon';
      var lb = b.querySelector('[data-play-label]');
      if (lb) lb.textContent = here ? 'توقف' : lb.getAttribute('data-play-label');
    });
    document.querySelectorAll('[data-rate]').forEach(function (b) { if (inPlayer(b)) b.textContent = rateLabel(audio.playbackRate); });

    if (miniEl && cur) {
      var nx = nextEpisode();
      var key = status + '|' + errorMsg + '|' + (nx ? nx.n : '');
      miniEl.classList.toggle('is-error', status === 'error');
      miniEl.classList.toggle('is-ended', status === 'ended');
      if (key !== statusKey) {   // rewrite only on change so buttons keep focus/hover
        statusKey = key;
        miniEl.querySelector('[data-status]').innerHTML =
          status === 'error' ? errorMsg + ' <button class="pnext" data-retry>تلاشِ دوباره</button>' :
          status === 'ended' ? 'تمام شد.' + (nx ? ' <button class="pnext" data-play="' + nx.n + '">پخشِ اپیزودِ بعدی</button>' : '') : '';
      }
    }
    mediaSessionPosition();
  }

  /* ---- audio element events ---- */
  function bindAudio() {
    audio.addEventListener('loadedmetadata', function () {
      if (pendingSeek !== null) {
        var t = pendingSeek;
        // Prototype only: the sample is shorter than the episode, so map
        // episode time (chapters, ?t=) proportionally onto it.
        if (cur && !cur.audio && secs(cur.len) > audio.duration && t > audio.duration) t = t * audio.duration / secs(cur.len);
        try { audio.currentTime = Math.min(t, audio.duration); } catch (e) {}
        pendingSeek = null;
      }
      render();
    });
    audio.addEventListener('play', function () { if (status !== 'playing') status = 'loading'; render(); });
    audio.addEventListener('playing', function () { status = 'playing'; render(); });
    audio.addEventListener('waiting', function () { if (!audio.paused) { status = 'loading'; render(); } });
    audio.addEventListener('pause', function () { if (status !== 'ended' && status !== 'error') status = 'paused'; persist(true); render(); });
    audio.addEventListener('ended', function () { status = 'ended'; persist(true); render(); });
    audio.addEventListener('timeupdate', function () { persist(false); render(); });
    audio.addEventListener('ratechange', render);
    audio.addEventListener('error', function () { if (audio.getAttribute('src')) fail('فایلِ صوتی بارگذاری نشد.'); });
    window.addEventListener('pagehide', function () { persist(true); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) persist(true); });
  }

  /* ---- clicks, dragging, keyboard ---- */
  function fracAt(bar, x) {
    var r = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (x - r.left) / r.width));   // progress runs left → right
  }
  function adopt(el) {   // a full player for another episode takes over the audio
    var own = ownerOf(el);
    if (own !== null && (!cur || cur.n !== own)) setEpisode(own);
  }

  function bindUI() {
    document.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-play],[data-toggle],[data-skip],[data-rate],[data-close],[data-retry],[data-share-time],[data-open-player]');
      if (!t) return;
      if (t.hasAttribute('data-open-player')) return openFromFab();
      if (t.hasAttribute('data-play')) { ev.preventDefault(); return toggle(+t.getAttribute('data-play')); }
      if (!inPlayer(t)) return;
      if (t.hasAttribute('data-toggle')) { var own = ownerOf(t); return own !== null ? toggle(own) : toggle(); }
      if (t.hasAttribute('data-share-time')) { ev.preventDefault(); return shareAt(t); }
      if (t.hasAttribute('data-retry')) return retry();
      if (t.hasAttribute('data-close')) return closeMini();
      adopt(t);
      if (t.hasAttribute('data-skip')) return skip(+t.getAttribute('data-skip'));
      if (t.hasAttribute('data-rate')) return cycleRate();
    });

    document.addEventListener('pointerdown', function (ev) {
      var bar = ev.target.closest('[data-seek]');
      if (!bar || !inPlayer(bar) || ev.button > 0) return;
      adopt(bar);
      if (!cur) return;
      ev.preventDefault();
      try { bar.setPointerCapture(ev.pointerId); } catch (e) {}
      scrub = { bar: bar, sec: fracAt(bar, ev.clientX) * duration() };
      bar.classList.add('is-scrubbing');
      render();
    });
    document.addEventListener('pointermove', function (ev) {
      if (!scrub) return;
      scrub.sec = fracAt(scrub.bar, ev.clientX) * duration();
      render();
    });
    function endScrub(commit) {
      if (!scrub) return;
      var s = scrub.sec;
      scrub.bar.classList.remove('is-scrubbing');
      scrub = null;
      if (commit) seek(s); else render();
    }
    document.addEventListener('pointerup', function () { endScrub(true); });
    document.addEventListener('pointercancel', function () { endScrub(false); });

    document.addEventListener('keydown', function (ev) {
      var bar = ev.target.closest && ev.target.closest('[data-seek]');
      if (bar && inPlayer(bar)) {
        // The timeline runs left → right, so the right arrow moves forward.
        var step = { ArrowRight: 5, ArrowLeft: -5, ArrowUp: 5, ArrowDown: -5, PageUp: 30, PageDown: -30 }[ev.key];
        if (step === undefined && ev.key !== 'Home' && ev.key !== 'End') return;
        ev.preventDefault();
        adopt(bar);
        if (ev.key === 'Home') seek(0); else if (ev.key === 'End') seek(duration()); else skip(step);
        return;
      }
      // Space toggles playback unless focus is on something that uses it.
      if (ev.key === ' ' && cur && miniEl.classList.contains('is-open') && !ev.repeat) {
        var tag = (ev.target.tagName || '').toLowerCase();
        if (/^(input|textarea|select|button|a|summary)$/.test(tag) || ev.target.isContentEditable) return;
        ev.preventDefault();
        toggle();
      }
    });
  }

  /* On load the player stays collapsed to the floating button, with the last
     episode cued where it was left (never auto-plays, never auto-opens).
     ?t=SECONDS on an episode page cues that episode at that time instead. */
  function restore() {
    var full = document.querySelector('[data-fullplayer]');
    var m = /[?&]t=(\d+)/.exec(location.search);
    if (full && m) { setEpisode(+full.getAttribute('data-fullplayer'), true); pendingSeek = +m[1]; render(); return; }
    if (saved.last) setEpisode(saved.last, true);
  }

  function fullPlayers() {
    document.querySelectorAll('[data-segs]').forEach(function (x) { x.outerHTML = segs(false); });
    document.querySelectorAll('[data-fullplayer] [data-download]').forEach(function (a) {
      a.href = audioUrl(ep(ownerOf(a)));
      a.setAttribute('download', '');
    });
  }

  window.Jadval.player = {
    // Cue an episode at a time; play only when the caller is handling a click.
    cue: function (n, sec, andPlay) {
      setEpisode(n);
      // Prototype only: map episode time onto the shorter sample once it is loaded.
      if (!cur.audio && isFinite(audio.duration) && secs(cur.len) > audio.duration) sec = sec * audio.duration / secs(cur.len);
      seek(sec);
      if (andPlay && status !== 'playing') play();
    },
    toggle: toggle
  };

  document.addEventListener('DOMContentLoaded', function () {
    header(); footer(); menu();
    fullPlayers();
    miniEl = mini();
    bindAudio(); bindUI(); restore(); render();
    document.dispatchEvent(new CustomEvent('jadval:ready'));
  });
})();
