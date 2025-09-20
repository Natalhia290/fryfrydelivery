// Sistema de Autenticação
const authConfig = {
    cpf: '70389409103',
    password: '999999'
};

let isAuthenticated = false;
let sessionTimeout = null;

// Sistema de Gerenciamento de Imagens
let productImages = {}; // Armazenar imagens base64 por ID do produto

// Funções globais para admin e login
function showAdminPanel() {
    console.log('showAdminPanel chamada, isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
        console.log('Usuário não autenticado, mostrando modal de login');
        showLoginModal();
        return;
    }
    
    console.log('Usuário autenticado, mostrando painel admin');
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.add('active');
        updateAdminStats();
        loadRecentOrders();
    } else {
        console.error('adminPanel não encontrado!');
    }
}

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('show');
        const cpfInput = document.getElementById('cpfInput');
        if (cpfInput) cpfInput.focus();
    }
}

function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('show');
        clearLoginForm();
    }
}

function clearLoginForm() {
    const cpfInput = document.getElementById('cpfInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');
    
    if (cpfInput) cpfInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (loginError) loginError.textContent = '';
}

// Função de teste para redirecionamento
function testAdminRedirect() {
    console.log('Testando redirecionamento para admin...');
    // Simular login bem-sucedido
    isAuthenticated = true;
    localStorage.setItem('fry_session', JSON.stringify({
        authenticated: true,
        timestamp: Date.now()
    }));
    
    // Redirecionar
    window.location.href = 'admin.html';
}

// Função para abrir painel de pedidos
function openPedidosPanel() {
    console.log('Abrindo painel de pedidos...');
    
    // Verificar se está autenticado
    const session = localStorage.getItem('fry_session');
    if (!session) {
        alert('⚠️ Acesso Restrito!\n\nVocê precisa fazer login para acessar o painel de pedidos.\n\nClique em "Entrar" no canto superior direito para fazer login.');
        return;
    }
    
    try {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        const sessionTimeout = 30 * 60 * 1000; // 30 minutos
        
        if (!sessionData.authenticated || (now - sessionData.timestamp) > sessionTimeout) {
            localStorage.removeItem('fry_session');
            alert('⚠️ Sessão Expirada!\n\nSua sessão expirou. Faça login novamente para acessar o painel de pedidos.');
            return;
        }
    } catch (error) {
        localStorage.removeItem('fry_session');
        alert('⚠️ Erro de Sessão!\n\nFaça login novamente para acessar o painel de pedidos.');
        return;
    }
    
    window.open('painel-pedidos.html', '_blank');
}

// Função para abrir acompanhar pedido
function openAcompanharPedido() {
    console.log('Abrindo acompanhar pedido...');
    window.open('acompanhar-pedido.html', '_blank');
}

function login(event) {
    event.preventDefault();
    
    const cpf = document.getElementById('cpfInput').value;
    const password = document.getElementById('passwordInput').value;
    const errorEl = document.getElementById('loginError');
    
    console.log('Tentativa de login:', { cpf, password });
    
    // Validação básica
    if (!cpf || !password) {
        if (errorEl) errorEl.textContent = 'Por favor, preencha todos os campos';
        return;
    }
    
    // Autenticação
    const result = authenticate(cpf, password);
    console.log('Resultado da autenticação:', result);
    
    if (result.success) {
        isAuthenticated = true;
        hideLoginModal();
        showNotification('Login realizado com sucesso!', 'success');
        
        // Definir timeout da sessão (30 minutos)
        if (sessionTimeout) clearTimeout(sessionTimeout);
        sessionTimeout = setTimeout(logout, 30 * 60 * 1000);
        
        // Salvar sessão no localStorage
        localStorage.setItem('fry_session', JSON.stringify({
            authenticated: true,
            timestamp: Date.now()
        }));
        
        // Redirecionar para página admin
        console.log('Redirecionando para admin.html...');
        window.location.href = 'admin.html';
    } else {
        if (errorEl) errorEl.textContent = result.message;
    }
}

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
let db = null;
try {
    // Verificar se Firebase está disponível
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
} catch (error) {
    console.log('Firebase não disponível, usando localStorage como fallback');
}

// Função para obter imagem do produto
function getProductImage(product) {
    // Primeiro verifica se há imagem base64 personalizada
    if (productImages[product.id]) {
        return productImages[product.id];
    }
    
    // Fallback para imagens padrão
    const imageMap = {
        // Big Hots
        1: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd1871?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Tilápia
        2: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Salmão
        3: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Filadélfia
        
        // Mini Sushi Dog
        4: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Salmão
        5: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Tilápia
        
        // Combos
        6: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd1871?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Combo Tilápia
        7: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Combo Salmão
        8: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Individual Salmão
        9: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Individual Tilápia
        
        // Bebidas
        10: 'https://images.unsplash.com/photo-1548839140-5d4b0b0b0b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Água
        11: 'https://images.unsplash.com/photo-1548839140-5d4b0b0b0b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Refrigerante
        12: 'https://images.unsplash.com/photo-1548839140-5d4b0b0b0b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Suco
        13: 'https://images.unsplash.com/photo-1548839140-5d4b0b0b0b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Cerveja
        
        // Adicionais
        14: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Molho
        15: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Gengibre
        16: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Wasabi
        17: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'  // Shoyu
    };
    
    return imageMap[product.id] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
}

// Dados dos produtos do cardápio FRY - CARREGADOS DO PAINEL ADMIN
let menuData = {};

// Estado do carrinho
let cart = [];
let currentFilter = 'all';

// Elementos DOM
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const menuGrid = document.getElementById('menuGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Sistema de sincronização em tempo real
function initializeSync() {
    console.log('🔄 Inicializando sistema de sincronização...');
    
    // Carregar dados do painel admin
    loadMenuFromAdmin();
    
    // Escutar mudanças do painel admin via eventos
    window.addEventListener('menuDataUpdated', function(event) {
        console.log('🔄 Evento menuDataUpdated recebido:', event.detail);
        if (event.detail && event.detail.menuData) {
            menuData = event.detail.menuData;
            renderMenu();
            showNotification('Cardápio atualizado em tempo real!', 'success');
        }
    });
    
    // Escutar mudanças do localStorage (para outras abas)
    window.addEventListener('storage', function(event) {
        console.log('🔄 Storage event recebido:', event.key, event.newValue);
        if (event.key === 'fryMenuUpdate') {
            try {
                const updateData = JSON.parse(event.newValue);
                if (updateData && updateData.menuData) {
                    console.log('🔄 Dados atualizados via localStorage:', updateData);
                    menuData = updateData.menuData;
                    renderMenu();
                    showNotification('Cardápio atualizado em tempo real!', 'success');
                }
            } catch (error) {
                console.error('❌ Erro ao processar dados do localStorage:', error);
            }
        }
    });
    
    // Verificar atualizações a cada 2 segundos
    setInterval(checkForUpdates, 2000);
}

// Carregar dados do painel admin
function loadMenuFromAdmin() {
    console.log('📋 Carregando dados do painel admin...');
    console.log('🔍 DEBUG - localStorage fryMenuData:', localStorage.getItem('fryMenuData'));
    
    // SEMPRE usar dados padrão corretos primeiro
    console.log('📋 Usando dados padrão corretos do painel admin');
    menuData = {
        bigHots: [
            {
                id: 1,
                name: "Big Hot de Tilápia",
                description: "Crocante e gostoso! (De R$ 65,70 por R$ 49,90)",
                price: 49.90,
                emoji: "🍣",
                category: "bigHots"
            },
            {
                id: 2,
                name: "Big Hot de Salmão",
                description: "Crocante e gostoso! (De R$ 83,70 por R$ 59,90)",
                price: 59.90,
                emoji: "🍣",
                category: "bigHots"
            },
            {
                id: 3,
                name: "Hot Filadélfia por 15 reais",
                description: "O mais poderoso dos hots! Super recheado e irresistível.",
                price: 15.00,
                emoji: "🍣",
                category: "bigHots"
            }
        ],
        miniSushiDog: [
            {
                id: 4,
                name: "Mini Sushi Dog Salmão",
                description: "Mini hot dog de sushi recheado com salmão",
                price: 27.90,
                emoji: "🌭",
                category: "miniSushiDog"
            },
            {
                id: 5,
                name: "Mini Sushi Dog Tilápia",
                description: "Mini hot dog de sushi recheado com tilápia",
                price: 21.90,
                emoji: "🌭",
                category: "miniSushiDog"
            }
        ],
        combos: [
            {
                id: 6,
                name: "Combo Família",
                description: "2 Big Hots + 4 Mini Sushi Dogs + 2 Acompanhamentos",
                price: 89.90,
                emoji: "🍱",
                category: "combos"
            }
        ],
        bebidas: [],
        adicionais: []
    };
    
    // Salvar no localStorage para sincronização
    localStorage.setItem('fryMenuData', JSON.stringify(menuData));
    
    // Renderizar imediatamente
    renderMenu();
    showNotification('Cardápio atualizado com dados corretos!', 'success');
    
    console.log('✅ MenuData carregado:', menuData);
}

// Verificar atualizações periodicamente
function checkForUpdates() {
    const savedMenu = localStorage.getItem('fryMenuData');
    if (savedMenu) {
        try {
            const parsed = JSON.parse(savedMenu);
            if (parsed && JSON.stringify(parsed) !== JSON.stringify(menuData)) {
                console.log('🔄 Atualização detectada via polling');
                menuData = parsed;
                renderMenu();
                showNotification('Cardápio atualizado!', 'success');
            }
        } catch (error) {
            console.error('❌ Erro ao verificar atualizações:', error);
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Carregado - Iniciando aplicação...');
    alert('🚀 JavaScript carregado! Verificando dados...');
    
    // Limpar cache do localStorage para forçar recarregamento
    localStorage.removeItem('fryMenuData');
    localStorage.removeItem('frySyncData');
    localStorage.removeItem('fryMenuUpdate');
    
    initializeApp();
    initializeSync();
});

// Event Listeners
function setupEventListeners() {
    // Carrinho
    cartIcon.addEventListener('click', toggleCart);
    
    // Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setFilter(filter);
        });
    });
    
    // Fechar carrinho
    document.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCart();
        }
    });
    
    // Tecla ESC para fechar carrinho
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
}

// Função principal de inicialização
function initializeApp() {
    console.log('🚀 Inicializando aplicação...');
    
    // Verificar autenticação
    checkAuthentication();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Renderizar menu
    renderMenu();
    
    // Atualizar contador do carrinho
    updateCartCount();
    
    console.log('✅ Aplicação inicializada');
}

// Verificar autenticação
function checkAuthentication() {
    const session = localStorage.getItem('fry_session');
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const now = Date.now();
            const sessionTimeout = 30 * 60 * 1000; // 30 minutos
            
            if (sessionData.authenticated && (now - sessionData.timestamp) <= sessionTimeout) {
                isAuthenticated = true;
                console.log('✅ Usuário autenticado');
            } else {
                localStorage.removeItem('fry_session');
                console.log('❌ Sessão expirada');
            }
        } catch (error) {
            localStorage.removeItem('fry_session');
            console.log('❌ Erro na sessão');
        }
    }
}

// Renderizar menu
function renderMenu() {
    if (!menuGrid) {
        console.error('menuGrid não encontrado!');
        alert('❌ menuGrid não encontrado!');
        return;
    }
    
    console.log('🎨 Renderizando menu com dados:', menuData);
    alert('🎨 Renderizando menu com dados: ' + JSON.stringify(menuData));
    
    // Limpar grid
    menuGrid.innerHTML = '';
    
    // Verificar se há dados
    if (!menuData || Object.keys(menuData).length === 0) {
        menuGrid.innerHTML = `
            <div class="no-menu">
                <h3>🍣 Cardápio em Configuração</h3>
                <p>O cardápio está sendo configurado no painel administrativo.</p>
                <button onclick="openPedidosPanel()" class="cta-button">Configurar Cardápio</button>
            </div>
        `;
        return;
    }
    
    // Renderizar produtos por categoria
    const categories = ['bigHots', 'miniSushiDog', 'combos', 'bebidas', 'adicionais'];
    
    categories.forEach(category => {
        if (menuData[category] && menuData[category].length > 0) {
            menuData[category].forEach(product => {
                if (shouldShowProduct(product)) {
                    const productCard = createProductCard(product);
                    menuGrid.appendChild(productCard);
                }
            });
        }
    });
    
    // Se não há produtos para mostrar
    if (menuGrid.children.length === 0) {
        menuGrid.innerHTML = `
            <div class="no-menu">
                <h3>🍣 Nenhum produto encontrado</h3>
                <p>Configure os produtos no painel administrativo.</p>
                <button onclick="openPedidosPanel()" class="cta-button">Configurar Cardápio</button>
            </div>
        `;
    }
}

// Verificar se deve mostrar o produto
function shouldShowProduct(product) {
    if (currentFilter === 'all') return true;
    return product.category === currentFilter;
}

// Criar card do produto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'menu-item';
    card.innerHTML = `
        <div class="menu-item-image">
            <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy">
        </div>
        <div class="menu-item-content">
            <h3 class="menu-item-name">${product.emoji} ${product.name}</h3>
            <p class="menu-item-description">${product.description}</p>
            <div class="menu-item-footer">
                <span class="menu-item-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    Adicionar +
                </button>
            </div>
        </div>
    `;
    return card;
}

// Definir filtro
function setFilter(filter) {
    currentFilter = filter;
    
    // Atualizar botões
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    // Renderizar menu
    renderMenu();
}

// Adicionar ao carrinho
function addToCart(productId) {
    // Encontrar produto
    let product = null;
    for (const category in menuData) {
        product = menuData[category].find(p => p.id === productId);
        if (product) break;
    }
    
    if (!product) {
        console.error('Produto não encontrado:', productId);
        return;
    }
    
    // Verificar se já está no carrinho
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            emoji: product.emoji
        });
    }
    
    // Atualizar interface
    updateCartCount();
    showNotification(`${product.name} adicionado ao carrinho!`, 'success');
    
    // Salvar no localStorage
    localStorage.setItem('fryCart', JSON.stringify(cart));
}

// Atualizar contador do carrinho
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Alternar carrinho
function toggleCart() {
    if (cartModal) {
        cartModal.classList.toggle('active');
        if (cartModal.classList.contains('active')) {
            renderCart();
        }
    }
}

// Fechar carrinho
function closeCart() {
    if (cartModal) {
        cartModal.classList.remove('active');
    }
}

// Renderizar carrinho
function renderCart() {
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Carrinho vazio</p>';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.emoji} ${item.name}</h4>
                <p>R$ ${item.price.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})" class="remove-btn">×</button>
            </div>
        </div>
    `).join('');
    
    // Atualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) {
        cartTotal.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

// Atualizar quantidade
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            renderCart();
            localStorage.setItem('fryCart', JSON.stringify(cart));
        }
    }
}

// Remover do carrinho
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCart();
    localStorage.setItem('fryCart', JSON.stringify(cart));
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    if (notification && notificationText) {
        notificationText.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Função de autenticação
function authenticate(cpf, password) {
    // Valida CPF
    if (!validateCPF(cpf)) {
        return { success: false, message: 'CPF inválido' };
    }
    
    // Verifica credenciais
    if (cpf === authConfig.cpf && password === authConfig.password) {
        return { success: true, message: 'Login realizado com sucesso!' };
    } else {
        return { success: false, message: 'CPF ou senha incorretos' };
    }
}

// Validar CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Logout
function logout() {
    isAuthenticated = false;
    localStorage.removeItem('fry_session');
    showNotification('Sessão encerrada', 'info');
}

// Carregar carrinho do localStorage
function loadCart() {
    const savedCart = localStorage.getItem('fryCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartCount();
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            cart = [];
        }
    }
}

// Carregar carrinho na inicialização
loadCart();
