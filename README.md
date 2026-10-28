# عنصر ۱۱۹ — طراحیِ سایتِ پادکست

طراحیِ ظاهریِ سایتِ پادکستِ «عنصر ۱۱۹» (نامِ قبلی: جدول؛ شیمیِ چیزهایی که هر روز باهاشون زندگی می‌کنیم). صفحه‌های HTMLِ ایستا برای بازبینی؛ هنوز سایتِ نهایی نیست.

- **دیدن:** https://omidhaji.github.io/jadval/
- **مستندِ طراحی:** [`docs/DESIGN.md`](docs/DESIGN.md)
- **تاریخچه:** [`docs/CHANGELOG.md`](docs/CHANGELOG.md)
- **نسخهٔ با گروه‌بندی (آرشیو):** [`docs/v2-groups.md`](docs/v2-groups.md) · `archive/v2-groups/`

## اجرای محلی

صفحه‌ها HTMLِ ساده‌اند و build ندارند؛ فقط با یک سرورِ محلی باز شوند:

- `node tools/rserve.js` → http://localhost:8767/ (با پشتیبانیِ Range، تا جابه‌جایی در پلیر کار کند)
- یا `python -m http.server 8000` → http://localhost:8000/ (جابه‌جایی در فایلِ نمونه ممکن است کار نکند)

بدونِ اینترنت: فونت‌ها (Google Fonts) و صدای اپیزودِ ۱ (از ربط) نمی‌آیند؛ بقیه کار می‌کند.

**اپیزودِ تازه:** یک خط در آرایهٔ `EPISODES` در `assets/js/jadval.js`. فیلدِ `audio` = دو نشانیِ `enclosure url` همان اپیزود، به این ترتیب: اول از فیدِ ایرانی (`https://api.rabt.host/podcasts/70f8b309-1f6a-47b0-90d9-70d80b940ebe/rss`، نشانیِ `play.rabt.host/...`)، بعد از [فیدِ Cloudflare](https://player.rabt.space/p/70f8b309-1f6a-47b0-90d9-70d80b940ebe.xml) (نشانیِ `player.rabt.space/...`). دقیقاً همان لینک‌های `play.mp3`، تا ربط شنیدن را بشمارد. دو نشانی فقط در دامنه فرق دارند. `tone`: `''` زرشکی، `'navy'`، `'cream'`، `'black'`. فیلدِ `video`: شناسهٔ ویدیو در یوتیوب (بعد از `youtu.be/`)؛ نشانیِ کانال در `YT_CHANNEL`.

## تست‌ها (`tools/`)

نیاز: Node.js و Playwright (`npm i -g playwright`، `npx playwright install chromium`).

```
node tools/rserve.js            # در ترمینالِ جدا
node tools/make-test-audio.js   # یک بار؛ فایلِ صوتیِ بلندِ محلی برای تست
node tools/ptest.js             # ۴۰ سناریوی پلیر (لینکِ ربط به فایلِ محلی هدایت می‌شود تا آمار دست نخورد)
node tools/fabt.js              # ۱۴ تستِ دکمهٔ شناور
node tools/vtest.js             # ۱۷ تستِ ویدیو (یوتیوب شبیه‌سازی می‌شود)
node tools/srctest.js           # ۱۵ تستِ جابه‌جاییِ نشانیِ صدا (ایران / خارج؛ ربط شبیه‌سازی می‌شود)
node tools/realplay2.js         # پخشِ واقعی از ربط (اینترنت لازم؛ یک شنیدن در آمار ثبت می‌شود)
```
