const VERSION = '0.0.1-1.alpha'
const CACHE = 'static-v1'
const toUpdate = ['index.html','manifest.json']
const appLayer = ['socket.io', 'login']
var reloadFlag = 0

self.addEventListener('install', event => {
    console.log('installing...')
    event.waitUntil(
        caches.open(CACHE)
        .then(cache => cache.addAll(toUpdate))
        .then(self.skipWaiting())
    );
    reloadFlag = 1
});

self.addEventListener('activate', event => {
    console.log(`${CACHE} now ready to handle fetches.`);
    console.log('VERSION', VERSION)
});

self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    const pathList = url.pathname.split('/').filter( x => x != '')
    console.log( appLayer, 'includes', pathList[0], appLayer.includes( pathList[0] ))
    reloadFlag = typeof pathList != undefined && pathList[0] && appLayer.includes( pathList[0] ) || reloadFlag == 1 ?
      0
    : 
      (() => { event.respondWith(caches.match(url.pathname)); return 1 })()
  
});



const socket = {
    transportOptions: {
      polling: {
        extraHeaders: {
          'x-clientid': 'abc'
        }
      }
    }
  }