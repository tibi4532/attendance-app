// 勤怠管理アプリ オフライン用。
// 通信できるときは常に最新の index.html を取りにいき、取れたら端末に保存する。
// 通信できない(Wi-Fiなし)ときは、端末に保存した版を使う。
// 更新時は VERSION を変える(古い保存分が消える)。
const VERSION = 'attendance-v5';
const FILES = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(FILES.map(f => fetch(f, { cache: 'reload' }).then(r => c.put(f, r)))))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(res => {
        if (res && res.ok && new URL(e.request.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(h => h || caches.match('./index.html')))
  );
});
