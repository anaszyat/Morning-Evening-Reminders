# أذكاري — Athkari

تطبيق موبايل عربي للأذكار اليومية ومواقيت الصلاة والقبلة والمسبحة، مبني بـ Expo.

## Artifacts

- `artifacts/athkari` — تطبيق Expo (mobile, expo-router). الصفحة الرئيسية بأربع تبويبات داخلية: الأذكار، المواقيت، القبلة، المسبحة. شاشة تفاصيل لكل قسم أذكار في `app/dhikr/[category].tsx`.
- `artifacts/api-server` — قائم من السكالفولد (لم يُستخدم).
- `artifacts/mockup-sandbox` — قائم من السكالفولد (لم يُستخدم).

## بنية تطبيق أذكاري

- **الحالة العامة**: `contexts/AppContext.tsx` يحفظ في AsyncStorage: تقدم الأذكار اليومي (يصفّر تلقائياً عند تغيّر اليوم)، عدّاد المسبحة، المدينة المختارة، تفعيل التنبيهات، الوضع الليلي/النهاري.
- **بيانات الأذكار**: `constants/adhkar.ts` (29 ذكر صباح، 11 مساء، 7 نوم، 3 استيقاظ من حصن المسلم).
- **بيانات المسبحة**: `constants/tasbih.ts` (6 أذكار).
- **المدن**: `constants/cities.ts` (27 مدينة بإحداثياتها).
- **حسابات الصلاة والقبلة**: `lib/prayerTimes.ts` — حساب محلي بطريقة أم القرى للصلوات، وزاوية القبلة بمعادلة الدائرة العظمى نحو إحداثيات الكعبة.
- **البوصلة**: تستخدم `expo-sensors` (Magnetometer) على iOS/Android، مع رسالة تنبيه على الويب.
- **الخط**: IBM Plex Sans Arabic (400/500/600/700) من `@expo-google-fonts/ibm-plex-sans-arabic` — بديل مجاني هندسي قريب من Graphik.
- **الثيم**: أزرق غامق `#1E40AF / #1E3A8A` مع تدرّجات ونمط نجوم خفيف.

## Workflows

- `artifacts/athkari: expo` — Expo dev server (Metro + web preview).
- `artifacts/api-server: API Server` — Express server (غير مستخدم حالياً).
- `artifacts/mockup-sandbox: Component Preview Server` — vite (للمصمّم، غير مستخدم).

## ملاحظات

- لا يوجد backend أو قاعدة بيانات — كل الحفظ في AsyncStorage على الجهاز.
- التطبيق يعمل بالكامل على iOS و Android عبر Expo Go، ومع توافق كامل على Metro Web (عدا البوصلة).
- النشر للـ iOS App Store يتم عبر Expo Launch من زر النشر في Replit.
