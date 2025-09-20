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

// Dados dos produtos do cardápio FRY
const menuData = {
    bigHots: [
        {
            id: 1,
            name: "Big Hot de Tilápia + 2 Minis",
            description: "Crocante e gostoso! (De R$ 65,70 por R$ 49,90)",
            price: 49.90,
            emoji: "🍣",
            category: "bigHots"
        },
        {
            id: 2,
            name: "Big Hot de Salmão + 2 Minis",
            description: "Crocante e gostoso! (De R$ 83,70 por R$ 59,90)",
            price: 59.90,
            emoji: "🍣",
            category: "bigHots"
        },
        {
            id: 3,
            name: "Big Hot Turbo",
            description: "O mais poderoso dos hots! Super recheado e irresistível.",
            price: 59.90,
            emoji: "🍣",
            category: "bigHots"
        }
    ],
    miniSushiDog: [
        {
            id: 4,
            name: "Mini Sushi Dog Salmão",
            description: "Mini hot dog de sushi recheado com salmão (160g)",
            price: 27.90,
            emoji: "🌭",
            category: "miniSushiDog"
        },
        {
            id: 5,
            name: "Mini Sushi Dog Tilápia",
            description: "Mini hot dog de sushi recheado com tilápia (160g)",
            price: 21.90,
            emoji: "🌭",
            category: "miniSushiDog"
        }
    ],
    combos: [
        {
            id: 6,
            name: "Sushidogroll Combo Casal Tilápia",
            description: "Delicioso combo de Sushidogroll para duas pessoas (De R$ 113,78)",
            price: 69.90,
            emoji: "🍱",
            category: "combos"
        },
        {
            id: 7,
            name: "Sushidogroll Combo Casal Salmão",
            description: "Delicioso combo de Sushidogroll para duas pessoas (De R$ 133,78)",
            price: 79.90,
            emoji: "🍱",
            category: "combos"
        },
        {
            id: 8,
            name: "Sushidogroll Salmão Individual",
            description: "Sushidogroll frito de salmão",
            price: 55.80,
            emoji: "🌭",
            category: "combos"
        },
        {
            id: 9,
            name: "Sushidogroll Tilápia Individual",
            description: "Sushidogroll frito de tilápia",
            price: 43.80,
            emoji: "🌭",
            category: "combos"
        }
    ],
    bebidas: [
        {
            id: 10,
            name: "Água Mineral Águai 510ml",
            description: "Água mineral natural 510ml",
            price: 3.99,
            emoji: "💧",
            category: "bebidas"
        },
        {
            id: 11,
            name: "Água Mineral com Gás Club 500ml",
            description: "Água mineral com gás 500ml",
            price: 4.99,
            emoji: "💧",
            category: "bebidas"
        },
        {
            id: 12,
            name: "Pepsi 1,5L",
            description: "Refrigerante Pepsi 1,5 litros",
            price: 13.99,
            emoji: "🥤",
            category: "bebidas"
        },
        {
            id: 13,
            name: "Pepsi 350ml (lata)",
            description: "Refrigerante Pepsi lata 350ml",
            price: 6.99,
            emoji: "🥤",
            category: "bebidas"
        },
        {
            id: 14,
            name: "Pepsi Zero 1,5L",
            description: "Refrigerante Pepsi Zero 1,5 litros",
            price: 13.99,
            emoji: "🥤",
            category: "bebidas"
        },
        {
            id: 15,
            name: "Pepsi Zero 350ml (lata)",
            description: "Refrigerante Pepsi Zero lata 350ml",
            price: 6.99,
            emoji: "🥤",
            category: "bebidas"
        }
    ],
    adicionais: [
        {
            id: 16,
            name: "Hashi (Pauzinhos)",
            description: "Pauzinhos tradicionais japoneses",
            price: 1.00,
            emoji: "🥢",
            category: "adicionais"
        },
        {
            id: 17,
            name: "Molho Tarê",
            description: "Molho doce tradicional japonês",
            price: 1.50,
            emoji: "🍯",
            category: "adicionais"
        },
        {
            id: 18,
            name: "Molho Shoyo",
            description: "Molho de soja tradicional",
            price: 1.50,
            emoji: "🫗",
            category: "adicionais"
        }
    ]
};

// Estado do carrinho
let cart = [];
let currentFilter = 'all';

// Elementos DOM
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const menuGrid = document.getElementById('menuGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Event Listeners
function setupEventListeners() {
    // Carrinho
    cartIcon.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', closeCart);
    cartClose.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', checkout);

    // Filtros do menu
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterMenu(category);
            updateFilterButtons(btn);
        });
    });

    // Menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Smooth scroll para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Renderização do menu com animações dinâmicas
function renderMenu() {
    console.log('renderMenu chamada');
    const menuGridElement = document.getElementById('menuGrid');
    
    if (!menuGridElement) {
        console.error('Elemento menuGrid não encontrado!');
        return;
    }
    
    console.log('menuGrid encontrado, renderizando menu...');
    
    // Adicionar efeito de loading
    menuGridElement.innerHTML = '<div class="loading-spinner">Carregando cardápio...</div>';
    
    setTimeout(() => {
        console.log('Iniciando renderização dos produtos...');
        menuGridElement.innerHTML = '';
        
        let productsToShow = [];
        
        if (currentFilter === 'all') {
            Object.values(menuData).forEach(category => {
                productsToShow = productsToShow.concat(category);
            });
        } else {
            productsToShow = menuData[currentFilter] || [];
        }

        console.log('Produtos para mostrar:', productsToShow.length);
        console.log('menuData:', menuData);

        productsToShow.forEach((product, index) => {
            console.log('Criando elemento para produto:', product.name);
            const productElement = createProductElement(product, index);
            menuGridElement.appendChild(productElement);
            
            // Animação de entrada escalonada
            setTimeout(() => {
                productElement.style.opacity = '1';
                productElement.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        console.log('Menu renderizado com sucesso!');
    }, 300);
}

function createProductElement(product, index) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    if (product.outOfStock) {
        div.classList.add('out-of-stock');
    }
    div.style.animationDelay = `${index * 0.1}s`;
    div.style.opacity = '0';
    div.style.transform = 'translateY(30px)';
    div.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    // Definir imagem baseada na categoria e nome do produto
    const imageUrl = getProductImage(product);
    
    // HTML para item esgotado
    if (product.outOfStock) {
        div.innerHTML = `
            <div class="menu-item-image">
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                <div class="image-overlay">
                    ${product.emoji}
                </div>
                <div class="out-of-stock-ribbon">
                    <span>ITEM ESGOTADO</span>
                </div>
            </div>
            <div class="menu-item-content">
                <h3 class="menu-item-name">${product.name}</h3>
                <p class="menu-item-description">${product.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                    <button class="add-to-cart-btn disabled" disabled>
                        <span class="btn-text">Esgotado</span>
                        <span class="btn-icon">❌</span>
                    </button>
                </div>
            </div>
        `;
    } else {
        // HTML normal para itens disponíveis
        div.innerHTML = `
            <div class="menu-item-image">
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                <div class="image-overlay">
                    ${product.emoji}
                </div>
            </div>
            <div class="menu-item-content">
                <h3 class="menu-item-name">${product.name}</h3>
                <p class="menu-item-description">${product.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <span class="btn-text">Adicionar</span>
                        <span class="btn-icon">+</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    // Adicionar efeito de hover dinâmico
    div.addEventListener('mouseenter', () => {
        div.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    div.addEventListener('mouseleave', () => {
        div.style.transform = 'translateY(0) scale(1)';
    });
    
    return div;
}

// Filtros do menu com animações dinâmicas
function filterMenu(category) {
    currentFilter = category;
    
    // Animação de transição suave
    menuGrid.style.opacity = '0.5';
    menuGrid.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        renderMenu();
        menuGrid.style.opacity = '1';
        menuGrid.style.transform = 'translateY(0)';
    }, 200);
}

function updateFilterButtons(activeBtn) {
    filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Funcionalidades do carrinho com animações dinâmicas
function addToCart(productId) {
    const product = findProductById(productId);
    if (!product) return;

    // Animação do botão
    const button = event.target.closest('.add-to-cart-btn');
    if (button) {
        button.style.transform = 'scale(0.95)';
        button.innerHTML = '<span class="btn-text">✓ Adicionado!</span>';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.innerHTML = '<span class="btn-text">Adicionar</span><span class="btn-icon">+</span>';
        }, 1000);
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartUI();
    showNotification(`${product.name} adicionado ao carrinho!`, 'success');
    
    // Animação do ícone do carrinho
    const cartIcon = document.getElementById('cartIcon');
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 200);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
    }
}

function findProductById(id) {
    for (const category of Object.values(menuData)) {
        const product = category.find(item => item.id === id);
        if (product) return product;
    }
    return null;
}

function updateCartUI() {
    updateCartCount();
    updateCartItems();
    updateCartTotal();
    updateCheckoutButton();
}

function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Removido pedido mínimo - sempre habilitado
    checkoutBtn.innerHTML = 'Enviar Pedido no WhatsApp';
    checkoutBtn.style.background = '';
    checkoutBtn.disabled = false;
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function updateCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${getProductImage(item)}" alt="${item.name}" loading="lazy">
                <div class="cart-emoji">${item.emoji}</div>
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="cart-item-quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2).replace('.', ',');
}

// Modal do carrinho com animações dinâmicas
function toggleCart() {
    cartModal.classList.toggle('active');
    if (cartModal.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        // Animação de entrada do modal
        const sidebar = cartModal.querySelector('.cart-sidebar');
        sidebar.style.transform = 'translateX(100%)';
        setTimeout(() => {
            sidebar.style.transform = 'translateX(0)';
        }, 10);
    } else {
        document.body.style.overflow = 'auto';
    }
}

function closeCart() {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Sistema de automação do WhatsApp
// Usar a configuração avançada do whatsapp-config.js
const whatsappConfig = window.whatsappBusinessConfig || {
    business: {
        phone: '5562995045038',
        name: 'FRY - Sushi Delivery'
    },
    messages: {
        greeting: '🍣 *FRY - Sushi Delivery* 🍣\n\nOlá! Bem-vindo(a) ao nosso delivery de sushi premium em Goiânia! 🎉',
        deliveryInfo: '🚚 *Informações de Entrega:*\n• Tempo estimado: 30-45 minutos\n• Taxa de entrega: Calculada no WhatsApp\n• Entregas a partir de R$ 100,00: Grátis\n• Forma de pagamento: PIX, Dinheiro ou Cartão',
        closing: 'Obrigado por escolher a FRY! 🙏\n\n*Horário de funcionamento:*\nSegunda a Domingo: 18:00 às 23:00'
    }
};

// Configuração do Firebase (será carregada dinamicamente)
let firebaseInitialized = false;

// Inicializar Firebase
async function initializeFirebase() {
    try {
        // Usar Firebase já carregado no HTML
        if (typeof firebase !== 'undefined') {
            const app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            firebaseInitialized = true;
            console.log('Firebase inicializado com sucesso!');
        } else {
            console.log('Firebase não disponível, usando localStorage');
            firebaseInitialized = false;
        }
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
        firebaseInitialized = false;
    }
}

// Checkout via WhatsApp com automação
function checkout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!', 'error');
        return;
    }

    // Processar checkout diretamente
    processCheckout();
}

async function processCheckout() {
    const customerPhone = document.getElementById('customerPhone').value;
    const customerName = document.getElementById('customerName').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerSector = document.getElementById('customerSector').value;
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Validar campos
    if (!customerPhone || !customerName || !customerAddress || !customerSector) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Validar telefone (mais flexível)
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        showNotification('Por favor, digite um telefone válido! (10 ou 11 dígitos)', 'error');
        return;
    }
    
    // Pedido mínimo removido - qualquer valor é aceito
    
    // Animação do botão
    checkoutBtn.style.transform = 'scale(0.95)';
    checkoutBtn.innerHTML = 'Enviando...';
    checkoutBtn.disabled = true;
    
    // Gerar mensagem de pedido do cliente
    const orderMessage = generateCustomerOrderMessage(customerName);
    
    // Salvar pedido no Firebase e localStorage
    const order = await saveOrderToFirebase(customerName, customerPhone);
    
    // Enviar mensagem do cliente para WhatsApp da loja
    const whatsappSent = sendWhatsAppMessage(customerPhone, orderMessage);
    
    if (whatsappSent) {
        // Mostrar confirmação
        showNotification('✅ Pedido enviado! WhatsApp aberto para enviar para a loja!', 'success');
        
        // Mostrar modal com instruções caso WhatsApp não abra
        setTimeout(() => {
            showWhatsAppInstructions(orderMessage);
        }, 2000);
    } else {
        showNotification('❌ Erro ao abrir WhatsApp. Verifique se não está bloqueado.', 'error');
    }
    
    // Limpar carrinho e fechar
    cart = [];
    updateCartDisplay();
    closeCart();
    
    // Resetar formulário
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerSector').value = '';
    
    // Resetar botão
    checkoutBtn.style.transform = 'scale(1)';
    checkoutBtn.innerHTML = 'Enviar Pedido no WhatsApp';
    checkoutBtn.disabled = false;
    checkoutBtn.onclick = checkout;
}

// Mostrar instruções do WhatsApp
function showWhatsAppInstructions(message) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 5000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 15px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        text-align: center;
    `;
    
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #2b2d42; margin: 0 0 10px 0;">📱 WhatsApp não abriu?</h3>
            <p style="color: #666; margin: 0;">Se o WhatsApp não abriu automaticamente, copie a mensagem abaixo e envie para a loja:</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; font-family: monospace; white-space: pre-wrap; font-size: 12px; line-height: 1.4; text-align: left; margin-bottom: 20px; max-height: 300px; overflow-y: auto;">${message}</div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="navigator.clipboard.writeText('${message.replace(/'/g, "\\'")}').then(() => alert('Mensagem copiada! Cole no WhatsApp da loja.'))" style="background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">📋 Copiar Pedido</button>
            <button onclick="this.closest('.modal').remove()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Fechar</button>
        </div>
    `;
    
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Mostrar mensagem de confirmação que seria enviada
function showConfirmationMessage(message) {
    // Criar modal para mostrar a mensagem
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 5000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 15px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="color: #2b2d42; margin: 0;">📱 Confirmação Enviada</h3>
            <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; font-family: monospace; white-space: pre-wrap; font-size: 14px; line-height: 1.4;">${message}</div>
        <div style="margin-top: 15px; text-align: center;">
            <p style="color: #666; font-size: 14px;">Esta mensagem seria enviada automaticamente para o cliente via WhatsApp</p>
        </div>
    `;
    
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Enviar mensagem do cliente para WhatsApp da loja
function sendWhatsAppMessage(customerPhone, message) {
    try {
        // Usar o telefone da loja (FRY)
        const storePhone = '5562995045038';
        
        // Criar mensagem com dados do cliente
        const customerMessage = `Olá! Quero fazer um pedido!\n\n` +
                              `👤 *Meu nome:* ${document.getElementById('customerName').value}\n` +
                              `📱 *Meu WhatsApp:* ${customerPhone}\n` +
                              `🏠 *Endereço:* ${document.getElementById('customerAddress').value}\n` +
                              `📍 *Setor:* ${document.getElementById('customerSector').value}\n\n` +
                              `📋 *MEU PEDIDO:*\n${message}`;
        
        // Criar URL do WhatsApp da loja
        const whatsappUrl = `https://wa.me/${storePhone}?text=${encodeURIComponent(customerMessage)}`;
        
        console.log('Cliente enviando para loja:', whatsappUrl);
        
        // Tentar abrir WhatsApp
        const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        if (!newWindow) {
            // Se popup foi bloqueado, tentar redirecionar na mesma aba
            window.location.href = whatsappUrl;
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao abrir WhatsApp:', error);
        showNotification('Erro ao abrir WhatsApp. Tente novamente.', 'error');
        return false;
    }
}

// Gerar mensagem de pedido do cliente para a loja (SIMPLIFICADA)
function generateCustomerOrderMessage(customerName) {
    const now = new Date();
    const orderId = generateOrderId();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const customerAddress = document.getElementById('customerAddress').value;
    const customerSector = document.getElementById('customerSector').value;
    
    let message = `🍣 *NOVO PEDIDO FRY* #${orderId}\n\n`;
    
    message += `👤 *Cliente:* ${customerName}\n`;
    message += `📱 *WhatsApp:* ${document.getElementById('customerPhone').value}\n`;
    message += `🏠 *Endereço:* ${customerAddress}\n`;
    message += `📍 *Setor:* ${customerSector}\n\n`;
    
    message += `🍱 *PEDIDO:*\n`;
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - ${item.quantity}x = R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });
    
    message += `\n💰 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    message += `🕐 ${now.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
    message += `📱 Entrega calculada no WhatsApp`;
    
    return message;
}

// Gerar ID único para o pedido
let currentOrderNumber = 1;

function generateOrderId() {
    // Carregar número atual do localStorage
    const savedNumber = localStorage.getItem('fryOrderNumber');
    if (savedNumber) {
        currentOrderNumber = parseInt(savedNumber);
    }
    
    const orderId = `FRY${currentOrderNumber}DEL`;
    currentOrderNumber++;
    
    // Salvar próximo número
    localStorage.setItem('fryOrderNumber', currentOrderNumber.toString());
    
    return orderId;
}

// Salvar pedido no Firebase e localStorage (MELHORADO)
async function saveOrderToFirebase(customerName, customerPhone) {
    const customerAddress = document.getElementById('customerAddress').value;
    const customerSector = document.getElementById('customerSector').value;
    
    const order = {
        id: generateOrderId(),
        timestamp: new Date().toISOString(),
        itens: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pendente',
        cliente: customerName,
        telefone: customerPhone,
        endereco: customerAddress,
        setor: customerSector,
        notes: '',
        updatedAt: new Date().toISOString(),
        // Adicionar timestamp único para evitar duplicatas
        uniqueId: Date.now() + Math.random()
    };
    
    // SEMPRE salvar no localStorage PRIMEIRO (mais confiável)
    try {
        const orders = JSON.parse(localStorage.getItem('fryOrders') || '[]');
        
        // Verificar se já existe um pedido com o mesmo ID
        const existingOrder = orders.find(o => o.id === order.id);
        if (existingOrder) {
            console.log('⚠️ Pedido já existe, atualizando...');
            const index = orders.findIndex(o => o.id === order.id);
            orders[index] = order;
        } else {
            orders.unshift(order);
        }
        
        localStorage.setItem('fryOrders', JSON.stringify(orders));
        console.log('✅ Pedido salvo no localStorage:', order.id);
        
    } catch (error) {
        console.error('❌ Erro ao salvar no localStorage:', error);
    }
    
    // Depois tentar salvar no Firebase (opcional)
    if (firebaseInitialized && db) {
        try {
            const docRef = await db.collection('orders').add(order);
            console.log('✅ Pedido também salvo no Firebase:', docRef.id);
        } catch (error) {
            console.error('❌ Erro ao salvar no Firebase (não crítico):', error);
            // Não falhar se Firebase der erro, localStorage já salvou
        }
    }
    
    // Notificar administrador
    notifyAdmin(order);
    
    return order;
}

// Função original mantida para compatibilidade
function generateWhatsAppMessage() {
    return generateAutomatedWhatsAppMessage();
}

// Notificações com animações dinâmicas
function showNotification(text, type = 'success') {
    notificationText.textContent = text;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Animação de entrada
    notification.style.transform = 'translateX(400px) scale(0.8)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0) scale(1)';
        notification.style.opacity = '1';
    }, 10);
    
    // Auto-remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px) scale(0.8)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 400);
    }, 3000);
}

// Scroll suave para seções
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Efeito de parallax no hero (otimizado e suavizado)
const hero = document.querySelector('.hero');
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Lazy loading para imagens (quando adicionadas)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Inicializar lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Animações de entrada para elementos
function animateOnScroll() {
    const elements = document.querySelectorAll('.menu-item, .feature, .contact-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Inicializar animações
document.addEventListener('DOMContentLoaded', animateOnScroll);

// Prevenção de envio de formulários (se houver)
document.addEventListener('submit', (e) => {
    e.preventDefault();
});

// Função para fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartModal.classList.contains('active')) {
        closeCart();
    }
});

// Otimização de performance - debounce para scroll
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce ao scroll
const debouncedScroll = debounce(() => {
    // Lógica de scroll otimizada aqui
}, 10);

window.addEventListener('scroll', debouncedScroll);

// Service Worker para cache (PWA básico)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Painel de Administração
function initializeAdminPanel() {
    // Painel admin inicializado - event listeners são configurados em initializeApp()
    console.log('Painel administrativo inicializado');
}

function updateAdminStats() {
    try {
        const orders = JSON.parse(localStorage.getItem('fryOrders') || '[]');
        const today = new Date().toDateString();
        
        console.log('📊 Atualizando estatísticas. Total de pedidos:', orders.length);
        
        // Filtrar pedidos válidos de hoje
        const todayOrders = orders.filter(order => {
            if (!order || !order.timestamp || order.total === undefined) {
                return false;
            }
            const orderDate = new Date(order.timestamp).toDateString();
            return orderDate === today;
        });
        
        console.log('📅 Pedidos de hoje:', todayOrders.length);
        
        // Calcular estatísticas
        const totalOrders = todayOrders.length;
        const totalRevenue = todayOrders.reduce((sum, order) => {
            const total = parseFloat(order.total) || 0;
            return sum + total;
        }, 0);
        
        // Atualizar interface
        const totalOrdersEl = document.getElementById('totalOrders');
        const totalRevenueEl = document.getElementById('totalRevenue');
        
        if (totalOrdersEl) {
            totalOrdersEl.textContent = totalOrders;
            console.log('✅ Total de pedidos atualizado:', totalOrders);
        }
        
        if (totalRevenueEl) {
            totalRevenueEl.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
            console.log('✅ Faturamento atualizado:', totalRevenue);
        }
        
    } catch (error) {
        console.error('❌ Erro ao atualizar estatísticas:', error);
        
        // Fallback em caso de erro
        const totalOrdersEl = document.getElementById('totalOrders');
        const totalRevenueEl = document.getElementById('totalRevenue');
        
        if (totalOrdersEl) totalOrdersEl.textContent = '0';
        if (totalRevenueEl) totalRevenueEl.textContent = 'R$ 0,00';
    }
}

function loadRecentOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem('fryOrders') || '[]');
        const recentOrdersEl = document.getElementById('recentOrders');
        
        if (!recentOrdersEl) return;
        
        console.log('📊 Carregando pedidos:', orders.length);
        
        // Filtrar pedidos válidos e ordenar por timestamp
        const validOrders = orders.filter(order => 
            order && 
            order.id && 
            order.timestamp && 
            order.total !== undefined
        );
        
        const sortedOrders = validOrders.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA; // Mais recentes primeiro
        });
        
        // Mostrar apenas os 10 mais recentes (aumentado de 5 para 10)
        const recentOrders = sortedOrders.slice(0, 10);
        
        console.log('📋 Pedidos recentes encontrados:', recentOrders.length);
        
        if (recentOrders.length === 0) {
            recentOrdersEl.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">Nenhum pedido ainda</p>';
            return;
        }
        
        recentOrdersEl.innerHTML = recentOrders.map(order => `
            <div class="order-item">
                <div class="order-id">Pedido #${order.id}</div>
                <div class="order-customer">${order.cliente || order.customer?.name || 'Cliente'}</div>
                <div class="order-total">R$ ${order.total.toFixed(2).replace('.', ',')}</div>
                <div class="order-time">${new Date(order.timestamp).toLocaleString('pt-BR')}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Erro ao carregar pedidos:', error);
        const recentOrdersEl = document.getElementById('recentOrders');
        if (recentOrdersEl) {
            recentOrdersEl.innerHTML = '<p style="text-align: center; color: #f44336; padding: 1rem;">Erro ao carregar pedidos</p>';
        }
    }
}

// Sistema de notificações para o administrador
function notifyAdmin(order) {
    // Verificar se o navegador suporta notificações
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Novo Pedido FRY!', {
            body: `Pedido #${order.id} - R$ ${order.total.toFixed(2).replace('.', ',')}`,
            icon: 'logo.svg'
        });
    }
    
    // Atualizar painel se estiver aberto
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel && adminPanel.classList.contains('active')) {
        updateAdminStats();
        loadRecentOrders();
    }
}

// Solicitar permissão para notificações
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Funções de Autenticação

function validateCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

function authenticate(cpf, password) {
    // Remove caracteres não numéricos do CPF
    cpf = cpf.replace(/\D/g, '');
    
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

function login(event) {
    event.preventDefault();
    
    const cpf = document.getElementById('cpfInput').value;
    const password = document.getElementById('passwordInput').value;
    const errorEl = document.getElementById('loginError');
    
    // Validação básica
    if (!cpf || !password) {
        errorEl.textContent = 'Por favor, preencha todos os campos';
        return;
    }
    
    // Autenticação
    const result = authenticate(cpf, password);
    
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
        
    } else {
        errorEl.textContent = result.message;
        // Limpar campos em caso de erro
        document.getElementById('passwordInput').value = '';
    }
}

function logout() {
    isAuthenticated = false;
    hideAdminPanel();
    
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        sessionTimeout = null;
    }
    
    // Limpar sessão do localStorage
    localStorage.removeItem('fry_session');
    
    showNotification('Sessão encerrada', 'error');
}

function checkSession() {
    const session = localStorage.getItem('fry_session');
    if (session) {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        const sessionAge = now - sessionData.timestamp;
        
        // Sessão válida por 30 minutos
        if (sessionAge < 30 * 60 * 1000) {
            isAuthenticated = true;
            
            // Renovar timeout
            if (sessionTimeout) clearTimeout(sessionTimeout);
            sessionTimeout = setTimeout(logout, 30 * 60 * 1000 - sessionAge);
        } else {
            localStorage.removeItem('fry_session');
        }
    }
}

function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.remove('active');
}

// Inicialização da aplicação
function initializeApp() {
    console.log('Iniciando aplicação...');
    
    // Verificar se elementos existem
    const menuGrid = document.getElementById('menuGrid');
    const loginForm = document.getElementById('loginForm');
    const adminToggle = document.getElementById('adminToggle');
    
    console.log('menuGrid encontrado:', !!menuGrid);
    console.log('loginForm encontrado:', !!loginForm);
    console.log('adminToggle encontrado:', !!adminToggle);
    
    // Renderizar menu primeiro
    if (menuGrid) {
        renderMenu();
    } else {
        console.error('menuGrid não encontrado!');
    }
    
    
    // Inicializar funcionalidades avançadas
    initializeAdvancedFeatures();
    
    // Inicializar Firebase em background (sem await)
    initializeFirebase().then(() => {
        console.log('Firebase inicializado com sucesso');
    }).catch(error => {
        console.log('Firebase não disponível, usando localStorage');
    });
    
    // Verificar sessão existente
    checkSession();
    
    console.log('Aplicação inicializada com sucesso');
    
    // Event listeners do carrinho
    const cartIcon = document.getElementById('cartIcon');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    
    // Event listeners dos filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            filterMenu(category);
            
            // Atualizar botões ativos
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Event listeners do painel admin
    const adminClose = document.getElementById('adminClose');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (adminClose) adminClose.addEventListener('click', hideAdminPanel);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Event listeners do modal de login
    const loginClose = document.getElementById('loginClose');
    const loginOverlay = document.getElementById('loginOverlay');
    
    if (loginClose) loginClose.addEventListener('click', hideLoginModal);
    if (loginOverlay) loginOverlay.addEventListener('click', hideLoginModal);
    
    // Máscara para telefone
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                if (value.length <= 2) {
                    value = value;
                } else if (value.length <= 7) {
                    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                } else {
                    value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
                }
                e.target.value = value;
            }
        });
    }
    
    // Event listeners de navegação suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Event listener para menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }
    
    // Inicializar painel admin
    initializeAdminPanel();
    
    // Inicializar sistema de imagens
    initializeImageManagement();
    
    // Solicitar permissão para notificações
    requestNotificationPermission();
    
    // Efeito parallax no scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-bg');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });
}

// Função para adicionar produto ao carrinho (global)
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;

// Sistema de Gerenciamento de Imagens
function initializeImageManagement() {
    populateProductSelect();
    setupImageUpload();
    loadImagesFromFirebase();
}

function populateProductSelect() {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) return;
    
    // Limpar opções existentes
    productSelect.innerHTML = '<option value="">Selecione um produto</option>';
    
    // Adicionar todos os produtos
    Object.values(menuData).flat().forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - R$ ${product.price.toFixed(2).replace('.', ',')}`;
        productSelect.appendChild(option);
    });
}

function setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const uploadBtn = document.getElementById('uploadImageBtn');
    const productSelect = document.getElementById('productSelect');
    
    if (!imageUpload || !uploadBtn || !productSelect) return;
    
    // Preview da imagem
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                showImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Upload da imagem
    uploadBtn.addEventListener('click', function() {
        const productId = parseInt(productSelect.value);
        const file = imageUpload.files[0];
        
        if (!productId) {
            showUploadStatus('Selecione um produto', 'error');
            return;
        }
        
        if (!file) {
            showUploadStatus('Selecione uma imagem', 'error');
            return;
        }
        
        uploadImage(productId, file);
    });
}

function showImagePreview(imageSrc) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    preview.innerHTML = `
        <img src="${imageSrc}" alt="Preview">
        <div class="upload-status" id="uploadStatus"></div>
    `;
}

function uploadImage(productId, file) {
    const uploadBtn = document.getElementById('uploadImageBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    
    // Validar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showUploadStatus('Imagem muito grande. Máximo 2MB.', 'error');
        return;
    }
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        showUploadStatus('Selecione apenas arquivos de imagem.', 'error');
        return;
    }
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Processando...';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        
        // Salvar imagem localmente
        productImages[productId] = base64Image;
        
        // Salvar no Firebase
        saveImageToFirebase(productId, base64Image)
            .then(() => {
                showUploadStatus('Imagem salva com sucesso!', 'success');
                // Atualizar o cardápio se estiver visível
                if (document.getElementById('menuGrid')) {
                    renderMenu();
                }
            })
            .catch(error => {
                console.error('Erro ao salvar imagem:', error);
                showUploadStatus('Erro ao salvar imagem. Tente novamente.', 'error');
            })
            .finally(() => {
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload Imagem';
            });
    };
    
    reader.readAsDataURL(file);
}

function saveImageToFirebase(productId, base64Image) {
    return new Promise((resolve, reject) => {
        if (db) {
            // Salvar no Firebase
            db.collection('produtos').doc(productId.toString()).set({
                id: productId,
                imagem: base64Image,
                timestamp: new Date().toISOString()
            })
            .then(() => {
                console.log('Imagem salva no Firebase:', productId);
                // Também salvar no localStorage como backup
                localStorage.setItem(`product_image_${productId}`, base64Image);
                resolve();
            })
            .catch(error => {
                console.error('Erro ao salvar no Firebase:', error);
                // Fallback para localStorage
                localStorage.setItem(`product_image_${productId}`, base64Image);
                resolve();
            });
        } else {
            // Fallback para localStorage se Firebase não estiver disponível
            localStorage.setItem(`product_image_${productId}`, base64Image);
            resolve();
        }
    });
}

function loadImagesFromFirebase() {
    if (db) {
        // Carregar imagens do Firebase
        db.collection('produtos').get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.imagem) {
                        productImages[data.id] = data.imagem;
                    }
                });
                console.log('Imagens carregadas do Firebase');
                // Atualizar o cardápio se estiver visível
                if (document.getElementById('menuGrid')) {
                    renderMenu();
                }
            })
            .catch(error => {
                console.error('Erro ao carregar do Firebase:', error);
                // Fallback para localStorage
                loadFromLocalStorage();
            });
    } else {
        // Fallback para localStorage
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    // Carregar imagens salvas do localStorage
    Object.values(menuData).flat().forEach(product => {
        const savedImage = localStorage.getItem(`product_image_${product.id}`);
        if (savedImage) {
            productImages[product.id] = savedImage;
        }
    });
}

function showUploadStatus(message, type) {
    const status = document.getElementById('uploadStatus');
    if (status) {
        status.textContent = message;
        status.className = `upload-status ${type}`;
        
        // Limpar status após 3 segundos
        setTimeout(() => {
            status.textContent = '';
            status.className = 'upload-status';
        }, 3000);
    }
}

// Função para rolar até o menu
function scrollToMenu() {
    const menuSection = document.getElementById('cardapio');
    if (menuSection) {
        menuSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}



// Funcionalidades Avançadas
function initializeAdvancedFeatures() {
    // Lazy loading de imagens
    initializeLazyLoading();
    
    // Intersection Observer para animações
    initializeScrollAnimations();
    
    // Performance monitoring
    initializePerformanceMonitoring();
    
    // PWA features
    initializePWA();
    
    // Analytics e tracking
    initializeAnalytics();
    
    // Cache management
    initializeCacheManagement();
}

// Lazy Loading Avançado
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Animações de Scroll
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animações específicas por elemento
                if (entry.target.classList.contains('menu-item')) {
                    entry.target.style.animation = 'slideInFromBottom 0.6s ease-out forwards';
                } else if (entry.target.classList.contains('feature')) {
                    entry.target.style.animation = 'slideInFromLeft 0.6s ease-out forwards';
                } else if (entry.target.classList.contains('contact-item')) {
                    entry.target.style.animation = 'slideInFromRight 0.6s ease-out forwards';
                }
            }
        });
    }, observerOptions);

    // Observar elementos
    document.querySelectorAll('.menu-item, .feature, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
}

// Monitoramento de Performance
function initializePerformanceMonitoring() {
    // Core Web Vitals
    if ('web-vitals' in window) {
        import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(console.log);
            getFID(console.log);
            getFCP(console.log);
            getLCP(console.log);
            getTTFB(console.log);
        });
    }

    // Performance timing
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Performance:', {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 'N/A'
        });
    });
}

// PWA Features
function initializePWA() {
    // Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar botão de instalação
        showInstallButton();
    });

    function showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.textContent = '📱 Instalar App';
        installBtn.className = 'install-btn';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--coral);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 1000;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
            transition: all 0.3s ease;
        `;
        
        installBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                    installBtn.remove();
                });
            }
        });
        
        document.body.appendChild(installBtn);
    }
}

// Analytics e Tracking
function initializeAnalytics() {
    // Tracking de eventos
    function trackEvent(eventName, eventData = {}) {
        console.log('Event tracked:', eventName, eventData);
        
        // Aqui você pode integrar com Google Analytics, Facebook Pixel, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
    }

    // Tracking de cliques em produtos
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn')) {
            const productName = e.target.closest('.menu-item').querySelector('.menu-item-name').textContent;
            trackEvent('add_to_cart', {
                product_name: productName,
                value: parseFloat(e.target.closest('.menu-item').querySelector('.menu-item-price').textContent.replace('R$ ', '').replace(',', '.'))
            });
        }
        
        if (e.target.closest('.cta-button')) {
            trackEvent('cta_click', {
                button_text: e.target.textContent.trim()
            });
        }
    });

    // Tracking de scroll
    let scrollDepth = 0;
    window.addEventListener('scroll', () => {
        const newScrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (newScrollDepth > scrollDepth && newScrollDepth % 25 === 0) {
            trackEvent('scroll_depth', { depth: newScrollDepth });
            scrollDepth = newScrollDepth;
        }
    });
}

// Cache Management
function initializeCacheManagement() {
    // Cache de imagens
    const imageCache = new Map();
    
    function preloadImage(src) {
        if (imageCache.has(src)) {
            return Promise.resolve(imageCache.get(src));
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                imageCache.set(src, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    // Preload de imagens críticas
    const criticalImages = [
        'logo.svg',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ];
    
    criticalImages.forEach(src => {
        preloadImage(src).catch(console.warn);
    });
}

// Melhorias de UX
function enhanceUX() {
    // Feedback visual para ações
    function addVisualFeedback(element, type = 'success') {
        element.classList.add('loading');
        setTimeout(() => {
            element.classList.remove('loading');
            element.classList.add(type);
            setTimeout(() => element.classList.remove(type), 2000);
        }, 1000);
    }

    // Debounce para scroll
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle para resize
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Aplicar debounce ao scroll
    const debouncedScroll = debounce(() => {
        // Lógica de scroll otimizada
    }, 10);

    // Aplicar throttle ao resize
    const throttledResize = throttle(() => {
        // Lógica de resize otimizada
    }, 100);

    window.addEventListener('scroll', debouncedScroll);
    window.addEventListener('resize', throttledResize);
}

// Inicializar melhorias de UX
enhanceUX();

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeApp);
