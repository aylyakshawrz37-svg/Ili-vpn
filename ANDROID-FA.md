# 📱 راهنمای ساخت فایل APK برای اپ ایلیا (ILIA VPN)

> دو مسیر داری:
> **مسیر ۱ — همین رابط به APK تبدیل بشه:** با Capacitor، حدود ۱۰ دقیقه، فقط ظاهر و تعاملات UI (دکمه اتصال شبیه‌سازی است).
> **مسیر ۲ — فیلترشکن واقعی مثل v2rayNG که کانفیگ‌ها رو واقعاً وصل کنه:** اپ باید نیتیو (Kotlin + هسته Xray) باشه؛ توضیح انتهای همین فایل.

---

## ✅ پیش‌نیازهای مسیر ۱ (روی کامپیوتر)

1. **Node.js نسخه ۲۲ به بالا** — https://nodejs.org (نسخه LTS)
2. **JDK نسخه ۲۱** — موقع نصب Android Studio قابل نصب است
3. **Android Studio** — https://developer.android.com/studio
   - موقع اولین اجرا، نصب پیش‌فرض SDK رو بزن (Android SDK Platform و Build-Tools).

---

## 🛠️ ساخت APK روی کامپیوتر

داخل پوشه پروژه این دستورها رو به ترتیب در ترمینال اجرا کن:

```bash
# ۱) نصب پکیج‌ها
npm install

# ۲) ساخت خروجی وب (پوشه dist)
npm run build

# ۳) ساخت پروژه اندروید (فقط دفعه اول)
npx cap add android

# ۴) کپی فایل‌های وب داخل پروژه اندروید
npx cap sync android
```

### الف) ساخت با Android Studio (راحت‌تر)

```bash
npx cap open android
```

- منتظر بمون Gradle Sync تموم بشه.
- از منو: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- بعد از اتمام، روی اعلان «locate» بزن؛ فایل اینجاست:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

### ب) ساخت فقط با خط فرمان (بدون باز کردن Android Studio)

```bash
cd android
./gradlew assembleDebug
# ویندوز:
gradlew.bat assembleDebug
```

همان فایل `app-debug.apk` ساخته می‌شود.

### نصب روی گوشی

1. فایل APK رو با کابل/تلگرام Saved Messages/بلوتوث به گوشی منتقل کن.
2. روی گوشی بازش کن؛ اندروید می‌گه **«نصب از منابع ناشناس»** — اجازه بده.
3. نصب کن و بازش کن. 🎉

> برای انتشار در بازار (مایکت/بازار/گوگل‌پلی) باید APK امضاشده بسازی:
> Android Studio → **Build → Generate Signed Bundle / APK** و یک Keystore بسازه و ازش محافظت کن.

---

## ☁️ ساخت APK بدون کامپیوتر — فقط با گوشی (GitHub Actions)

این پروژه یک فایل اتوماسیون دارد: `.github/workflows/build-apk.yml`

1. یک حساب رایگان در **github.com** بساز و یک مخزن (Repository) جدید بساز.
2. همه فایل‌های پروژه رو در مخزن آپلود کن (گزینه **Add file → Upload files**).
3. وارد تب **Actions** شو؛ ساخت APK خودش شروع میشه (یا دستی روی **Run workflow** بزن).
4. بعد از حدود ۴ تا ۷ دقیقه، روی اجرای تمام‌شده بزن و فایل **ILIA-debug-apk** رو دانلود کن (داخلش `app-debug.apk` است).
5. روی گوشی نصبش کن.

---

## 🎨 نام اپ، آیکون و شناسه

- **نام و شناسه:** فایل `capacitor.config.ts`
  - `appName: "ILIA"` (نام نمایشی روی گوشی)
  - `appId: "app.ilia.vpn"` (شناسه یکتا — بعد از انتشار عوضش نکن)
- **آیکون:** یک تصویر مربعی ۱۰۲۴×۱۰۲۴ در مسیر `assets/icon.png` بذار، بعد:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --android
npx cap sync android
```

---

## 🔴 مسیر ۲: ساخت فیلترشکن واقعی (تونل واقعی ترافیک)

Capacitor فقط یک WebView است و اندروید به صفحات وب اجازه ساخت تونل VPN یا اجرای هسته Xray را نمی‌دهد؛
بنابراین دکمه اتصال در این نسخه، **شبیه‌سازی** است. یک VPN واقعی مثل v2rayNG به این‌ها نیاز دارد:

- **Android VpnService** (ساخت رابط tun و گرفتن مجوز `BIND_VPN_SERVICE`)
- **هسته Xray به‌صورت AAR** (با gomobile از کد Go ساخته می‌شود — همان `AndroidLibXrayLite` در v2rayNG)
- کد نیتیو **Kotlin/Java** برای مدیریت اتصال، نوتیفیکیشن و تنظیمات

### راه سریع و عملی: فورک و ری‌برند v2rayNG

v2rayNG دقیقاً همان چیزی است که می‌خواهی (همه پروتکل‌ها و اشتراک‌ها را پشتیبانی می‌کند):

```bash
git clone https://github.com/2dust/v2rayNG.git
# با Android Studio بازش کن و صبر کن Gradle sync شود
```

جاهایی که برای برند «ایلیا» عوض می‌شوند:

1. **نام اپ:** `v2rayNG/app/src/main/res/values/strings.xml` → `app_name` را بگذار `ILIA`
2. **شناسه بسته:** `app/build.gradle.kts` → `applicationId = "app.ilia.vpn"`
3. **آیکون:** پوشه‌های `mipmap-*/ic_launcher` (با Android Studio: New → Image Asset)
4. **رنگ‌ها:** تم تیره با همان اکسنت آبی `#2F7CFF` و فیروزه‌ای `#2DE1D6` این پروژه
5. ساخت APK:
   ```bash
   ./gradlew assembleDebug
   ```

پروژه‌های مشابه برای مطالعه: **Hiddify Next** و **NekoBoxForAndroid** (هر دو هسته Xray/sing-box دارند).

> اگر بخواهی، می‌توانم صفحه‌های همین رابط (اورب اتصال، لیست سرورها، تنظیمات) را به‌صورت **Jetpack Compose (Kotlin)**
> برای پروژه نیتیو v2rayNG هم بنویسم تا ظاهر ایلیا روی هسته واقعی پیاده شود.

---

## 🧩 رفع اشکال رایج

| مشکل | راه‌حل |
|---|---|
| `npx cap add android` خطا می‌دهد | Node را به نسخه ۲۲ و JDK را به ۲۱ برسان |
| خطای SDK هنگام build | در Android Studio: **SDK Manager → SDK Platforms** آخرین Android را نصب کن |
| `SDK license not accepted` | در پوشه SDK دستور `yes | sdkmanager --licenses` را اجرا کن |
| گوشی APK را نصب نمی‌کند | حذف نسخه قبلی با شناسه مشابه + فعال‌کردن «نصب از این منبع» |
| تغییرات دیده نمی‌شود | دوباره `npm run build` و بعد `npx cap sync android` |
