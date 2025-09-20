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
        console.log('🔄 Inicializando Firebase...');
        
        if (typeof firebase !== 'undefined') {
            // Firebase v8 (compat) - já carregado no HTML
            console.log('🔥 Usando Firebase v8 (compat)');
            
            // Verificar se já foi inicializado
            if (firebase.apps.length === 0) {
                const app = firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase app inicializado');
            } else {
                console.log('✅ Firebase app já inicializado');
            }
            
            db = firebase.firestore();
            firebaseInitialized = true;
            console.log('✅ Firebase v8 inicializado com sucesso!');
            console.log('🔥 DB:', !!db);
            
            // Testar conexão imediatamente
            await testFirebaseConnection();
            
        } else {
            console.error('❌ Firebase não encontrado! Verifique se os scripts estão carregados.');
            firebaseInitialized = false;
            return;
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        firebaseInitialized = false;
    }
}

// Testar conexão Firebase
async function testFirebaseConnection() {
    if (!db) {
        console.error('❌ DB não disponível para teste');
        return;
    }
    
    try {
        console.log('🧪 Testando conexão Firebase...');
        const testRef = db.collection('orders');
        const testSnapshot = await testRef.limit(1).get();
        console.log('✅ Conexão Firebase OK! Documentos encontrados:', testSnapshot.size);
    } catch (error) {
        console.error('❌ Erro no teste de conexão:', error);
    }
}

// Gerar ID único para pedido
function generateOrderId() {
    const id = `FRY${currentOrderId}DEL`;
    currentOrderId++;
    return id;
}

// Carregar dados APENAS do Firebase (100% Firebase)
async function loadData() {
    console.log('🔄 Carregando dados APENAS do Firebase...');
    
    // SEMPRE carregar do Firebase - SEM FALLBACK
    if (!firebaseInitialized || !db) {
        console.error('❌ Firebase não inicializado! Não é possível carregar pedidos.');
        console.log('🔧 Verifique a configuração do Firebase');
        orders = [];
        return;
    }
    
    try {
        console.log('🔄 Carregando pedidos do Firebase...');
        console.log('🔥 DB disponível:', !!db);
        console.log('🔥 Firebase inicializado:', firebaseInitialized);
        
        // Usar Firebase v8 (compat) - sempre
        console.log('🔥 Carregando pedidos do Firebase v8...');
        const ordersRef = db.collection('orders');
        console.log('🔥 OrdersRef criado:', !!ordersRef);
        
        const querySnapshot = await ordersRef.orderBy('timestamp', 'desc').get();
        console.log('🔥 Query executada. Documentos encontrados:', querySnapshot.size);
        
        orders = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('📄 Pedido encontrado:', data.id, '- Cliente:', data.cliente);
            orders.push(data);
        });
        
        console.log('✅ Pedidos carregados do Firebase:', orders.length);
        console.log('📊 Lista de pedidos:', orders.map(o => o.id));
        
        // Atualizar currentOrderId baseado no maior ID existente
        if (orders.length > 0) {
            const maxId = Math.max(...orders.map(order => {
                const match = order.id.match(/FRY(\d+)DEL/);
                return match ? parseInt(match[1]) : 0;
            }));
            currentOrderId = maxId + 1;
        }
        
        // NÃO salvar no localStorage - apenas Firebase
        console.log('🔥 Dados carregados 100% do Firebase');
        
        // RENDERIZAR PEDIDOS IMEDIATAMENTE
        console.log('🎨 Renderizando pedidos na tela...');
        renderOrders('all');
        updateStats();
        
    } catch (error) {
        console.error('❌ Erro ao carregar do Firebase:', error);
        console.log('❌ SEM FALLBACK - Firebase é obrigatório');
        orders = [];
    }
}

// Função removida - admin agora usa 100% Firebase

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
                { id: 1, name: "Big Hot de Tilápia", description: "Crocante e gostoso!", price: 49.90, emoji: "🍣", category: "bigHots" },
                { id: 2, name: "Big Hot de Salmão", description: "Crocante e gostoso!", price: 59.90, emoji: "🍣", category: "bigHots" },
                { id: 3, name: "Hot Filadélfia por 15 reais", description: "O mais poderoso dos hots! Super recheado e irresistível.", price: 15.00, emoji: "🍣", category: "bigHots" }
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
    // Admin não salva mais no localStorage - apenas Firebase
    console.log('💾 Dados salvos apenas no Firebase');
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
    console.log('🎨 INICIANDO RENDERIZAÇÃO DE PEDIDOS...');
    console.log('📊 Total de pedidos na memória:', orders.length);
    console.log('🔍 Filtro aplicado:', filter);
    
    const pedidosList = document.getElementById('pedidosList');
    if (!pedidosList) {
        console.error('❌ Elemento pedidosList não encontrado!');
        return;
    }
    
    console.log('✅ Elemento pedidosList encontrado');
    
    let filteredOrders = orders || [];
    
    if (filter !== 'all') {
        filteredOrders = orders.filter(order => order.status === filter);
    }
    
    console.log('📊 Pedidos filtrados:', filteredOrders.length);
    console.log('📋 Lista de pedidos para renderizar:', filteredOrders.map(o => o.id));
    
    // Ordenar por data (mais recentes primeiro)
    filteredOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (filteredOrders.length === 0) {
        console.log('⚠️ Nenhum pedido encontrado para renderizar');
        pedidosList.innerHTML = '<div class="no-orders">Nenhum pedido encontrado</div>';
        return;
    }
    
    console.log('🎨 Renderizando', filteredOrders.length, 'pedidos na tela...');
    
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
    
    console.log('✅ Pedidos renderizados com sucesso na tela!');
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
        
        // Salvar no Firebase v8 (compat)
        if (firebaseInitialized && db) {
            try {
                console.log('🔄 Atualizando pedido no Firebase...');
                const ordersRef = db.collection('orders');
                const querySnapshot = await ordersRef.where('id', '==', orderId).get();
                
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    await doc.ref.update({
                        status: newStatus,
                        notes: notes,
                        updatedAt: order.updatedAt
                    });
                    console.log('✅ Pedido atualizado no Firebase v8');
                } else {
                    console.log('⚠️ Pedido não encontrado no Firebase');
                }
            } catch (error) {
                console.error('❌ Erro ao atualizar no Firebase:', error);
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
    
    // Inicializar gerenciamento de cardápio
    initializeMenuManagement();
    
    // Renderizar conteúdo inicial
    updateStats();
    renderOrders('all');
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
            console.log('🔄 Verificando atualizações... Firebase inicializado:', firebaseInitialized, 'DB:', !!db);
            
            // SEMPRE usar Firebase - SEM FALLBACK
            if (!firebaseInitialized || !db) {
                console.error('❌ Firebase não disponível! Atualizações em tempo real desabilitadas.');
                return;
            }
            
            // Carregar do Firebase v8 (compat)
            let newOrders = [];
            console.log('🔄 Verificando pedidos no Firebase...');
            console.log('🔥 DB disponível:', !!db);
            
            const ordersRef = db.collection('orders');
            const querySnapshot = await ordersRef.orderBy('timestamp', 'desc').get();
            
            console.log('🔥 Query executada. Documentos encontrados:', querySnapshot.size);
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log('📄 Pedido encontrado:', data.id, '- Cliente:', data.cliente);
                newOrders.push(data);
            });
            
            console.log('📊 Pedidos encontrados no Firebase:', newOrders.length);
            console.log('📊 IDs dos pedidos:', newOrders.map(o => o.id));
            
            // Comparar pedidos de forma mais eficiente
            const hasChanges = newOrders.length !== orders.length || 
                newOrders.some((newOrder, index) => {
                    const oldOrder = orders[index];
                    return !oldOrder || newOrder.id !== oldOrder.id || newOrder.updatedAt !== oldOrder.updatedAt;
                });
            
            if (hasChanges) {
                console.log('🔥 Novos pedidos detectados no Firebase, atualizando...', newOrders.length, 'pedidos');
                orders = newOrders;
                updateStats();
                const currentFilter = document.getElementById('statusFilter')?.value || 'all';
                renderOrders(currentFilter);
                
                // NÃO atualizar localStorage - apenas Firebase
                console.log('✅ Atualização 100% do Firebase concluída');
            }
        } catch (error) {
            console.error('❌ Erro ao verificar pedidos:', error);
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

// ==================== GERENCIAMENTO DE CARDÁPIO ====================

let currentEditingItem = null;
let currentFilter = 'all';

// Inicializar gerenciamento de cardápio
function initializeMenuManagement() {
    console.log('🍣 Inicializando gerenciamento de cardápio...');
    
    // Carregar dados do cardápio
    loadMenuData();
    
    // Event listeners
    setupMenuEventListeners();
    
    // Renderizar cardápio
    renderMenuGrid();
}

// Configurar event listeners do cardápio
function setupMenuEventListeners() {
    // Botão adicionar item
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => openMenuModal());
    }
    
    // Modal de cardápio
    const menuModal = document.getElementById('menuModal');
    const closeMenuModal = document.getElementById('closeMenuModal');
    const cancelMenuBtn = document.getElementById('cancelMenuBtn');
    const saveMenuBtn = document.getElementById('saveMenuBtn');
    const deleteMenuBtn = document.getElementById('deleteMenuBtn');
    
    if (closeMenuModal) {
        closeMenuModal.addEventListener('click', () => closeMenuModal());
    }
    
    if (cancelMenuBtn) {
        cancelMenuBtn.addEventListener('click', () => closeMenuModal());
    }
    
    if (saveMenuBtn) {
        saveMenuBtn.addEventListener('click', () => saveMenuItem());
    }
    
    if (deleteMenuBtn) {
        deleteMenuBtn.addEventListener('click', () => deleteMenuItem());
    }
    
    // Filtros de categoria
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            filterMenuItems(category);
        });
    });
    
    // Fechar modal clicando fora
    if (menuModal) {
        menuModal.addEventListener('click', (e) => {
            if (e.target === menuModal) {
                closeMenuModal();
            }
        });
    }
}

// Carregar dados do cardápio
function loadMenuData() {
    const savedMenu = localStorage.getItem('fryMenuData');
    if (savedMenu) {
        try {
            menuData = JSON.parse(savedMenu);
            console.log('✅ Cardápio carregado do localStorage');
        } catch (error) {
            console.error('❌ Erro ao carregar cardápio:', error);
            loadDefaultMenu();
        }
    } else {
        loadDefaultMenu();
    }
}

// Carregar cardápio padrão
function loadDefaultMenu() {
    menuData = {
        bigHots: [
            { id: 1, name: "Big Hot de Tilápia", description: "Crocante e gostoso!", price: 49.90, emoji: "🍣", category: "bigHots", available: true },
            { id: 2, name: "Big Hot de Salmão", description: "Crocante e gostoso!", price: 59.90, emoji: "🍣", category: "bigHots", available: true },
            { id: 3, name: "Hot Filadélfia por 15 reais", description: "O mais poderoso dos hots! Super recheado e irresistível.", price: 15.00, emoji: "🍣", category: "bigHots", available: true }
        ],
        miniSushiDog: [
            { id: 4, name: "Mini Sushi Dog Salmão", description: "Mini hot dog de sushi recheado com salmão", price: 27.90, emoji: "🌭", category: "miniSushiDog", available: true },
            { id: 5, name: "Mini Sushi Dog Tilápia", description: "Mini hot dog de sushi recheado com tilápia", price: 21.90, emoji: "🌭", category: "miniSushiDog", available: true }
        ],
        sushiRolls: [
            { id: 6, name: "Sushi Roll Salmão", description: "Delicioso sushi roll com salmão fresco", price: 35.90, emoji: "🍣", category: "sushiRolls", available: true },
            { id: 7, name: "Sushi Roll Tilápia", description: "Sushi roll com tilápia grelhada", price: 29.90, emoji: "🍣", category: "sushiRolls", available: true }
        ],
        bebidas: [
            { id: 8, name: "Refrigerante Lata", description: "Refrigerante gelado 350ml", price: 4.50, emoji: "🥤", category: "bebidas", available: true },
            { id: 9, name: "Suco Natural", description: "Suco natural de frutas", price: 6.90, emoji: "🧃", category: "bebidas", available: true }
        ]
    };
    
    saveMenuData();
    console.log('✅ Cardápio padrão carregado');
}

// Salvar dados do cardápio
function saveMenuData() {
    try {
        localStorage.setItem('fryMenuData', JSON.stringify(menuData));
        console.log('✅ Cardápio salvo no localStorage');
    } catch (error) {
        console.error('❌ Erro ao salvar cardápio:', error);
    }
}

// Renderizar grid do cardápio
function renderMenuGrid() {
    const cardapioGrid = document.getElementById('cardapioGrid');
    if (!cardapioGrid) return;
    
    const allItems = [];
    Object.values(menuData).forEach(category => {
        allItems.push(...category);
    });
    
    const filteredItems = currentFilter === 'all' 
        ? allItems 
        : allItems.filter(item => item.category === currentFilter);
    
    cardapioGrid.innerHTML = filteredItems.map(item => `
        <div class="menu-item-card ${!item.available ? 'menu-item-unavailable' : ''}" data-id="${item.id}">
            <div class="menu-item-header">
                <h3 class="menu-item-title">${item.name}</h3>
                <span class="menu-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <p class="menu-item-description">${item.description}</p>
            <div class="menu-item-meta">
                <span class="menu-item-category">${getCategoryName(item.category)}</span>
                <span class="menu-item-emoji">${item.emoji}</span>
            </div>
            <div class="menu-item-actions">
                <button class="edit-menu-btn" onclick="editMenuItem(${item.id})">✏️ Editar</button>
                <button class="delete-menu-btn" onclick="confirmDeleteMenuItem(${item.id})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

// Obter nome da categoria
function getCategoryName(category) {
    const names = {
        'bigHots': 'Big Hots',
        'miniSushiDog': 'Mini Sushi Dogs',
        'sushiRolls': 'Sushi Rolls',
        'bebidas': 'Bebidas'
    };
    return names[category] || category;
}

// Filtrar itens do cardápio
function filterMenuItems(category) {
    currentFilter = category;
    
    // Atualizar botões de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Renderizar grid filtrado
    renderMenuGrid();
}

// Abrir modal de cardápio
function openMenuModal(itemId = null) {
    const modal = document.getElementById('menuModal');
    const title = document.getElementById('menuModalTitle');
    const deleteBtn = document.getElementById('deleteMenuBtn');
    
    if (itemId) {
        // Modo edição
        currentEditingItem = itemId;
        title.textContent = 'Editar Produto';
        deleteBtn.style.display = 'inline-block';
        fillMenuForm(itemId);
    } else {
        // Modo adição
        currentEditingItem = null;
        title.textContent = 'Adicionar Produto';
        deleteBtn.style.display = 'none';
        clearMenuForm();
    }
    
    modal.style.display = 'flex';
}

// Fechar modal de cardápio
function closeMenuModal() {
    const modal = document.getElementById('menuModal');
    modal.style.display = 'none';
    currentEditingItem = null;
    clearMenuForm();
}

// Preencher formulário de edição
function fillMenuForm(itemId) {
    const item = findMenuItemById(itemId);
    if (!item) return;
    
    document.getElementById('productName').value = item.name;
    document.getElementById('productDescription').value = item.description;
    document.getElementById('productPrice').value = item.price;
    document.getElementById('productEmoji').value = item.emoji;
    document.getElementById('productCategory').value = item.category;
    document.getElementById('productImage').value = item.image || '';
    document.getElementById('productAvailable').checked = item.available;
}

// Limpar formulário
function clearMenuForm() {
    document.getElementById('menuForm').reset();
    document.getElementById('productAvailable').checked = true;
}

// Encontrar item por ID
function findMenuItemById(id) {
    for (const category of Object.values(menuData)) {
        const item = category.find(item => item.id === id);
        if (item) return item;
    }
    return null;
}

// Salvar item do cardápio
function saveMenuItem() {
    const form = document.getElementById('menuForm');
    const formData = new FormData(form);
    
    const itemData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        emoji: formData.get('emoji') || '🍣',
        category: formData.get('category'),
        image: formData.get('image') || '',
        available: formData.get('available') === 'on'
    };
    
    // Validação
    if (!itemData.name || !itemData.description || !itemData.price) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (currentEditingItem) {
        // Editar item existente
        updateMenuItem(currentEditingItem, itemData);
    } else {
        // Adicionar novo item
        addMenuItem(itemData);
    }
    
    closeMenuModal();
    renderMenuGrid();
}

// Adicionar novo item
function addMenuItem(itemData) {
    const newId = getNextItemId();
    const newItem = { ...itemData, id: newId };
    
    if (!menuData[itemData.category]) {
        menuData[itemData.category] = [];
    }
    
    menuData[itemData.category].push(newItem);
    saveMenuData();
    
    console.log('✅ Item adicionado:', newItem);
    showNotification('Produto adicionado com sucesso!', 'success');
}

// Atualizar item existente
function updateMenuItem(itemId, itemData) {
    for (const category of Object.keys(menuData)) {
        const itemIndex = menuData[category].findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            menuData[category][itemIndex] = { ...itemData, id: itemId };
            saveMenuData();
            console.log('✅ Item atualizado:', itemData);
            showNotification('Produto atualizado com sucesso!', 'success');
            return;
        }
    }
}

// Excluir item
function deleteMenuItem() {
    if (!currentEditingItem) return;
    
    for (const category of Object.keys(menuData)) {
        const itemIndex = menuData[category].findIndex(item => item.id === currentEditingItem);
        if (itemIndex !== -1) {
            menuData[category].splice(itemIndex, 1);
            saveMenuData();
            console.log('✅ Item excluído:', currentEditingItem);
            showNotification('Produto excluído com sucesso!', 'success');
            return;
        }
    }
}

// Confirmar exclusão
function confirmDeleteMenuItem(itemId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        currentEditingItem = itemId;
        deleteMenuItem();
        closeMenuModal();
        renderMenuGrid();
    }
}

// Editar item
function editMenuItem(itemId) {
    openMenuModal(itemId);
}

// Obter próximo ID
function getNextItemId() {
    let maxId = 0;
    Object.values(menuData).forEach(category => {
        category.forEach(item => {
            if (item.id > maxId) maxId = item.id;
        });
    });
    return maxId + 1;
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Implementar sistema de notificações se necessário
    console.log(`${type.toUpperCase()}: ${message}`);
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
