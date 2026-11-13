/* EMY Cloud Auth + client-side encryption with recovery key and encrypted backup.
   V2 format: random per-account data key, wrapped independently by password and recovery key. */
(() => {
  'use strict';
  const SUPABASE_URL = 'https://ibmqkrgvkskcyrdsfpcu.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_QHeukTXay5k_afvD5kSuvg_v8-Y9msR';
  const KEYS = {
    exams: 'emyExams',
    activities: 'emyActivities',
    custom_tables: 'emyCustomTables',
    rosters: 'emyRosters'
  };
  const COLLECTIONS = Object.keys(KEYS);
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  let activeUser = null;
  let dataKeyBytes = null;
  let keyEnvelope = null;
  let saveTimers = {};
  let appLoaded = false;
  let pendingRecoveryUser = null;
  const $ = id => document.getElementById(id);

  function mountStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #emy-auth-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#f8edf0,#f5e9df);font-family:Tahoma,Arial,sans-serif;color:#59434d}
      .emy-auth-card{width:min(490px,100%);background:#fff;border:1px solid #ead1d8;border-radius:22px;padding:28px;box-shadow:0 14px 45px #79586618;text-align:center;max-height:92vh;overflow:auto}
      .emy-auth-card h1{color:#a96680;margin:0 0 8px;font-size:26px}.emy-auth-card p{line-height:1.8;color:#806b74}
      .emy-auth-card input{width:100%;box-sizing:border-box;padding:13px 14px;margin:7px 0;border:1px solid #e4cbd3;border-radius:10px;font-size:15px;direction:ltr;text-align:left}
      .emy-auth-card button{width:100%;padding:12px;margin-top:9px;border:0;border-radius:10px;background:#ad7189;color:white;font-size:15px;cursor:pointer}
      .emy-auth-card button.secondary{background:#f3e5ea;color:#81566a}.emy-auth-card button:disabled{opacity:.55;cursor:not-allowed}
      .emy-auth-message{min-height:28px;font-size:13px;margin-top:12px;color:#81566a;overflow-wrap:anywhere}
      .emy-recovery-code{direction:ltr;word-break:break-all;background:#f8f1f4;border:1px dashed #bd8298;border-radius:10px;padding:13px;font:600 14px/1.8 monospace;user-select:all}
      .emy-auth-check{display:flex;align-items:flex-start;gap:9px;text-align:right;font-size:13px;line-height:1.7;margin:12px 0;color:#705865}.emy-auth-check input{width:auto;margin:3px 0;flex:0 0 auto}
      #emy-cloud-user{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;color:#725866}#emy-cloud-user button{border:0;border-radius:8px;padding:7px 10px;background:#f3e5ea;color:#81566a;cursor:pointer}
      body.emy-auth-locked>header,body.emy-auth-locked>main,body.emy-auth-locked>footer{display:none!important}
    `;
    document.head.appendChild(style);
  }
  function ensurePanel() {
    let panel = $('emy-auth-screen');
    if (!panel) {
      panel = document.createElement('section'); panel.id = 'emy-auth-screen';
      panel.innerHTML = '<div class="emy-auth-card" id="emy-auth-card"></div>';
      document.body.prepend(panel);
    }
    document.body.classList.add('emy-auth-locked');
    return $('emy-auth-card');
  }
  function showAuth(message = '') {
    const card = ensurePanel();
    card.innerHTML = `<div style="font-size:42px;color:#bd8298">♡</div><h1>EMY — مساعد معلمتي</h1><p>سجّلي الدخول للوصول إلى مساحتك التعليمية. تُشفّر البيانات قبل إرسالها إلى قاعدة البيانات.</p>
      <form id="emy-auth-form"><input id="emy-auth-email" type="email" autocomplete="username" placeholder="البريد الإلكتروني" required><input id="emy-auth-password" type="password" autocomplete="current-password" placeholder="كلمة المرور" required><button type="submit">تسجيل الدخول</button><button type="button" class="secondary" id="emy-signup-btn">إنشاء حساب جديد</button></form>
      <button type="button" class="secondary" id="emy-reset-btn">نسيت كلمة المرور؟</button><div class="emy-auth-message" id="emy-auth-message" role="status"></div>`;
    $('emy-auth-form').addEventListener('submit', signIn);
    $('emy-signup-btn').addEventListener('click', signUp);
    $('emy-reset-btn').addEventListener('click', requestPasswordReset);
    setMessage(message);
  }
  function setMessage(message) { const el = $('emy-auth-message'); if (el) el.textContent = message; }
  function bytesToB64(bytes) { let s=''; bytes.forEach(b=>s+=String.fromCharCode(b)); return btoa(s); }
  function b64ToBytes(value) { const s=atob(value); return Uint8Array.from(s,c=>c.charCodeAt(0)); }
  function bytesToB64Url(bytes) { return bytesToB64(bytes).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
  function b64UrlToBytes(value) { const s=value.replace(/-/g,'+').replace(/_/g,'/'); return b64ToBytes(s+'='.repeat((4-s.length%4)%4)); }
  function randomBytes(n) { return crypto.getRandomValues(new Uint8Array(n)); }
  async function derivePasswordWrapKey(password, salt) {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function wrapRawKey(rawKey, wrappingKey) {
    const iv=randomBytes(12); const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},wrappingKey,rawKey);
    return {iv:bytesToB64(iv),ciphertext:bytesToB64(new Uint8Array(cipher))};
  }
  async function unwrapRawKey(wrapped, wrappingKey) {
    return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBytes(wrapped.iv)},wrappingKey,b64ToBytes(wrapped.ciphertext)));
  }
  async function makeKeyEnvelope(password, rawKey, recoveryBytes) {
    const passwordSalt=randomBytes(16);
    const passwordKey=await derivePasswordWrapKey(password,passwordSalt);
    const recoveryKey=await crypto.subtle.importKey('raw',recoveryBytes,{name:'AES-GCM'},false,['encrypt','decrypt']);
    const passwordWrap=await wrapRawKey(rawKey,passwordKey);
    const recoveryWrap=await wrapRawKey(rawKey,recoveryKey);
    return {version:2,password:{salt:bytesToB64(passwordSalt),iv:passwordWrap.iv,ciphertext:passwordWrap.ciphertext},recovery:{iv:recoveryWrap.iv,ciphertext:recoveryWrap.ciphertext}};
  }
  async function makeRecoveryWrap(rawKey, recoveryBytes) {
    const recoveryKey=await crypto.subtle.importKey('raw',recoveryBytes,{name:'AES-GCM'},false,['encrypt','decrypt']);
    return wrapRawKey(rawKey,recoveryKey);
  }
  async function unlockWithPassword(password, envelope) {
    const wrappingKey=await derivePasswordWrapKey(password,b64ToBytes(envelope.password.salt));
    return unwrapRawKey(envelope.password,wrappingKey);
  }
  async function unlockWithRecovery(code, envelope) {
    const raw=b64UrlToBytes(code.trim());
    if(raw.length!==32) throw new Error('مفتاح الاستعادة غير صحيح أو ناقص.');
    const wrappingKey=await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);
    return unwrapRawKey(envelope.recovery,wrappingKey);
  }
  async function encryptData(value, rawKey, envelope) {
    const key=await crypto.subtle.importKey('raw',rawKey,{name:'AES-GCM'},false,['encrypt']);
    const iv=randomBytes(12); const plain=new TextEncoder().encode(JSON.stringify(value));
    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain);
    return {__emyEncrypted:true,version:2,algorithm:'AES-GCM',iv:bytesToB64(iv),ciphertext:bytesToB64(new Uint8Array(cipher)),keyEnvelope:envelope};
  }
  async function decryptData(payload, rawKey) {
    const key=await crypto.subtle.importKey('raw',rawKey,{name:'AES-GCM'},false,['decrypt']);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBytes(payload.iv)},key,b64ToBytes(payload.ciphertext));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  async function decryptV1(payload,password,userId) {
    const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
    const oldKey=await crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode('EMY-v1:'+userId),iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBytes(payload.iv)},oldKey,b64ToBytes(payload.ciphertext));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  function readLocalSnapshot() {
    const out={}; Object.entries(KEYS).forEach(([c,k])=>{try{out[c]=JSON.parse(localStorage.getItem(k)||'[]')}catch{out[c]=[]}}); return out;
  }
  function clearAppLocalData(){Object.values(KEYS).forEach(k=>localStorage.removeItem(k));}
  async function getCloudRows(userId) {
    const {data,error}=await client.from('emy_records').select('collection,record_id,data,updated_at').eq('user_id',userId);
    if(error) throw error; return (data||[]).sort((a,b)=>COLLECTIONS.indexOf(a.collection)-COLLECTIONS.indexOf(b.collection));
  }
  async function upsertCollection(collection,value) {
    if(!activeUser||!dataKeyBytes||!keyEnvelope) return;
    const encrypted=await encryptData(value,dataKeyBytes,keyEnvelope);
    const {error}=await client.from('emy_records').upsert({user_id:activeUser.id,collection,record_id:'main',data:encrypted,updated_at:new Date().toISOString()},{onConflict:'user_id,collection,record_id'});
    if(error) throw error;
    const status=$('emy-save-status'); if(status){status.textContent='✓ تمت المزامنة المشفّرة';status.className='save-status is-saved';}
  }
  async function writeAllCollections(snapshot) {
    for(const c of COLLECTIONS) await upsertCollection(c, snapshot[c] ?? []);
  }
  async function loadAndUnlock(user,password) {
    activeUser=user;
    const rows=await getCloudRows(user.id);
    const hasV2=rows.some(r=>r.data?.__emyEncrypted===true&&r.data.version===2);
    const hasV1=rows.some(r=>r.data?.__emyEncrypted===true&&r.data.version===1);
    const hasPlain=rows.some(r=>!(r.data?.__emyEncrypted===true));
    if(hasV2&&(hasV1||hasPlain)) throw new Error('وجدنا بيانات بتنسيقات مختلطة. أوقفي الاستخدام واطلبي مراجعة النسخة قبل المتابعة.');
    const local=readLocalSnapshot();
    if(hasV2){
      const first=rows.find(r=>r.data?.version===2); keyEnvelope=first.data.keyEnvelope;
      if(!keyEnvelope||keyEnvelope.version!==2) throw new Error('بيانات مفتاح التشفير غير مكتملة.');
      dataKeyBytes=await unlockWithPassword(password,keyEnvelope);
      const decodedSnapshot={};
      for(const row of rows){ if(row.data?.version!==2) continue; const value=await decryptData(row.data,dataKeyBytes); if(KEYS[row.collection]) decodedSnapshot[row.collection]=value; }
      clearAppLocalData();
      for(const c of COLLECTIONS){ if(!(c in decodedSnapshot)) decodedSnapshot[c]=[]; localStorage.setItem(KEYS[c],JSON.stringify(decodedSnapshot[c])); }
      for(const c of COLLECTIONS) if(!rows.some(r=>r.collection===c)) await upsertCollection(c,[]);
      return {showRecovery:false};
    }
    const snapshot={};
    if(rows.length){
      for(const row of rows){
        if(!KEYS[row.collection]) continue;
        if(row.data?.__emyEncrypted===true&&row.data.version===1) snapshot[row.collection]=await decryptV1(row.data,password,user.id);
        else snapshot[row.collection]=row.data;
      }
    } else {
      for(const c of COLLECTIONS) snapshot[c]=local[c]??[];
      const hasLocal=Object.values(snapshot).some(v=>Array.isArray(v)&&v.length);
      if(hasLocal&&!confirm('وجدنا بيانات محلية على هذا الجهاز. هل تريدين نقلها إلى هذا الحساب؟ اختاري إلغاء إذا لم تكن تخص هذا الحساب.')) { for(const c of COLLECTIONS)snapshot[c]=[]; }
    }
    for(const c of COLLECTIONS) if(!(c in snapshot)) snapshot[c]=[];
    dataKeyBytes=randomBytes(32);
    const recoveryBytes=randomBytes(32);
    const recoveryCode=bytesToB64Url(recoveryBytes);
    keyEnvelope=await makeKeyEnvelope(password,dataKeyBytes,recoveryBytes);
    return {showRecovery:true,recoveryCode,snapshot};
  }
  function downloadText(filename,text){const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function showRecoveryKey(code,after) {
    const card=ensurePanel();
    card.innerHTML=`<div style="font-size:38px;color:#bd8298">🔐</div><h1>احفظي مفتاح الاستعادة</h1><p>هذا المفتاح هو الوسيلة الوحيدة لاستعادة البيانات إذا فُقدت كلمة المرور. لن نعرضه مرة أخرى، ولا يُحفظ في قاعدة البيانات.</p><div class="emy-recovery-code" id="emy-recovery-code"></div><button type="button" id="emy-download-recovery">تنزيل مفتاح الاستعادة كملف</button><label class="emy-auth-check"><input type="checkbox" id="emy-recovery-saved"> حفظت المفتاح في مكان آمن خارج هذا الجهاز.</label><button type="button" id="emy-recovery-continue" disabled>أكملت الحفظ — فتح التطبيق</button><div class="emy-auth-message" id="emy-auth-message">احتفظي بنسخة ورقية أو في مدير كلمات مرور موثوق، ولا ترسليه لأي شخص.</div>`;
    $('emy-recovery-code').textContent=code;
    $('emy-download-recovery').addEventListener('click',()=>downloadText('EMY-Recovery-Key.txt','EMY recovery key\nKeep this secret offline. Anyone with this key and account access may recover the encrypted data.\n\n'+code+'\n'));
    $('emy-recovery-saved').addEventListener('change',e=>$('emy-recovery-continue').disabled=!e.target.checked);
    $('emy-recovery-continue').addEventListener('click',async()=>{const btn=$('emy-recovery-continue');btn.disabled=true;setMessage('جارٍ حفظ البيانات المشفّرة...');try{await after();}catch(err){btn.disabled=false;setMessage('لم يكتمل الحفظ. المفتاح ما زال ظاهرًا؛ أعيدي المحاولة. '+(err.message||''));console.error(err);}});
  }
  async function signIn(event){
    event.preventDefault(); const email=$('emy-auth-email').value.trim(),password=$('emy-auth-password').value;
    setMessage('جارٍ تسجيل الدخول وفك تشفير البيانات...');
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error){setMessage(error.message);return;}
    try{const result=await loadAndUnlock(data.user,password);activeUser=data.user;if(result.showRecovery)showRecoveryKey(result.recoveryCode,async()=>{await writeAllCollections(result.snapshot);clearAppLocalData();for(const c of COLLECTIONS)localStorage.setItem(KEYS[c],JSON.stringify(result.snapshot[c]));openApp(data.user);});else openApp(data.user);}
    catch(err){dataKeyBytes=null;keyEnvelope=null;activeUser=null;setMessage('تعذّر فتح البيانات: '+(err.message||'تحققي من كلمة المرور ومفتاح البيانات.'));console.error(err);}
  }
  async function signUp(){
    const email=$('emy-auth-email').value.trim(),password=$('emy-auth-password').value;
    if(!email||password.length<10){setMessage('أدخلي بريدًا صحيحًا وكلمة مرور من 10 أحرف على الأقل.');return;}
    setMessage('جارٍ إنشاء الحساب...');
    const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
    if(error){setMessage(error.message);return;}
    if(data.session&&data.user){try{const result=await loadAndUnlock(data.user,password);activeUser=data.user;if(result.showRecovery)showRecoveryKey(result.recoveryCode,async()=>{await writeAllCollections(result.snapshot);clearAppLocalData();for(const c of COLLECTIONS)localStorage.setItem(KEYS[c],JSON.stringify(result.snapshot[c]));openApp(data.user);});else openApp(data.user);}catch(err){setMessage('تم إنشاء الحساب لكن تعذّر إعداد التشفير: '+err.message);}}
    else setMessage('تم إنشاء الحساب. افتحي رسالة تأكيد البريد، ثم عودي وسجّلي الدخول. سيُنشأ مفتاح الاستعادة عند أول دخول.');
  }
  async function requestPasswordReset(){
    const email=$('emy-auth-email')?.value.trim(); if(!email){setMessage('اكتبي البريد الإلكتروني أولًا.');return;}
    setMessage('جارٍ إرسال رابط إعادة تعيين كلمة المرور...');
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
    setMessage(error?error.message:'إذا كان البريد مسجلًا، ستصلك رسالة لإعادة تعيين كلمة المرور. افتحي الرابط من نفس المتصفح.');
  }
  function showRecoveryReset(user){
    pendingRecoveryUser=user; const card=ensurePanel();
    card.innerHTML=`<h1>استعادة بيانات EMY</h1><p>أدخلي مفتاح الاستعادة الذي حفظتِه سابقًا، ثم اختاري كلمة مرور جديدة للحساب.</p><form id="emy-recovery-form"><input id="emy-recovery-input" type="text" autocomplete="off" placeholder="مفتاح الاستعادة" required><input id="emy-new-password" type="password" minlength="10" placeholder="كلمة المرور الجديدة (10 أحرف على الأقل)" required><button type="submit">استعادة البيانات وتغيير كلمة المرور</button></form><div class="emy-auth-message" id="emy-auth-message"></div>`;
    $('emy-recovery-form').addEventListener('submit',completeRecovery);
  }
  async function completeRecovery(event){
    event.preventDefault(); const code=$('emy-recovery-input').value.trim(),newPassword=$('emy-new-password').value;
    if(newPassword.length<10){setMessage('كلمة المرور الجديدة يجب أن تتكون من 10 أحرف على الأقل.');return;}
    try{
      setMessage('جارٍ التحقق من مفتاح الاستعادة...');
      const rows=await getCloudRows(pendingRecoveryUser.id); const first=rows.find(r=>r.data?.version===2);
      if(!first?.data?.keyEnvelope) throw new Error('لا يوجد مفتاح استعادة محفوظ لهذا الحساب. إذا كانت البيانات قديمة بنظام V1 فلا يمكن إنشاء مفتاح بأثر رجعي دون كلمة المرور الأصلية.');
      const envelope=first.data.keyEnvelope; dataKeyBytes=await unlockWithRecovery(code,envelope);
      const nextEnvelope=await makeKeyEnvelope(newPassword,dataKeyBytes,b64UrlToBytes(code));
      const {error:updateError}=await client.auth.updateUser({password:newPassword}); if(updateError) throw updateError;
      for(const row of rows){
        if(row.data?.version!==2) continue;
        const value=await decryptData(row.data,dataKeyBytes);
        const encrypted=await encryptData(value,dataKeyBytes,nextEnvelope);
        const {error}=await client.from('emy_records').upsert({user_id:pendingRecoveryUser.id,collection:row.collection,record_id:row.record_id||'main',data:encrypted,updated_at:new Date().toISOString()},{onConflict:'user_id,collection,record_id'});
        if(error) throw error;
      }
      keyEnvelope=nextEnvelope;activeUser=pendingRecoveryUser;clearAppLocalData();
      for(const row of rows){if(row.data?.version===2&&KEYS[row.collection])localStorage.setItem(KEYS[row.collection],JSON.stringify(await decryptData(row.data,dataKeyBytes)));}
      setMessage('تم تحديث كلمة المرور ومفتاح التشفير بنجاح.');openApp(activeUser);
    }catch(err){dataKeyBytes=null;setMessage('لم تكتمل الاستعادة: '+(err.message||'تحققي من المفتاح وحاولي مجددًا.'));console.error(err);}
  }
  async function rotateRecoveryKey(){
    if(!activeUser||!dataKeyBytes||!keyEnvelope)return;
    if(!confirm('سيُلغى مفتاح الاستعادة القديم ويُنشأ مفتاح جديد. تأكدي من حفظ المفتاح الجديد فور ظهوره. هل تريدين المتابعة؟'))return;
    const bytes=randomBytes(32),code=bytesToB64Url(bytes);
    try{
      const recoveryWrap=await makeRecoveryWrap(dataKeyBytes,bytes);
      const nextEnvelope={...keyEnvelope,recovery:recoveryWrap};
      showRecoveryKey(code,async()=>{
        await rewriteEnvelopeOnCloud(nextEnvelope);
        keyEnvelope=nextEnvelope;
        document.body.classList.remove('emy-auth-locked');$('emy-auth-screen')?.remove();
      });
    }catch(err){alert('تعذّر تجهيز مفتاح جديد: '+err.message);}
  }
  async function rewriteEnvelopeOnCloud(envelope){
    const rows=await getCloudRows(activeUser.id);
    for(const row of rows){if(row.data?.version!==2)continue;row.data.keyEnvelope=envelope;const {error}=await client.from('emy_records').upsert({user_id:activeUser.id,collection:row.collection,record_id:row.record_id||'main',data:row.data,updated_at:new Date().toISOString()},{onConflict:'user_id,collection,record_id'});if(error)throw error;}
  }
  async function exportBackup(){
    const rows=await getCloudRows(activeUser.id);
    const backup={format:'EMY-ENCRYPTED-BACKUP',version:2,userId:activeUser.id,createdAt:new Date().toISOString(),records:rows};
    downloadText('EMY-encrypted-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(backup,null,2));
  }
  async function importBackup(file){
    const text=await file.text(),backup=JSON.parse(text);
    if(backup.format!=='EMY-ENCRYPTED-BACKUP'||backup.version!==2||backup.userId!==activeUser.id||!Array.isArray(backup.records))throw new Error('ملف النسخة الاحتياطية غير صالح أو لا يخص هذا الحساب.');
    if(!confirm('سيتم استبدال سجلات الحساب الحالية بالسجلات الموجودة في النسخة الاحتياطية. هل تريدين المتابعة؟'))return;
    for(const row of backup.records){if(!KEYS[row.collection]||row.data?.version!==2)continue;const value=await decryptData(row.data,dataKeyBytes);const encrypted=await encryptData(value,dataKeyBytes,keyEnvelope);const {error}=await client.from('emy_records').upsert({user_id:activeUser.id,collection:row.collection,record_id:row.record_id||'main',data:encrypted,updated_at:new Date().toISOString()},{onConflict:'user_id,collection,record_id'});if(error)throw error;localStorage.setItem(KEYS[row.collection],JSON.stringify(value));}
    alert('تم استيراد النسخة الاحتياطية. سيُعاد تحميل التطبيق لتحديث العرض.');location.reload();
  }
  function addUserBar(user){
    const header=document.querySelector('body > header');if(!header||$('emy-cloud-user'))return;
    const bar=document.createElement('div');bar.id='emy-cloud-user';bar.innerHTML=`<span>الحساب: ${escapeHtml(user.email||'')}</span><span>• المزامنة مشفّرة</span><button type="button" id="emy-backup-export">تنزيل نسخة احتياطية</button><button type="button" id="emy-backup-import">استيراد نسخة</button><button type="button" id="emy-recovery-rotate">تجديد مفتاح الاستعادة</button><button type="button" id="emy-logout">تسجيل الخروج</button><input type="file" id="emy-backup-file" accept="application/json,.json" hidden>`;
    header.appendChild(bar);
    $('emy-backup-export').addEventListener('click',()=>exportBackup().catch(e=>alert('تعذّر إنشاء النسخة: '+e.message)));
    $('emy-backup-import').addEventListener('click',()=>$('emy-backup-file').click());
    $('emy-backup-file').addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importBackup(f).catch(err=>alert('تعذّر استيراد النسخة: '+err.message));e.target.value='';});
    $('emy-recovery-rotate').addEventListener('click',rotateRecoveryKey);
    $('emy-logout').addEventListener('click',async()=>{dataKeyBytes=null;keyEnvelope=null;activeUser=null;clearAppLocalData();await client.auth.signOut();location.reload();});
  }
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function openApp(user){
    document.body.classList.remove('emy-auth-locked');$('emy-auth-screen')?.remove();
    if(!appLoaded){appLoaded=true;const script=document.createElement('script');script.src='app.js';script.onload=()=>{document.dispatchEvent(new Event('DOMContentLoaded'));addUserBar(user);};script.onerror=()=>{appLoaded=false;showAuth('تعذّر تحميل التطبيق.');};document.body.appendChild(script);}else addUserBar(user);
  }
  function installCloudStorageBridge(){
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){original.call(this,key,value);if(this!==localStorage||!activeUser||!dataKeyBytes||!keyEnvelope)return;const c=Object.keys(KEYS).find(name=>KEYS[name]===key);if(!c)return;clearTimeout(saveTimers[c]);saveTimers[c]=setTimeout(()=>{let parsed;try{parsed=JSON.parse(value)}catch{return;}upsertCollection(c,parsed).catch(err=>{console.error('EMY encrypted save failed',err);const s=$('emy-save-status');if(s){s.textContent='تعذّر الحفظ المشفّر';s.className='save-status has-error';}});},700);};
  }
  mountStyles();installCloudStorageBridge();showAuth();
  client.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY'&&session?.user)showRecoveryReset(session.user);});
  client.auth.getSession().then(({data,error})=>{
    if(error){setMessage(error.message);return;}
    const recoveryInUrl=/type=recovery/.test(location.hash)||new URLSearchParams(location.search).has('code');
    if(recoveryInUrl&&data.session?.user)showRecoveryReset(data.session.user);
    else if(data.session?.user)setMessage('لخصوصية بياناتك، سجّلي الدخول مجددًا بكلمة المرور لفتح البيانات المشفّرة.');
  });
})();
