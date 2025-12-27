/* --- SW.JS (CicloSmart) - Isolado --- */

// NOME ÚNICO DO CACHE: Fundamental para não misturar com o "Gestor de Leitura"
const CACHE_NAME = 'ciclosmart-cache-v2'; // Incrementado para v2 devido à mudança de estrutura

// Arquivos a serem cacheados (Use ./ para garantir que pegue desta pasta)
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  
  // Novos caminhos de Scripts
  './assets/js/core.js',
  './assets/js/app.js',
  './assets/js/changelog.js',
  
  // Arquivos Raiz
  './manifest.json',
  './favicon.ico',
  
  // Novos caminhos de Imagens
  './assets/img/logo.webp', 
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',

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
          // Apaga também a versão v1 anterior para garantir que pegue a nova estrutura
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
