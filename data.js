// 离线阅读：第一次打开时把页面和全部文字稿存进缓存，之后没网也能读
// 每次打开都先用缓存里的版本，同时在后台取新版本；你更新了仓库，读者下一次打开就能看到
const CACHE="sunbook-v1";
const FILES=["./","./index.html","./data.js","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",e=>{
e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
// 换了缓存名（比如改成 sunbook-v2）时，清掉旧缓存
self.addEventListener("activate",e=>{
e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
const r=e.request;
if(r.method!=="GET"||new URL(r.url).origin!==location.origin) return;
const hit=caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(res=>({c,res})));
const net=hit.then(({c})=>fetch(r).then(res=>{if(res.ok) c.put(r,res.clone()); return res}));
e.respondWith(hit.then(({res})=>res||net));
e.waitUntil(net.catch(()=>{}));
});
