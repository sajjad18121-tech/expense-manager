const V='fin-v4',FILES=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','Vazirmatn.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{const net=fetch(r).then(res=>{if(res&&res.ok&&new URL(r.url).origin===location.origin){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>hit||(r.mode==='navigate'?caches.match('index.html'):Response.error()));return hit||net}))});
const kvGet=k=>new Promise(r=>{const q=indexedDB.open('fin-app',1);q.onsuccess=()=>{const g=q.result.transaction('kv').objectStore('kv').get(k);g.onsuccess=()=>r(g.result);g.onerror=()=>r()};q.onerror=()=>r()});
const kvSet=(k,v)=>new Promise(r=>{const q=indexedDB.open('fin-app',1);q.onsuccess=()=>{const t=q.result.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>r();t.onerror=()=>r()};q.onerror=()=>r()});
const isoD=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
async function dueCheck(){const ag=(await kvGet('agenda'))||[],done=(await kvGet('notified'))||{},T=[isoD(0),isoD(1)];let ch=0;for(const a of ag){const key=a.k+'@'+a.due;if(!T.includes(a.due)||done[key])continue;await self.registration.showNotification(a.t,{body:a.b,tag:a.k,icon:'icons/icon-192.png',dir:'rtl',lang:'fa'});done[key]=Date.now();ch=1}if(ch)await kvSet('notified',done)}
self.addEventListener('periodicsync',e=>{if(e.tag==='due-check')e.waitUntil(dueCheck())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./index.html')))});
