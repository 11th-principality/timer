/* sw.js – ちいさい春木大佐たちのタイマー Service Worker */

const CACHE_NAME = 'haruki-timer-v1';

// キャッシュしたいファイル一覧
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  // キャラクター画像
  './chara_normal.png',
  './chara_eat.png',
  './chara1_sleep.png',
  './chara1_kyaa.png',
  './chara_think.png',
  './chara_cheer.png',
  './chara_stretch.png',
  './chara_dance.png',
  './chara_death.png',
  './chara_death_eat.png',
  './chara3_sleep.png',
  './chara3_kyaa.png',
  './chara_death_think.png',
  './chara_death_cheer.png',
  './chara_death_stretch.png',
  './chara_death_dance.png',
  // 背景
  './bg_sea_morning.png',
  './bg_sea_day.png',
  './bg_sea_evening.png',
  './bg_sea_night.png',
  './bg_rain_morning.png',
  './bg_rain_day.png',
  './bg_rain_evening.png',
  './bg_rain_night.png',
  './bg_forest_morning.png',
  './bg_forest_day.png',
  './bg_forest_evening.png',
  './bg_forest_night.png',
  // アイコン
  './icon-192.png',
  './icon-512.png',
  './icon-apple.png',
  // 音声
  './sound_sea.mp3',
  './sound_rain.mp3',
  './sound_forest.mp3',
  './alarm_bell.mp3',
  './alarm_chime.mp3',
  './alarm_marimba.mp3',
  './tabe.mp3',
  './sound_chat.mp3',
  './sound_drag.mp3',
  './sound_drop.mp3',
  // おやつ画像
  './snack.png',
  './parfait.png',
  './food_meat.png',
  './food_omurice.png',
];

// インストール時：キャッシュに登録（失敗してもSW自体は動く）
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url).catch(() => {}))
      )
    )
  );
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// フェッチ時：キャッシュ優先、なければネットワーク
self.addEventListener('fetch', event => {
  // chrome-extension や非HTTPリクエストはスルー
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // 正常なレスポンスはキャッシュに追加
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // オフラインかつキャッシュにもない場合
        return new Response('オフラインです', { status: 503 });
      });
    })
  );
});
