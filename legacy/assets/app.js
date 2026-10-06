/* Double H Platform — i18n + router + crosshair/scroll/click animations + mock business logic */
const LANGS = {ar:{name:'العربية',dir:'rtl'},tr:{name:'Türkçe',dir:'ltr'},en:{name:'English',dir:'ltr'},fr:{name:'Français',dir:'ltr'}};
const DEFAULT_LANG = localStorage.getItem('dh-lang') || 'en';

const CATS = [
 {id:'arch',icon:'🏛️',sub:'ARCHITECTURE'},{id:'civil',icon:'🌉',sub:'CIVIL ENGINEERING'},
 {id:'medical',icon:'⚕️',sub:'MEDICAL'},{id:'law',icon:'⚖️',sub:'LAW'},
 {id:'elec',icon:'⚡',sub:'ELECTRICITY'},{id:'mgmt',icon:'📊',sub:'MANAGEMENT'},
 {id:'bd',icon:'📐',sub:'BD'}
];

const T = {
en:{nav_home:'Home',nav_cats:'Categories',nav_cons:'Consultants',nav_contact:'Contact',book:'Book a Consultation',first_free:'First Consultation Free',hero_t:'Double H Consulting',hero_s:'Engineering • Architecture • Technology — applied knowledge that gets you hired.',hero_p:'Professional guidance, real competitions, and direct links to firms. Minimal steps, maximum outcome.',cta:'Start now',explore:'Explore categories',stats_req:'Requests',stats_cons:'Consultants',stats_cats:'Categories',how:'How it works',s1:'Pick a category',s1d:'Choose one of 7 Double H divisions.',s2:'Send request',s2d:'Full name, email, phone, note. No account needed.',s3:'We contact you',s3d:'Admin agrees date by email/phone, then schedules.',cats_t:'Consultation Categories',cats_d:'Clear cards. View details before requesting.',req_btn:'Request',detail:'Details',cons_t:'Our Consultants',cons_d:'Active profiles only. Managed by admins.',exp:'yrs exp',book_cons:'Book a Consultation',form_t:'Consultation Request',name:'Full Name *',email:'Email *',phone:'Phone Number *',note:'Note *',note_ph:'Describe exactly what you need help with',cat:'Category',privacy:'We store name, email, phone and note for consultation purposes only. Accessible to admins only. See privacy notice.',consent:'I agree to be contacted about my request. *',submit:'Submit request',ok_t:'Request received ✓',ok_d:'We saved your request with status New and sent a confirmation email (demo). Admin will contact you.',new_req:'Make another request',contact_t:'Contact',c_name:'Name *',c_email:'Email *',c_sub:'Subject *',c_msg:'Message *',send:'Send message',footer:'© Double H — First consultation free. Admin-only login.',admin:'Admin',missing:'Missing translations fall back to English.',free_note:'Free consultation: once per client (email OR phone), Rejected ignored. Overridable with reason.'},
ar:{nav_home:'الرئيسية',nav_cats:'التصنيفات',nav_cons:'المستشارون',nav_contact:'اتصل بنا',book:'احجز استشارة',first_free:'الاستشارة الأولى مجانية',hero_t:'دبل إتش للاستشارات',hero_s:'هندسة • عمارة • تقنية — معرفة تطبيقية توصلك للوظيفة.',hero_p:'إرشاد احترافي ومسابقات حقيقية وربط مباشر مع الشركات. خطوات قليلة ونتيجة كبيرة.',cta:'ابدأ الآن',explore:'استكشف التصنيفات',stats_req:'طلب',stats_cons:'مستشار',stats_cats:'تصنيف',how:'كيف تعمل المنصة',s1:'اختر تصنيفاً',s1d:'اختر من أقسام Double H السبعة.',s2:'أرسل الطلب',s2d:'الاسم، البريد، الهاتف، ملاحظة. بدون حساب.',s3:'نتواصل معك',s3d:'الإدارة تتفق معك على الموعد عبر الهاتف/البريد.',cats_t:'تصنيفات الاستشارات',cats_d:'بطاقات واضحة. اعرض التفاصيل قبل الطلب.',req_btn:'اطلب',detail:'التفاصيل',cons_t:'مستشارونا',cons_d:'ملفات نشطة فقط. بإدارة المشرفين.',exp:'سنوات خبرة',book_cons:'احجز استشارة',form_t:'نموذج طلب استشارة',name:'الاسم الكامل *',email:'البريد الإلكتروني *',phone:'رقم الهاتف *',note:'ملاحظة *',note_ph:'اشرح بالضبط ما تحتاج المساعدة فيه',cat:'التصنيف',privacy:'نخزن الاسم والبريد والهاتف والملاحظة لأغراض الاستشارة فقط. متاح للمشرفين فقط.',consent:'أوافق على التواصل معي بخصوص طلبي. *',submit:'إرسال الطلب',ok_t:'تم استلام الطلب ✓',ok_d:'حفظنا طلبك بحالة جديد وأرسلنا بريد تأكيد (تجريبي). ستتواصل معك الإدارة.',new_req:'طلب آخر',contact_t:'اتصل بنا',c_name:'الاسم *',c_email:'البريد *',c_sub:'الموضوع *',c_msg:'الرسالة *',send:'إرسال',footer:'© دبل إتش — الاستشارة الأولى مجانية. الدخول للمشرفين فقط.',admin:'الإدارة',missing:'الترجمة الناقصة تتحول للإنجليزية.',free_note:'الاستشارة المجانية: مرة واحدة لكل عميل (بريد أو هاتف)، يتم تجاهل المرفوض. قابلة للتجاوز بسبب.'},
tr:{nav_home:'Ana Sayfa',nav_cats:'Kategoriler',nav_cons:'Danışmanlar',nav_contact:'İletişim',book:'Danışmanlık Al',first_free:'İlk Danışmanlık Ücretsiz',hero_t:'Double H Danışmanlık',hero_s:'Mühendislik • Mimarlık • Teknoloji — işe götüren uygulamalı bilgi.',hero_p:'Profesyonel rehberlik, gerçek yarışmalar, firmalarla doğrudan bağlantı.',cta:'Hemen başla',explore:'Kategorileri keşfet',stats_req:'Talep',stats_cons:'Danışman',stats_cats:'Kategori',how:'Nasıl çalışır',s1:'Kategori seç',s1d:'7 Double H bölümünden birini seçin: ç, ğ, ı, İ, ö, ş, ü',s2:'Talep gönder',s2d:'Ad, e-posta, telefon, not. Hesap gerekmez.',s3:'Sizi arayalım',s3d:'Yönetici e-posta/telefon ile tarih belirler.',cats_t:'Danışmanlık Kategorileri',cats_d:'Net kartlar. Talep öncesi detayı görün.',req_btn:'Talep Et',detail:'Detay',cons_t:'Danışmanlarımız',cons_d:'Yalnızca aktif profiller.',exp:'yıl deneyim',book_cons:'Danışmanlık Al',form_t:'Danışmanlık Talebi',name:'Ad Soyad *',email:'E-posta *',phone:'Telefon *',note:'Not *',note_ph:'Neye ihtiyacınız olduğunu tam yazın',cat:'Kategori',privacy:'Ad, e-posta, telefon ve not yalnızca danışmanlık için saklanır.',consent:'Talebim için aranmayı kabul ediyorum. *',submit:'Gönder',ok_t:'Talep alındı ✓',ok_d:'Talebiniz Yeni statüsüyle kaydedildi (demo).',new_req:'Yeni talep',contact_t:'İletişim',c_name:'Ad *',c_email:'E-posta *',c_sub:'Konu *',c_msg:'Mesaj *',send:'Gönder',footer:'© Double H — İlk danışmanlık ücretsiz.',admin:'Yönetim',missing:'Eksik çeviri İngilizceye düşer.',free_note:'Ücretsiz: müşteri başına bir kez (e-posta VEYA telefon), Reddedilen sayılmaz.'},
fr:{nav_home:'Accueil',nav_cats:'Catégories',nav_cons:'Consultants',nav_contact:'Contact',book:'Réserver',first_free:'Première consultation gratuite',hero_t:'Double H Conseil',hero_s:'Ingénierie • Architecture • Technologie — un savoir appliqué qui embauche.',hero_p:'Accompagnement pro, concours réels, lien direct avec les entreprises. Accents: é è ê à ç ô œ.',cta:'Commencer',explore:'Voir catégories',stats_req:'Demandes',stats_cons:'Consultants',stats_cats:'Catégories',how:'Comment ça marche',s1:'Choisir une catégorie',s1d:'Choisissez parmi 7 divisions Double H.',s2:'Envoyer la demande',s2d:'Nom, e-mail, téléphone, note. Sans compte.',s3:'On vous contacte',s3d:"L'admin convient d'une date par e-mail/téléphone.",cats_t:'Catégories de consultation',cats_d:'Cartes claires. Détails avant demande.',req_btn:'Demander',detail:'Détails',cons_t:'Nos consultants',cons_d:'Profils actifs uniquement.',exp:'ans exp.',book_cons:'Réserver',form_t:'Demande de consultation',name:'Nom complet *',email:'E-mail *',phone:'Téléphone *',note:'Note *',note_ph:"Décrivez exactement ce dont vous avez besoin",cat:'Catégorie',privacy:'Nom, e-mail, téléphone et note stockés pour la consultation uniquement.',consent:'J’accepte d’être contacté. *',submit:'Envoyer',ok_t:'Demande reçue ✓',ok_d:'Statut Nouveau, e-mail de confirmation (démo).',new_req:'Nouvelle demande',contact_t:'Contact',c_name:'Nom *',c_email:'E-mail *',c_sub:'Objet *',c_msg:'Message *',send:'Envoyer',footer:'© Double H — Première consultation gratuite.',admin:'Admin',missing:'Traduction manquante → anglais.',free_note:'Gratuit : une fois par client (e-mail OU téléphone), Rejeté ignoré.'}
};
const CAT_T = {
 arch:{en:['Architecture','Architectural design, planning and supervision.'],ar:['العمارة','تصميم وتخطيط وإشراف معماري.'],tr:['Mimarlık','Tasarım, planlama ve mimari süpervizyon.'],fr:['Architecture','Conception, planification et suivi architectural.']},
 civil:{en:['Civil Engineering','Structures, infrastructure and site engineering.'],ar:['الهندسة المدنية','إنشاءات وبنية تحتية وهندسة مواقع.'],tr:['İnşaat Mühendisliği','Yapılar, altyapı ve saha mühendisliği.'],fr:['Génie civil','Structures, infrastructures et chantier.']},
 medical:{en:['Medical','Healthcare facilities and medical planning consult.'],ar:['الطب','استشارات المنشآت الصحية والتخطيط الطبي.'],tr:['Tıp','Sağlık tesisleri ve tıbbi planlama danışmanlığı.'],fr:['Médical','Conseil en établissements de santé.']},
 law:{en:['Law','Legal consulting for engineering and contracts.'],ar:['القانون','استشارات قانونية للهندسة والعقود.'],tr:['Hukuk','Mühendislik ve sözleşmeler için hukuk danışmanlığı.'],fr:['Droit','Conseil juridique, ingénierie et contrats.']},
 elec:{en:['Electricity','Electrical systems, power and installations.'],ar:['الكهرباء','أنظمة كهربائية وطاقة وتمديدات.'],tr:['Elektrik','Elektrik sistemleri, enerji ve tesisatlar.'],fr:['Électricité','Systèmes électriques et installations.']},
 mgmt:{en:['Management','Project management and business leadership.'],ar:['الإدارة','إدارة المشاريع والقيادة.'],tr:['Yönetim','Proje yönetimi ve liderlik.'],fr:['Management','Gestion de projets et leadership.']},
 bd:{en:['BD','Specialized BD consulting and project support.'],ar:['BD','استشارات BD متخصصة ودعم المشاريع.'],tr:['BD','Özel BD danışmanlığı ve proje desteği.'],fr:['BD','Conseil BD spécialisé et soutien.']}
};
const CONSULTANTS = [
 {id:1,init:'HH',yrs:12,title:{en:'BIM Lead',ar:'قائد BIM',tr:'BIM Lideri',fr:'Lead BIM'},name:{en:'Eng. H. Haddad',ar:'م. هـ. حداد',tr:'Müh. H. Haddad',fr:'Ing. H. Haddad'},spec:{en:'Architecture / BIM',ar:'عمارة / BIM',tr:'Mimari / BIM',fr:'Architecture / BIM'},langs:'AR EN TR',certs:[['Autodesk Certified Professional','Autodesk','2023'],['BIM Management','BRE','2022']]},
 {id:2,init:'RA',yrs:9,title:{en:'Design Consultant',ar:'مستشار تصميم',tr:'Tasarım Danışmanı',fr:'Consultant design'},name:{en:'Arch. Rima A.',ar:'م. ريما ا.',tr:'Mim. Rima A.',fr:'Arch. Rima A.'},spec:{en:'Interior / Studio',ar:'داخلي / استوديو',tr:'İç mekân / Stüdyo',fr:'Intérieur / Studio'},langs:'AR EN FR',certs:[['LEED Green Associate','GBCI','2021']]},
 {id:3,init:'MK',yrs:15,title:{en:'Real Estate Advisor',ar:'مستشار عقاري',tr:'Gayrimenkul Danışmanı',fr:'Conseiller immobilier'},name:{en:'M. Khalil',ar:'م. خليل',tr:'M. Khalil',fr:'M. Khalil'},spec:{en:'Investment / Tech',ar:'استثمار / تقنية',tr:'Yatırım / Teknoloji',fr:'Investissement / Tech'},langs:'EN TR AR',certs:[['PMP','PMI','2020'],['PropTech Cert','RICS','2023']]}
];

let lang = LANGS[DEFAULT_LANG]?DEFAULT_LANG:'en';
let route = 'home';
let selectedCat = 'arch';

const $ = s=>document.querySelector(s), $$ = s=>[...document.querySelectorAll(s)];
const store = {
 get(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},
 set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};
if(!localStorage.getItem('dh-lang')) localStorage.setItem('dh-lang',lang);

function t(k){return (T[lang]&&T[lang][k])||T.en[k]||k}
function ct(id){const e=CAT_T[id];return {title:(e[lang]?.[0])||e.en[0],desc:(e[lang]?.[1])||e.en[1]}}
function applyLang(l,keepData=true){
  if(!LANGS[l]) l='en'; lang=l; localStorage.setItem('dh-lang',l);
  document.documentElement.lang=l; document.documentElement.dir=LANGS[l].dir;
  document.title = l==='ar'?'دبل إتش — منصة الاستشارات':'Double H — Consultation Platform';
  $$('[data-i]').forEach(el=>{el.textContent=t(el.dataset.i)});
  $$('[data-ph]').forEach(el=>{el.placeholder=t(el.dataset.ph)});
  $$('#langSw button').forEach(b=>b.classList.toggle('active',b.dataset.l===l));
  renderCats(); renderCons(); updateFreeNotes();
  location.hash = `#/${l}/${route}`;
}
function updateFreeNotes(){$$('.free-note').forEach(e=>e.textContent=t('free_note'));
  const s=$('#f-cat'); if(s){const cur=s.value||selectedCat; s.innerHTML=CATS.map(c=>`<option value="${c.id}">${ct(c.id).title} — Double H ${c.sub}</option>`).join(''); s.value=cur; selectedCat=cur; const n=$('#reqCatName'); if(n) n.textContent=ct(cur).title;}}

// router
function nav(r,cat){
  route=r; if(cat) selectedCat=cat;
  $$('.view').forEach(v=>v.classList.remove('active'));
  const v=$('#v-'+r); if(v) v.classList.add('active');
  $$('.nav-links button').forEach(b=>b.classList.toggle('active',b.dataset.r===r));
  if(r==='request'){$('#f-cat').value=selectedCat; $('#reqCatName').textContent=ct(selectedCat).title;}
  location.hash=`#/${lang}/${r}`;
  window.scrollTo({top:0,behavior:'smooth'});
  requestAnimationFrame(observeReveals);
  if(r==='admin') renderAdmin();
}
window.addEventListener('hashchange',()=>{
  const m=location.hash.match(/#\/(ar|tr|en|fr)\/(\w+)/);
  if(m){ if(m[1]!==lang) applyLang(m[1]); route=m[2]; nav(route); }
});

function renderCats(){
  const g=$('#catGrid'); if(!g) return; g.innerHTML='';
  CATS.forEach((c,i)=>{
    const d=ct(c.id);
    const el=document.createElement('div'); el.className='card reveal tilt'; el.dataset.anim='';
    el.style.setProperty('--d',(i*70)+'ms');
    el.innerHTML=`<div class="icon">${c.icon}</div><h3>${d.title}</h3><p>${d.desc}</p><div class="pill">Double H ${c.sub}</div><br><a href="#" class="go" data-cat="${c.id}">→ ${t('detail')}</a> &nbsp; <a href="#" class="go" data-req="${c.id}" style="color:var(--sage)">● ${t('req_btn')}</a>`;
    g.appendChild(el);
  });
  g.querySelectorAll('[data-cat]').forEach(a=>a.onclick=e=>{e.preventDefault();openCat(a.dataset.cat)});
  g.querySelectorAll('[data-req]').forEach(a=>a.onclick=e=>{e.preventDefault();nav('request',a.dataset.req)});
  bindTilt(); observeReveals();
}
function openCat(id){
  const d=ct(id);
  $('#mTitle').textContent='Double H — '+d.title;
  $('#mBody').innerHTML=`<p>${d.desc}</p><p class="notice">🎁 ${t('first_free')} — <span class="free-note">${t('free_note')}</span></p><p><span class="pill">${id}</span> <span class="pill">Double H</span></p>`;
  $('#mCta').textContent=t('req_btn'); $('#mCta').onclick=e=>{e.preventDefault();closeModal();nav('request',id)};
  $('#modal').classList.add('open');
}
function closeModal(){$('#modal').classList.remove('open')}
function renderCons(){
  const g=$('#consGrid'); if(!g) return; g.innerHTML='';
  CONSULTANTS.forEach((c,i)=>{
    const nm=c.name[lang]||c.name.en, ti=c.title[lang]||c.title.en, sp=c.spec[lang]||c.spec.en;
    const el=document.createElement('div'); el.className='consult reveal';
    el.style.setProperty('--d',(i*90)+'ms');
    el.innerHTML=`<div class="ph">${c.init}</div><div class="bd"><h3 style="margin:0">${nm}</h3><div style="color:var(--sage);font-weight:800">${ti} • ${sp}</div><div style="margin:8px 0"><span class="pill">📅 ${c.yrs} ${t('exp')}</span><span class="pill">🌍 ${c.langs}</span></div>${c.certs.map(x=>`<div class="cert"><b>${x[0]}</b><br><small>${x[1]} • ${x[2]}</small></div>`).join('')}<button class="btn btn-dark" style="margin-top:10px" data-b="${c.id}">${t('book_cons')}</button></div>`;
    g.appendChild(el);
  });
  g.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>nav('request',selectedCat));
  observeReveals();
}

// free-first logic (email OR phone, ignore Rejected)
function isFirstFree(email,phone){
  const reqs=store.get('dh-requests',[]);
  email=(email||'').trim().toLowerCase(); phone=(phone||'').replace(/\D/g,'');
  const hit=reqs.find(r=>r.status!=='Rejected'&&((r.email||'').toLowerCase()===email||(r.phone||'').replace(/\D/g,'')===phone));
  return !hit;
}
// rate limit: max 5 / 10min per browser
function rateOk(key,maxN=5,winMs=600000){
  const k='dh-rl-'+key, now=Date.now();
  let arr=store.get(k,[]).filter(x=>now-x<winMs);
  if(arr.length>=maxN) return false;
  arr.push(now); store.set(k,arr); return true;
}
function validEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)}
function validPhone(p){return /^\+?[0-9\s\-()]{7,18}$/.test(p)}

function submitRequest(e){
  e.preventDefault();
  if($('#f-honey').value) return; // honeypot
  if(!rateOk('req')){toast('⏳ Rate limited — try later');return;}
  const n=$('#f-name').value.trim(), em=$('#f-email').value.trim(), ph=$('#f-phone').value.trim(), no=$('#f-note').value.trim();
  let ok=true;
  const set=(id,msg)=>{$(id).textContent=msg; if(msg) ok=false;};
  set('#e-name',n.length<2?'Required (min 2)':''); set('#e-email',!validEmail(em)?'Invalid email':'');
  set('#e-phone',!validPhone(ph)?'Invalid phone':''); set('#e-note',(no.length<10||no.length>2000)?'Note 10–2000 chars':'');
  if(!$('#f-consent').checked){toast('⚠️ Consent required');return;}
  if(!ok) return;
  const free=isFirstFree(em,ph);
  const reqs=store.get('dh-requests',[]);
  const rec={id:Date.now(),category:selectedCat,fullName:n,email:em,phone:ph,note:no,lang,status:'New',isFirstFree:free,adminNotes:'',createdAt:new Date().toISOString(),scheduledAt:''};
  reqs.unshift(rec); store.set('dh-requests',reqs);
  audit('create','request',rec.id);
  $('#reqForm').style.display='none'; $('#reqOk').style.display='block';
  $('#okMeta').innerHTML=`<span class="pill">${ct(selectedCat).title}</span> <span class="pill">${free?'🎁 FREE':'STANDARD'}</span> <span class="pill">${em}</span>`;
  toast('✉️ Confirmation email (demo) → '+em);
}
function submitContact(e){
  e.preventDefault();
  if($('#c-honey').value) return;
  if(!rateOk('contact')){toast('⏳ Rate limited');return;}
  const arr=store.get('dh-msgs',[]);
  arr.unshift({id:Date.now(),name:$('#c-name').value,email:$('#c-email').value,subject:$('#c-sub').value,message:$('#c-msg').value,lang,status:'New',createdAt:new Date().toISOString()});
  store.set('dh-msgs',arr); audit('create','message',arr[0].id);
  e.target.reset(); toast('📩 Inquiry saved');
}
function audit(action,entity,id){
  const a=store.get('dh-audit',[]);
  a.unshift({id:Date.now(),admin:sessionStorage.getItem('dh-admin')||'system',action,entity,entityId:id,ts:new Date().toISOString()});
  store.set('dh-audit',a.slice(0,200));
}
function toast(m){const x=$('#toast');x.textContent=m;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2600)}

// ---- admin (demo, hidden from nav) ----
function renderAdmin(){
  const logged=!!sessionStorage.getItem('dh-admin');
  $('#adminLogin').style.display=logged?'none':'block';
  $('#adminApp').style.display=logged?'block':'none';
  if(!logged) return;
  const reqs=store.get('dh-requests',[]), msgs=store.get('dh-msgs',[]);
  const by=s=>reqs.filter(r=>r.status===s).length;
  $('#kpi').innerHTML=[['New',by('New')],['Contacted',by('Contacted')],['Scheduled',by('Scheduled')],['Free 🎁',reqs.filter(r=>r.isFirstFree).length],['Total',reqs.length],['Inquiries',msgs.length]].map(k=>`<div class="kpi"><b>${k[1]}</b>${k[0]}</div>`).join('');
  const fS=$('#fltStatus').value||'', fC=$('#fltCat').value||'', q=($('#fltQ').value||'').toLowerCase();
  let rows=reqs.filter(r=>(!fS||r.status===fS)&&(!fC||r.category===fC)&&(!q||(r.fullName+r.email+r.phone+r.note).toLowerCase().includes(q)));
  $('#reqTable').innerHTML=`<table><tr><th>ID</th><th>Client</th><th>Category</th><th>Free</th><th>Status</th><th>Date</th><th></th></tr>${rows.map(r=>`<tr><td>${String(r.id).slice(-5)}</td><td><b>${esc(r.fullName)}</b><br><small>${esc(r.email)}<br><span dir="ltr">${esc(r.phone)}</span> [${r.lang}]</small><br><small style="color:#666">${esc(r.note.slice(0,80))}</small></td><td>${ct(r.category).title}</td><td>${r.isFirstFree?'🎁':'—'}</td><td><span class="status st-${r.status}">${r.status}</span></td><td><small>${(r.createdAt||'').slice(0,10)}</small></td><td><button onclick="editReq(${r.id})">✏️</button></td></tr>`).join('')||'<tr><td colspan=7>Empty</td></tr>'}</table>`;
  $('#msgTable').innerHTML=`<table><tr><th>Name</th><th>Subject</th><th>Status</th><th></th></tr>${msgs.map(m=>`<tr><td>${esc(m.name)}<br><small>${esc(m.email)} [${m.lang}]</small></td><td>${esc(m.subject)}<br><small>${esc(m.message.slice(0,80))}</small></td><td>${m.status}</td><td><button onclick="handleMsg(${m.id})">✔</button></td></tr>`).join('')||'<tr><td colspan=4>Empty</td></tr>'}</table>`;
  $('#auditTable').innerHTML=`<table><tr><th>Time</th><th>Admin</th><th>Action</th><th>Entity</th></tr>${store.get('dh-audit',[]).slice(0,30).map(a=>`<tr><td><small>${a.ts.slice(0,19).replace('T',' ')}</small></td><td>${esc(a.admin)}</td><td>${a.action}</td><td>${a.entity} #${String(a.entityId).slice(-5)}</td></tr>`).join('')}</table>`;
  // missing translations demo
  const keys=Object.keys(T.en);
  const miss={ar:keys.filter(k=>!T.ar[k]).length,tr:keys.filter(k=>!T.tr[k]).length,fr:keys.filter(k=>!T.fr[k]).length};
  $('#transMiss').innerHTML=`Missing vs EN — AR:${miss.ar} TR:${miss.tr} FR:${miss.fr} (fallback to EN active)`;
}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
window.editReq=function(id){
  const reqs=store.get('dh-requests',[]), r=reqs.find(x=>x.id===id); if(!r) return;
  const st=prompt('Status (New|Contacted|Scheduled|Completed|Cancelled|Rejected):',r.status); if(!st) return;
  const sched=(st==='Scheduled')?(prompt('ScheduledAt (YYYY-MM-DDTHH:mm):',r.scheduledAt||'')||r.scheduledAt):r.scheduledAt;
  const ov=prompt('Free override? (leave blank to keep, true/false):','');
  let reason='';
  if(ov==='true'||ov==='false'){reason=prompt('Override reason (required):',''); if(!reason){alert('Reason required');return;} r.isFirstFree=(ov==='true');}
  r.status=st; r.scheduledAt=sched||''; r.adminNotes=(prompt('Admin notes:',r.adminNotes||'')??r.adminNotes);
  store.set('dh-requests',reqs); audit(reason?'override-free':'update-status','request',id+(reason?(' reason:'+reason):'')); renderAdmin();
};
window.handleMsg=function(id){const a=store.get('dh-msgs',[]);const m=a.find(x=>x.id===id);if(m){m.status='Handled';store.set('dh-msgs',a);audit('handle','message',id);renderAdmin();}};
window.adminLogin=function(e){e.preventDefault();const em=$('#a-email').value,pw=$('#a-pass').value;if(em==='admin@doubleh.com'&&pw==='Admin123!'){sessionStorage.setItem('dh-admin',em);audit('login','admin',em);renderAdmin();}else{$('#a-err').textContent='Invalid email or password.';}};
window.adminLogout=function(){audit('logout','admin','-');sessionStorage.removeItem('dh-admin');renderAdmin();};
window.exportReqs=function(){const b=new Blob([JSON.stringify(store.get('dh-requests',[]),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='requests.json';a.click();};

// ---- animations: crosshair, magnetic, tilt, reveal, particles, progress ----
function initFx(){
  const dot=$('#cDot'),ring=$('#cRing'),cross=$('#cCross');
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px';cross.style.left=mx+'px';cross.style.top=my+'px';});
  (function loop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop)})();
  document.addEventListener('mouseover',e=>{if(e.target.closest('button,a,input,textarea,select,.card,.consult'))ring.classList.add('is-hover')});
  document.addEventListener('mouseout',e=>{if(e.target.closest('button,a,input,textarea,select,.card,.consult'))ring.classList.remove('is-hover')});
  document.addEventListener('click',e=>{
    burst(e.clientX,e.clientY);
    const b=e.target.closest('.btn,.card,button'); if(!b) return;
    const r=b.getBoundingClientRect(),s=document.createElement('span');s.className='ripple';
    const sz=Math.max(r.width,r.height);s.style.cssText=`width:${sz}px;height:${sz}px;left:${e.clientX-r.left-sz/2}px;top:${e.clientY-r.top-sz/2}px`;
    b.style.position=b.style.position||'relative';b.appendChild(s);setTimeout(()=>s.remove(),650);
  });
  addEventListener('scroll',()=>{
    const h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight)*100;
    $('#progress').style.width=p+'%';
    // parallax hero
    const hero=$('#heroInner'); if(hero) hero.style.transform=`translateY(${scrollY*.08}px)`;
  },{passive:true});
  // magnetic buttons
  $$('.btn').forEach(b=>{
    b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.18}px)`});
    b.addEventListener('mouseleave',()=>b.style.transform='');
  });
  // counters
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){countUp(x.target);io.unobserve(x.target)}}));
  $$('[data-count]').forEach(el=>io.observe(el));
  bindTilt(); observeReveals();
}
function burst(x,y){
  const fx=$('#fx'); if(!fx) return;
  for(let i=0;i<10;i++){const p=document.createElement('i');p.className='particle';
    p.style.cssText=`left:${x}px;top:${y}px;background:${['#134c4b','#46766f','#12393a','#fff'][i%4]};--dx:${(Math.random()-.5)*160}px;--dy:${(Math.random()-.5)*160}px`;
    fx.appendChild(p);setTimeout(()=>p.remove(),850);}
}
function bindTilt(){
  $$('.tilt').forEach(c=>{
    if(c._tilt) return; c._tilt=1;
    c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(800px) rotateY(${px*10}deg) rotateX(${-py*10}deg) translateY(-4px)`});
    c.addEventListener('mouseleave',()=>c.style.transform='');
  });
}
let revObs;
function observeReveals(){
  revObs=revObs||new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');revObs.unobserve(x.target)}}),{threshold:.12});
  $$('.reveal:not(.visible)').forEach(el=>revObs.observe(el));
}
function countUp(el){const end=+el.dataset.count;let s=0;const step=Math.max(1,Math.round(end/40));const iv=setInterval(()=>{s+=step;if(s>=end){s=end;clearInterval(iv)}el.textContent=s},40)}

// welcome intro (big logo) — full on first view per session, quick afterwards, click to skip
function runIntro(){
  const intro=$('#intro'); if(!intro) return;
  document.body.classList.add('locked');
  let done=false;
  const finish=()=>{ if(done) return; done=true; intro.classList.add('done'); document.body.classList.remove('locked'); try{sessionStorage.setItem('dh-intro','1')}catch{} setTimeout(()=>intro.remove(),950); };
  intro.addEventListener('click',finish);
  setTimeout(finish, sessionStorage.getItem('dh-intro')?650:2400);
}

// init
document.addEventListener('DOMContentLoaded',()=>{
  runIntro();
  // seed demo data once
  if(!localStorage.getItem('dh-seed')){store.set('dh-requests',[{id:1,category:'arch',fullName:'Demo Client',email:'demo@mail.com',phone:'+905551112233',note:'Architecture consult demo',lang:'en',status:'New',isFirstFree:true,adminNotes:'',createdAt:new Date().toISOString(),scheduledAt:''}]);localStorage.setItem('dh-seed','1');}
  initFx();
  $('#year').textContent=new Date().getFullYear();
  const m=location.hash.match(/#\/(ar|tr|en|fr)\/(\w+)/);
  if(m){lang=m[1];route=m[2]} 
  applyLang(lang); nav(route||'home');
  $('#reqForm').addEventListener('submit',submitRequest);
  $('#contactForm').addEventListener('submit',submitContact);
  $('#adminForm').addEventListener('submit',window.adminLogin);
  ['fltStatus','fltCat','fltQ'].forEach(id=>$('#'+id)?.addEventListener('input',renderAdmin));
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
});
