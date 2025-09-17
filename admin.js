// Admin Panel JavaScript
let db = null;
let firebaseInitialized = false;
let currentOrderId = 1;
let orders = [];
let menuData = {};

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC9UzFuG_0wYjsXkNDf776RCY8X3TpcI1Q",
    authDomain: "fryfrydelivery.firebaseapp.com",
    projectId: "fryfrydelivery",
    storageBucket: "fryfrydelivery.firebasestorage.app",
    messagingSenderId: "567260128188",
    appId: "1:567260128188:web:aac55f5a4b8944622641b9",
    measurementId: "G-SE7XWRPSRZ"
};

// Inicializar Firebase
async function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            const app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            firebaseInitialized = true;
            console.log('Firebase inicializado com sucesso!');
        } else {
            // Tentar carregar Firebase dinamicamente
            console.log('Carregando Firebase dinamicamente...');
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            firebaseInitialized = true;
            console.log('Firebase carregado dinamicamente com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
        firebaseInitialized = false;
        console.log('Usando localStorage como fallback');
    }
}

// Gerar ID único para pedido
function generateOrderId() {
    const id = `FRY${currentOrderId}DEL`;
    currentOrderId++;
    return id;
}

// Carregar dados do Firebase e localStorage
async function loadData() {
    console.log('Carregando dados...');
    
    // Carregar pedidos do Firebase primeiro
    if (firebaseInitialized && db) {
        try {
            console.log('Carregando pedidos do Firebase...');
            
            // Usar a versão compatível do Firebase
            if (typeof firebase !== 'undefined') {
                // Firebase v8 (compat)
                const ordersRef = db.collection('orders');
                const querySnapshot = await ordersRef.orderBy('timestamp', 'desc').get();
                
                orders = [];
                querySnapshot.forEach((doc) => {
                    orders.push(doc.data());
                });
            } else {
                // Firebase v9+ (modular)
                const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);
                
                orders = [];
                querySnapshot.forEach((doc) => {
                    orders.push(doc.data());
                });
            }
            
            console.log('Pedidos carregados do Firebase:', orders.length);
            
            // Atualizar currentOrderId baseado no maior ID existente
            if (orders.length > 0) {
                const maxId = Math.max(...orders.map(order => {
                    const match = order.id.match(/FRY(\d+)DEL/);
                    return match ? parseInt(match[1]) : 0;
                }));
                currentOrderId = maxId + 1;
            }
            
            // Salvar no localStorage como backup
            localStorage.setItem('fryOrders', JSON.stringify(orders));
            
        } catch (error) {
            console.error('Erro ao carregar do Firebase:', error);
            // Fallback para localStorage
            loadFromLocalStorage();
        }
    } else {
        console.log('Firebase não inicializado, carregando do localStorage');
        loadFromLocalStorage();
    }
}

// Função auxiliar para carregar do localStorage
function loadFromLocalStorage() {
    const savedOrders = localStorage.getItem('fryOrders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
        console.log('Pedidos carregados do localStorage:', orders.length);
        // Atualizar currentOrderId baseado no maior ID existente
        if (orders.length > 0) {
            const maxId = Math.max(...orders.map(order => {
                const match = order.id.match(/FRY(\d+)DEL/);
                return match ? parseInt(match[1]) : 0;
            }));
            currentOrderId = maxId + 1;
        }
    } else {
        console.log('Nenhum pedido encontrado no localStorage');
        orders = [];
    }
}

// Carregar menu
function loadMenuData() {
    // Carregar menu
    const savedMenu = localStorage.getItem('fryMenu');
    if (savedMenu) {
        menuData = JSON.parse(savedMenu);
    } else {
        // Menu padrão
        menuData = {
            bigHots: [
                { id: 1, name: "Big Hot de Tilápia + 2 Minis", description: "Crocante e gostoso!", price: 49.90, emoji: "🍣", category: "bigHots" },
                { id: 2, name: "Big Hot de Salmão + 2 Minis", description: "Crocante e gostoso!", price: 59.90, emoji: "🍣", category: "bigHots" },
                { id: 3, name: "40 Hots Filadélfia", description: "40 irresistíveis e deliciosos hots.", price: 40.00, emoji: "🍣", category: "bigHots" }
            ],
            miniSushiDog: [
                { id: 4, name: "Mini Sushi Dog Salmão", description: "Mini hot dog de sushi recheado com salmão", price: 27.90, emoji: "🌭", category: "miniSushiDog" },
                { id: 5, name: "Mini Sushi Dog Tilápia", description: "Mini hot dog de sushi recheado com tilápia", price: 21.90, emoji: "🌭", category: "miniSushiDog" }
            ],
            combos: [
                { id: 6, name: "Sushidogroll Combo Casal Tilápia", description: "Delicioso combo para duas pessoas", price: 69.90, emoji: "🍱", category: "combos" },
                { id: 7, name: "Sushidogroll Combo Casal Salmão", description: "Delicioso combo para duas pessoas", price: 79.90, emoji: "🍱", category: "combos" }
            ],
            bebidas: [
                { id: 10, name: "Água Mineral Águai 510ml", description: "Água mineral natural", price: 3.99, emoji: "💧", category: "bebidas" },
                { id: 11, name: "Pepsi 1,5L", description: "Refrigerante Pepsi 1,5 litros", price: 8.99, emoji: "🥤", category: "bebidas" }
            ]
        };
    }
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('fryOrders', JSON.stringify(orders));
    localStorage.setItem('fryMenu', JSON.stringify(menuData));
}

// Atualizar estatísticas
function updateStats() {
    const totalPedidos = orders.length;
    const pedidosPendentes = orders.filter(order => order.status === 'pendente').length;
    const pedidosPreparando = orders.filter(order => order.status === 'preparando').length;
    const pedidosProntos = orders.filter(order => order.status === 'pronto').length;
    const pedidosEntregues = orders.filter(order => order.status === 'entregue').length;
    
    const hoje = new Date().toDateString();
    const faturamentoHoje = orders
        .filter(order => new Date(order.timestamp).toDateString() === hoje)
        .reduce((total, order) => total + order.total, 0);

    document.getElementById('totalPedidos').textContent = totalPedidos;
    document.getElementById('pedidosPendentes').textContent = pedidosPendentes;
    document.getElementById('pedidosPreparando').textContent = pedidosPreparando;
    document.getElementById('pedidosProntos').textContent = pedidosProntos;
    document.getElementById('pedidosEntregues').textContent = pedidosEntregues;
    document.getElementById('faturamentoHoje').textContent = `R$ ${faturamentoHoje.toFixed(2).replace('.', ',')}`;
    
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString('pt-BR');
}

// Renderizar pedidos
function renderOrders(filter = 'all') {
    const pedidosList = document.getElementById('pedidosList');
    if (!pedidosList) {
        console.error('Elemento pedidosList não encontrado');
        return;
    }
    
    let filteredOrders = orders || [];
    
    if (filter !== 'all') {
        filteredOrders = orders.filter(order => order.status === filter);
    }
    
    console.log('Renderizando pedidos:', filteredOrders.length, 'filtro:', filter);
    
    // Ordenar por data (mais recentes primeiro)
    filteredOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (filteredOrders.length === 0) {
        pedidosList.innerHTML = '<div class="no-orders">Nenhum pedido encontrado</div>';
        return;
    }
    
    pedidosList.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
            <div class="order-info">
                <div class="order-info-item">
                    <span class="order-info-label">Cliente</span>
                    <span class="order-info-value">${order.cliente}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Telefone</span>
                    <span class="order-info-value">${order.telefone}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Total</span>
                    <span class="order-info-value">R$ ${order.total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Data</span>
                    <span class="order-info-value">${new Date(order.timestamp).toLocaleString('pt-BR')}</span>
                </div>
            </div>
            <div class="order-items">
                <h4>Itens:</h4>
                ${order.itens.map(item => `
                    <div class="order-item">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-actions">
                <button class="btn-primary" onclick="editOrder('${order.id}')">Editar Status</button>
                <button class="btn-secondary" onclick="viewOrderDetails('${order.id}')">Ver Detalhes</button>
            </div>
        </div>
    `).join('');
}

// Renderizar cardápio
function renderCardapio() {
    const cardapioGrid = document.getElementById('cardapioGrid');
    const allItems = Object.values(menuData).flat();
    
    cardapioGrid.innerHTML = allItems.map(item => `
        <div class="cardapio-item">
            <div class="cardapio-item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : item.emoji}
            </div>
            <div class="cardapio-item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="cardapio-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
            </div>
        </div>
    `).join('');
}

// Renderizar fotos dos produtos
function renderProductPhotos() {
    const productsPhotos = document.getElementById('productsPhotos');
    const allItems = Object.values(menuData).flat();
    
    productsPhotos.innerHTML = allItems.map(item => `
        <div class="product-photo">
            <img src="${item.image || 'https://via.placeholder.com/200x150?text=Sem+Imagem'}" alt="${item.name}">
            <h4>${item.name}</h4>
        </div>
    `).join('');
}

// Editar pedido
function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    document.getElementById('editOrderId').textContent = orderId;
    document.getElementById('editOrderStatus').value = order.status;
    document.getElementById('editOrderNotes').value = order.notes || '';
    
    document.getElementById('editOrderModal').classList.add('active');
}

// Salvar edição do pedido
async function saveOrderEdit() {
    const orderId = document.getElementById('editOrderId').textContent;
    const newStatus = document.getElementById('editOrderStatus').value;
    const notes = document.getElementById('editOrderNotes').value;
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        order.notes = notes;
        order.updatedAt = new Date().toISOString();
        
        // Salvar no Firebase se estiver disponível
        if (firebaseInitialized && db) {
            try {
                if (typeof firebase !== 'undefined') {
                    // Firebase v8 (compat)
                    const ordersRef = db.collection('orders');
                    const querySnapshot = await ordersRef.where('id', '==', orderId).get();
                    
                    if (!querySnapshot.empty) {
                        const doc = querySnapshot.docs[0];
                        await doc.ref.update({
                            status: newStatus,
                            notes: notes,
                            updatedAt: order.updatedAt
                        });
                        console.log('Pedido atualizado no Firebase (v8)');
                    }
                } else {
                    // Firebase v9+ (modular)
                    const { collection, query, where, getDocs, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    const ordersRef = collection(db, 'orders');
                    const q = query(ordersRef, where('id', '==', orderId));
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        const doc = querySnapshot.docs[0];
                        await updateDoc(doc.ref, {
                            status: newStatus,
                            notes: notes,
                            updatedAt: order.updatedAt
                        });
                        console.log('Pedido atualizado no Firebase (v9+)');
                    }
                }
            } catch (error) {
                console.error('Erro ao atualizar no Firebase:', error);
            }
        }
        
        saveData();
        renderOrders(document.getElementById('statusFilter').value);
        updateStats();
        
        document.getElementById('editOrderModal').classList.remove('active');
        showNotification('Pedido atualizado com sucesso!', 'success');
    }
}

// Ver detalhes do pedido
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    alert(`Detalhes do Pedido ${orderId}:\n\nCliente: ${order.cliente}\nTelefone: ${order.telefone}\nStatus: ${order.status}\nTotal: R$ ${order.total.toFixed(2).replace('.', ',')}\nData: ${new Date(order.timestamp).toLocaleString('pt-BR')}\n\nItens:\n${order.itens.map(item => `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`).join('\n')}`);
}

// Upload de imagem
function setupImageUpload() {
    const productSelect = document.getElementById('productSelect');
    const imageUpload = document.getElementById('imageUpload');
    const uploadBtn = document.getElementById('uploadBtn');
    const imagePreview = document.getElementById('imagePreview');
    
    // Popular select com produtos
    const allItems = Object.values(menuData).flat();
    productSelect.innerHTML = '<option value="">Escolha um produto</option>' + 
        allItems.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
    
    // Preview da imagem
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Upload
    uploadBtn.addEventListener('click', function() {
        const productId = parseInt(productSelect.value);
        const file = imageUpload.files[0];
        
        if (!productId || !file) {
            showNotification('Selecione um produto e uma imagem!', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            
            // Encontrar o produto e atualizar a imagem
            const allItems = Object.values(menuData).flat();
            const product = allItems.find(item => item.id === productId);
            
            if (product) {
                product.image = base64Image;
                saveData();
                renderCardapio();
                renderProductPhotos();
                showNotification('Imagem salva com sucesso!', 'success');
                
                // Limpar formulário
                productSelect.value = '';
                imageUpload.value = '';
                imagePreview.innerHTML = '';
            }
        };
        reader.readAsDataURL(file);
    });
}

// Navegação entre seções
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            // Atualizar navegação
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar seção
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Atualizar conteúdo específico
            if (targetSection === 'pedidos') {
                renderOrders();
            } else if (targetSection === 'cardapio') {
                renderCardapio();
            } else if (targetSection === 'fotos') {
                renderProductPhotos();
            }
        });
    });
}

// Filtro de status
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    statusFilter.addEventListener('change', function() {
        renderOrders(this.value);
    });
}

// Modal
function setupModal() {
    const modal = document.getElementById('editOrderModal');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const saveBtn = document.getElementById('saveOrderBtn');
    
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    saveBtn.addEventListener('click', saveOrderEdit);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Logout
function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('fry_session');
            window.location.href = 'index.html';
        }
    });
}

// Notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Verificar autenticação
function checkAuth() {
    const session = localStorage.getItem('fry_session');
    if (!session) {
        console.log('Usuário não autenticado, redirecionando...');
        window.location.href = 'index.html';
        return false;
    }
    
    const sessionData = JSON.parse(session);
    const now = Date.now();
    const sessionAge = now - sessionData.timestamp;
    
    // Verificar se a sessão expirou (30 minutos)
    if (sessionAge > 30 * 60 * 1000) {
        console.log('Sessão expirada, redirecionando...');
        localStorage.removeItem('fry_session');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Inicializar aplicação
async function initializeAdmin() {
    console.log('Inicializando painel administrativo...');
    
    // Verificar autenticação
    if (!checkAuth()) {
        return;
    }
    
    // Inicializar Firebase
    await initializeFirebase();
    
    // Carregar dados
    await loadData();
    loadMenuData();
    
    // Configurar event listeners
    setupNavigation();
    setupFilters();
    setupModal();
    setupLogout();
    setupImageUpload();
    
    // Renderizar conteúdo inicial
    updateStats();
    renderOrders();
    renderCardapio();
    renderProductPhotos();
    
    // Configurar atualização em tempo real
    setupRealTimeUpdates();
    
    console.log('Painel administrativo inicializado!');
}

// Configurar atualização em tempo real
function setupRealTimeUpdates() {
    console.log('Configurando atualizações em tempo real...');
    
    // Verificar mudanças no Firebase a cada 3 segundos
    setInterval(async () => {
        try {
            if (firebaseInitialized && db) {
                // Carregar do Firebase
                let newOrders = [];
                
                if (typeof firebase !== 'undefined') {
                    // Firebase v8 (compat)
                    const ordersRef = db.collection('orders');
                    const querySnapshot = await ordersRef.orderBy('timestamp', 'desc').get();
                    
                    querySnapshot.forEach((doc) => {
                        newOrders.push(doc.data());
                    });
                } else {
                    // Firebase v9+ (modular)
                    const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    const ordersRef = collection(db, 'orders');
                    const q = query(ordersRef, orderBy('timestamp', 'desc'));
                    const querySnapshot = await getDocs(q);
                    
                    querySnapshot.forEach((doc) => {
                        newOrders.push(doc.data());
                    });
                }
                
                if (newOrders.length !== orders.length || JSON.stringify(newOrders) !== JSON.stringify(orders)) {
                    console.log('Novos pedidos detectados no Firebase, atualizando...', newOrders.length, 'pedidos');
                    orders = newOrders;
                    updateStats();
                    const currentFilter = document.getElementById('statusFilter')?.value || 'all';
                    renderOrders(currentFilter);
                    
                    // Atualizar localStorage
                    localStorage.setItem('fryOrders', JSON.stringify(orders));
                }
            } else {
                // Fallback para localStorage
                const savedOrders = localStorage.getItem('fryOrders');
                if (savedOrders) {
                    const newOrders = JSON.parse(savedOrders);
                    if (newOrders.length !== orders.length || JSON.stringify(newOrders) !== JSON.stringify(orders)) {
                        console.log('Novos pedidos detectados no localStorage, atualizando...', newOrders.length, 'pedidos');
                        orders = newOrders;
                        updateStats();
                        const currentFilter = document.getElementById('statusFilter')?.value || 'all';
                        renderOrders(currentFilter);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao verificar pedidos:', error);
        }
    }, 3000);
    
    // Verificar mudanças no menu a cada 5 segundos
    setInterval(() => {
        try {
            const savedMenu = localStorage.getItem('fryMenu');
            if (savedMenu) {
                const newMenu = JSON.parse(savedMenu);
                if (JSON.stringify(newMenu) !== JSON.stringify(menuData)) {
                    console.log('Menu atualizado, recarregando...');
                    menuData = newMenu;
                    renderCardapio();
                    renderProductPhotos();
                }
            }
        } catch (error) {
            console.error('Erro ao verificar menu:', error);
        }
    }, 5000);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initializeAdmin);

// Adicionar CSS para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
