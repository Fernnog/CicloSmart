/* --- SW.JS (CicloSmart) - Isolado --- */

// NOME ÚNICO DO CACHE: Fundamental para não misturar com o "Gestor de Leitura"
const CACHE_NAME = 'ciclosmart-cache-v1';

// Arquivos a serem cacheados (Use ./ para garantir que pegue desta pasta)
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './core.js',
  './app.js',
  './changelog.js',
  './manifest.json',
  './favicon.ico',
  './logo.webp', 
  
  // Ícones PWA (Certifique-se que eles existem na pasta do CicloSmart)
  './icon-192.png',
  './icon-512.png',

  // Dependências externas
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

// 1. Instalação
self.addEventListener('install', event => {
  console.log('[CicloSmart SW] Instalando...');
  self.skipWaiting(); // Força ativação imediata

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[CicloSmart SW] Cacheando arquivos...');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[CicloSmart SW] Erro no cache:', err))
  );
});

// 2. Ativação e Limpeza
self.addEventListener('activate', event => {
  console.log('[CicloSmart SW] Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // APAGA APENAS caches antigos DO CICLOSMART
          // Se encontrar 'gerenciador-leitura-cache', ele IGNORA e não apaga.
          if (cacheName !== CACHE_NAME && cacheName.startsWith('ciclosmart')) {
            console.log('[CicloSmart SW] Apagando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interceptação de Rede
self.addEventListener('fetch', event => {
  // Ignora requisições que não sejam http (ex: chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Retorna do cache se tiver
      if (cachedResponse) return cachedResponse;

      // Se não, busca na rede
      return fetch(event.request).then(networkResponse => {
        // Opcional: Cachear dinamicamente novos arquivos encontrados
        return networkResponse;
      });
    })
  );
});
