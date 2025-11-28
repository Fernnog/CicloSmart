/* --- SW.JS - Service Worker do CicloSmart --- */

// Nome do Cache (Alterar este nome força a atualização do cache nos usuários)
const CACHE_NAME = 'ciclosmart-v1.1';

// Lista de arquivos para salvar localmente.
// O uso de './' garante que funcione dentro da subpasta /CicloSmart/ no GitHub Pages.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './core.js',
  './app.js',
  './changelog.js',
  './favicon.ico',
  './logo.webp',       // Logotipo usado no Header
  './icon-192.png',    // Ícone PWA (Obrigatório criar)
  './icon-512.png',    // Ícone PWA (Obrigatório criar)
  
  // Dependências Externas (CDNs)
  // Nota: Se o usuário abrir offline pela primeira vez, estes links precisam estar cacheados
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

// 1. Instalação: Baixa e salva os arquivos no cache
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  // Força o SW a ativar imediatamente, sem esperar o usuário fechar a aba
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando arquivos...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Ativação: Limpa caches antigos (Gerenciamento de versão)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Se a chave do cache for diferente da atual, apaga (limpeza)
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removendo cache antigo:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  
  // Garante que o SW controle a página imediatamente
  return self.clients.claim();
});

// 3. Fetch: Intercepta requisições (Modo Offline)
self.addEventListener('fetch', (event) => {
  // Estratégia: Cache First, falling back to Network
  // (Tenta pegar do cache; se não tiver, tenta a internet)
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna o arquivo do cache se encontrar
      if (response) {
        return response;
      }
      // Se não, busca na rede
      return fetch(event.request);
    })
  );
});
