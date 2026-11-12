/* EMY Cloud Authentication - Supabase */
(() => {
  const SUPABASE_URL = 'https://ibmqkrgvkskcyrdsfpcu.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_QHeukTXay5k_afvD5kSuvg_v8-Y9msR';
  const KEYS = {
    exams: 'emyExams',
    activities: 'emyActivities',
    custom_tables: 'emyCustomTables',
    rosters: 'emyRosters'
  };
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  let activeUser = null;
  let saveTimers = {};
  let appLoaded = false;
  let startingUserId = null;
  let startPromise = null;
  const $ = (id) => document.getElementById(id);

  function mountStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #emy-auth-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#f8edf0,#f5e9df);font-family:Tahoma,Arial,sans-serif;color:#59434d}
      .emy-auth-card{width:min(440px,100%);background:#fff;border:1px solid #ead1d8;border-radius:22px;padding:30px;box-shadow:0 14px 45px #79586618;text-align:center}
      .emy-auth-card h1{color:#a96680;margin:0 0 8px;font-size:27px}.emy-auth-card p{line-height:1.8;color:#806b74}
      .emy-auth-card input{width:100%;box-sizing:border-box;padding:13px 14px;margin:7px 0;border:1px solid #e4cbd3;border-radius:10px;font-size:15px;direction:ltr;text-align:left}
      .emy-auth-card button{width:100%;padding:13px;margin-top:10px;border:0;border-radius:10px;background:#ad7189;color:white;font-size:16px;cursor:pointer}
      .emy-auth-card button.secondary{background:#f3e5ea;color:#81566a}.emy-auth-message{min-height:28px;font-size:13px;margin-top:12px;color:#81566a;overflow-wrap:anywhere}
      #emy-cloud-user{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:12px;color:#725866}#emy-cloud-user button{border:0;border-radius:8px;padding:7px 11px;background:#f3e5ea;color:#81566a;cursor:pointer}
      body.emy-auth-locked>header,body.emy-auth-locked>main,body.emy-auth-locked>footer{display:none!important}
    `;
    document.head.appendChild(style);
  }
  function showAuth(message = '') {
    document.body.classList.add('emy-auth-locked');
    let panel = $('emy-auth-screen');
    if (!panel) {
      panel = document.createElement('section'); panel.id = 'emy-auth-screen';
      panel.innerHTML = `<div class="emy-auth-card"><div style="font-size:42px;color:#bd8298">♡</div><h1>EMY — مساعد معلمتي</h1><p>سجّلي الدخول للوصول إلى مساحتك التعليمية وحفظ بياناتك على جميع أجهزتك.</p><form id="emy-auth-form"><input id="emy-auth-email" type="email" autocomplete="email" placeholder="البريد الإلكتروني" required><input id="emy-auth-password" type="password" autocomplete="current-password" minlength="6" placeholder="كلمة المرور (6 أحرف على الأقل)" required><button type="submit" id="emy-login-btn">تسجيل الدخول</button><button type="button" class="secondary" id="emy-signup-btn">إنشاء حساب جديد</button></form><div class="emy-auth-message" id="emy-auth-message" role="status"></div></div>`;
      document.body.prepend(panel);
      $('emy-auth-form').addEventListener('submit', signIn);
      $('emy-signup-btn').addEventListener('click', signUp);
    }
    $('emy-auth-message').textContent = message;
  }
  function setMessage(message) { const el = $('emy-auth-message'); if (el) el.textContent = message; }
  async function signIn(event) {
    event.preventDefault(); const email = $('emy-auth-email').value.trim(); const password = $('emy-auth-password').value;
    setMessage('جارٍ تسجيل الدخول...');
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
  }
  async function signUp() {
    const email = $('emy-auth-email').value.trim(); const password = $('emy-auth-password').value;
    if (!email || password.length < 6) { setMessage('أدخلي بريدًا إلكترونيًا صحيحًا وكلمة مرور من 6 أحرف على الأقل.'); return; }
    setMessage('جارٍ إنشاء الحساب...');
    const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
    if (error) { setMessage(error.message); return; }
    if (data.session) setMessage('تم إنشاء الحساب. جارٍ فتح مساحتك...');
    else setMessage('تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. افتحيها لتفعيل الحساب ثم عودي لتسجيل الدخول.');
  }
  function readLocalSnapshot() {
    const snapshot = {};
    Object.entries(KEYS).forEach(([collection, key]) => {
      try { snapshot[collection] = JSON.parse(localStorage.getItem(key) || '[]'); }
      catch { snapshot[collection] = []; }
    });
    return snapshot;
  }
  function clearAppLocalData() { Object.values(KEYS).forEach(key => localStorage.removeItem(key)); }
  async function loadCloudData(user) {
    const { data, error } = await client.from('emy_records').select('collection,data').eq('user_id', user.id);
    if (error) throw error;
    const cloud = Object.fromEntries((data || []).map(row => [row.collection, row.data]));
    const hasCloudData = Object.keys(cloud).length > 0;
    const localSnapshot = readLocalSnapshot();
    clearAppLocalData();
    if (!hasCloudData) {
      const hasLocalData = Object.values(localSnapshot).some(value => Array.isArray(value) && value.length);
      if (hasLocalData && confirm('وجدنا بيانات محفوظة سابقًا على هذا الجهاز. هل تريدين نقلها إلى هذا الحساب؟ اختاري إلغاء إذا لم تكن هذه البيانات تخص هذا الحساب.')) {
        for (const [collection, key] of Object.entries(KEYS)) {
          const value = localSnapshot[collection];
          localStorage.setItem(key, JSON.stringify(value));
          await saveCollection(collection, value);
        }
      }
    } else {
      for (const [collection, key] of Object.entries(KEYS)) {
        if (Object.prototype.hasOwnProperty.call(cloud, collection)) localStorage.setItem(key, JSON.stringify(cloud[collection]));
      }
    }
  }
  async function saveCollection(collection, value) {
    if (!activeUser) return;
    const { error } = await client.from('emy_records').upsert({
      user_id: activeUser.id, collection, record_id: 'main', data: value, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,collection,record_id' });
    if (error) {
      const status = $('emy-save-status'); if (status) { status.textContent = 'تعذّر الحفظ السحابي'; status.className = 'save-status has-error'; }
      console.error('EMY cloud save failed:', error);
    } else {
      const status = $('emy-save-status'); if (status) { status.textContent = '✓ تمت المزامنة'; status.className = 'save-status is-saved'; }
    }
  }
  function installCloudStorageBridge() {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (this !== localStorage || !activeUser) return;
      const collection = Object.keys(KEYS).find(name => KEYS[name] === key);
      if (!collection) return;
      clearTimeout(saveTimers[collection]);
      saveTimers[collection] = setTimeout(() => {
        let parsed; try { parsed = JSON.parse(value); } catch { return; }
        saveCollection(collection, parsed);
      }, 700);
    };
  }
  function addUserBar(user) {
    const header = document.querySelector('body > header'); if (!header || $('emy-cloud-user')) return;
    const bar = document.createElement('div'); bar.id = 'emy-cloud-user';
    bar.innerHTML = `<span>الحساب: ${escapeHtml(user.email || '')}</span><span>• بياناتك متزامنة سحابيًا</span><button type="button" id="emy-logout">تسجيل الخروج</button>`;
    header.appendChild(bar); $('emy-logout').addEventListener('click', async () => { await client.auth.signOut(); location.reload(); });
  }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  async function startApp(user) {
    if (startingUserId === user.id && startPromise) return startPromise;
    startingUserId = user.id;
    startPromise = (async () => {
    activeUser = user;
    showAuth('جارٍ تحميل بيانات حسابك...');
    try { await loadCloudData(user); }
    catch (error) { console.error(error); setMessage('تعذّر تحميل بيانات الحساب. تأكدي من اتصال الإنترنت وإعدادات قاعدة البيانات ثم أعيدي المحاولة.'); return; }
    if (!appLoaded) {
      appLoaded = true;
      const script = document.createElement('script'); script.src = 'app.js'; script.onload = () => { document.dispatchEvent(new Event('DOMContentLoaded')); document.body.classList.remove('emy-auth-locked'); $('emy-auth-screen')?.remove(); addUserBar(user); }; script.onerror = () => setMessage('تعذّر تحميل التطبيق.'); document.body.appendChild(script);
    } else { document.body.classList.remove('emy-auth-locked'); $('emy-auth-screen')?.remove(); addUserBar(user); }
    })();
    try { await startPromise; } catch (error) { startingUserId = null; startPromise = null; throw error; }
  }
  mountStyles(); installCloudStorageBridge();
  showAuth();
  client.auth.getSession().then(({ data, error }) => { if (error) setMessage(error.message); else if (data.session?.user) startApp(data.session.user); });
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) startApp(session.user);
    if (event === 'SIGNED_OUT') { activeUser = null; clearAppLocalData(); location.reload(); }
  });
})();
