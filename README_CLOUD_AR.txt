EMY Cloud Edition - إعداد وتشغيل

1) هذه النسخة تضيف تسجيل الحساب بالبريد الإلكتروني وكلمة المرور عبر Supabase.
2) كل حساب يحفظ بياناته في سجل منفصل مرتبط بمعرّف المستخدم، وتعتمد الحماية على Row Level Security في قاعدة البيانات.
3) لا تفتحي index.html مباشرة عبر file://. شغّلي المجلد عبر خادم محلي أو انشريه على استضافة HTTPS مثل Cloudflare Pages.
4) تأكدي أن جدول public.emy_records وسياسات RLS قد أُنشئت بنجاح في Supabase.
5) في Supabase > Authentication > URL Configuration: أضيفي رابط الموقع المنشور إلى Site URL وRedirect URLs. أثناء الاختبار المحلي أضيفي http://localhost:5500/** (أو عنوان الخادم المحلي المستخدم).
6) في Authentication > Sign In / Providers: اتركي Email مفعّلًا وAllow new users to sign up مفعّلًا. إذا كان Confirm email مفعّلًا، يجب تأكيد البريد قبل أول تسجيل دخول.
7) لا تضيفي service_role أو أي Secret Key إلى ملفات المتصفح. المفتاح الموجود في auth.js هو Publishable Key فقط.
8) عند أول دخول، إذا وُجدت بيانات محلية قديمة ولم توجد بيانات سحابية لهذا الحساب، سيظهر سؤال قبل نقلها. لا تنقليها إلا إذا كانت تخص هذا الحساب.
9) المزامنة تتم بعد تغييرات الحفظ التي يكتبها التطبيق في مفاتيح localStorage الأربعة: emyExams, emyActivities, emyCustomTables, emyRosters.
10) هذه نسخة ربط أولية. اختبريها بحسابين وبيانات وهمية قبل استخدام بيانات طالبات حقيقية. راقبي حالة "تمت المزامنة" بعد الحفظ. لا تعتبري البيانات محفوظة سحابيًا إذا ظهر تعذّر الحفظ.

ملاحظة: Supabase URL وPublishable Key إعدادات عميل وليسا كلمة مرور. لا تشاركي Database Password أو Secret/service_role keys.
