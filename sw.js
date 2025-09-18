const CACHE_NAME = 'fry-sushi-v1.0.0';
const STATIC_CACHE = 'fry-static-v1.0.0';
const DYNAMIC_CACHE = 'fry-dynamic-v1.0.0';

// Arquivos estáticos para cache
const STATIC_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/logo.png',
    '/logo.svg',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Estratégia de cache para diferentes tipos de recursos
    if (request.method === 'GET') {
        // Cache First para arquivos estáticos
        if (STATIC_FILES.includes(url.pathname) || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
            event.respondWith(cacheFirst(request));
        }
        // Network First para imagens
        else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            event.respondWith(networkFirst(request));
        }
        // Stale While Revalidate para outras requisições
        else {
            event.respondWith(staleWhileRevalidate(request));
        }
    }
});

// Estratégia Cache First
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache First failed:', error);
        return new Response('Offline - Resource not available', { status: 503 });
    }
}

// Estratégia Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Offline - Image not available', { status: 503 });
    }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        return cachedResponse || new Response('Offline', { status: 503 });
    });
    
    return cachedResponse || fetchPromise;
}

// Background Sync para pedidos offline
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-orders') {
        event.waitUntil(syncOrders());
    }
});

async function syncOrders() {
    try {
        // Sincronizar pedidos pendentes quando voltar online
        const pendingOrders = await getPendingOrders();
        for (const order of pendingOrders) {
            await sendOrderToServer(order);
            await removePendingOrder(order.id);
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push Notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [200, 100, 200],
            data: data.data || {},
            actions: [
                {
                    action: 'open',
                    title: 'Abrir App',
                    icon: '/logo.png'
                },
                {
                    action: 'close',
                    title: 'Fechar',
                    icon: '/logo.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Funções auxiliares para gerenciamento de dados
async function getPendingOrders() {
    // Implementar lógica para buscar pedidos pendentes do IndexedDB
    return [];
}

async function sendOrderToServer(order) {
    // Implementar lógica para enviar pedido para o servidor
    console.log('Sending order to server:', order);
}

async function removePendingOrder(orderId) {
    // Implementar lógica para remover pedido pendente
    console.log('Removing pending order:', orderId);
}

// Limpeza de cache periódica
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAN_CACHE') {
        cleanOldCaches();
    }
});

async function cleanOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name !== STATIC_CACHE && name !== DYNAMIC_CACHE
    );
    
    await Promise.all(
        oldCaches.map(name => caches.delete(name))
    );
    
    console.log('Old caches cleaned');
}
