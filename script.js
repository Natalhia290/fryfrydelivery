// Sistema de Autenticação
const authConfig = {
    cpf: '70389409103',
    password: '999999'
};

let isAuthenticated = false;
let sessionTimeout = null;

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
            name: "40 Hots Filadélfia",
            description: "40 irresistíveis e deliciosos hots. (De R$ 80,00 por R$ 40,00)",
            price: 40.00,
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

function initializeApp() {
    renderMenu();
    setupEventListeners();
    updateCartUI();
    initializeAdminPanel();
    requestNotificationPermission();
}

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
    // Adicionar efeito de loading
    menuGrid.innerHTML = '<div class="loading-spinner">Carregando cardápio...</div>';
    
    setTimeout(() => {
        menuGrid.innerHTML = '';
        
        let productsToShow = [];
        
        if (currentFilter === 'all') {
            Object.values(menuData).forEach(category => {
                productsToShow = productsToShow.concat(category);
            });
        } else {
            productsToShow = menuData[currentFilter] || [];
        }

        productsToShow.forEach((product, index) => {
            const productElement = createProductElement(product, index);
            menuGrid.appendChild(productElement);
            
            // Animação de entrada escalonada
            setTimeout(() => {
                productElement.style.opacity = '1';
                productElement.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 300);
}

function createProductElement(product, index) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.style.animationDelay = `${index * 0.1}s`;
    div.style.opacity = '0';
    div.style.transform = 'translateY(30px)';
    div.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    div.innerHTML = `
        <div class="menu-item-image">
            ${product.emoji}
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
                ${item.emoji}
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
const whatsappConfig = {
    phone: '5562995045038',
    businessName: 'FRY - Sushi Delivery',
    autoMessages: {
        greeting: '🍣 *FRY - Sushi Delivery* 🍣\n\nOlá! Bem-vindo(a) ao nosso delivery de sushi premium em Goiânia! 🎉',
        orderConfirmation: '✅ *Pedido Confirmado!*\n\nSeu pedido foi recebido e está sendo preparado com carinho! 🍱',
        deliveryInfo: '🚚 *Informações de Entrega:*\n• Tempo estimado: 30-45 minutos\n• Taxa de entrega: Grátis\n• Forma de pagamento: PIX, Dinheiro ou Cartão',
        closing: 'Obrigado por escolher a FRY! 🙏\n\n*Horário de funcionamento:*\nSegunda a Domingo: 18:00 às 23:00'
    }
};

// Checkout via WhatsApp com automação
function checkout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!', 'error');
        return;
    }

    // Animação do botão de checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.style.transform = 'scale(0.95)';
    checkoutBtn.innerHTML = 'Enviando...';
    
    setTimeout(() => {
        const message = generateAutomatedWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${whatsappConfig.phone}?text=${encodeURIComponent(message)}`;
        
        // Salvar pedido no localStorage para acompanhamento
        saveOrderToLocalStorage();
        
        window.open(whatsappUrl, '_blank');
        closeCart();
        
        // Resetar botão
        checkoutBtn.style.transform = 'scale(1)';
        checkoutBtn.innerHTML = 'Finalizar no WhatsApp';
        
        // Mostrar confirmação
        showNotification('Pedido enviado! Aguarde nossa confirmação via WhatsApp.', 'success');
    }, 500);
}

// Gerar mensagem automatizada inteligente
function generateAutomatedWhatsAppMessage() {
    const now = new Date();
    const orderId = generateOrderId();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let message = whatsappConfig.autoMessages.greeting;
    message += `\n\n📋 *PEDIDO #${orderId}*`;
    message += `\n🕐 ${now.toLocaleString('pt-BR')}\n\n`;
    
    message += '🍱 *ITENS DO PEDIDO:*\n';
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Quantidade: ${item.quantity}x\n`;
        message += `   Preço unitário: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
        message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n\n`;
    });
    
    message += `💰 *VALOR TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    
    // Adicionar informações de entrega
    message += whatsappConfig.autoMessages.deliveryInfo;
    message += '\n\n';
    
    // Adicionar instruções para o cliente
    message += '📝 *Para finalizar seu pedido, por favor informe:*\n';
    message += '• Endereço completo de entrega\n';
    message += '• Ponto de referência (opcional)\n';
    message += '• Forma de pagamento preferida\n';
    message += '• Observações especiais (se houver)\n\n';
    
    message += whatsappConfig.autoMessages.closing;
    
    return message;
}

// Gerar ID único para o pedido
function generateOrderId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FRY${timestamp}${random}`;
}

// Salvar pedido no localStorage para acompanhamento
function saveOrderToLocalStorage() {
    const order = {
        id: generateOrderId(),
        timestamp: new Date().toISOString(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending'
    };
    
    const orders = JSON.parse(localStorage.getItem('fryOrders') || '[]');
    orders.push(order);
    localStorage.setItem('fryOrders', JSON.stringify(orders));
    
    // Notificar administrador
    notifyAdmin(order);
    
    // Limpar carrinho após salvar
    cart = [];
    updateCartUI();
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
    const orders = JSON.parse(localStorage.getItem('fryOrders') || '[]');
    const today = new Date().toDateString();
    
    // Filtrar pedidos de hoje
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp).toDateString();
        return orderDate === today;
    });
    
    // Calcular estatísticas
    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Atualizar interface
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');
    
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
}

function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('fryOrders') || '[]');
    const recentOrdersEl = document.getElementById('recentOrders');
    
    if (!recentOrdersEl) return;
    
    // Ordenar por timestamp (mais recentes primeiro)
    const sortedOrders = orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Mostrar apenas os 5 mais recentes
    const recentOrders = sortedOrders.slice(0, 5);
    
    if (recentOrders.length === 0) {
        recentOrdersEl.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">Nenhum pedido ainda</p>';
        return;
    }
    
    recentOrdersEl.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <div class="order-id">Pedido #${order.id}</div>
            <div class="order-total">R$ ${order.total.toFixed(2).replace('.', ',')}</div>
            <div class="order-time">${new Date(order.timestamp).toLocaleString('pt-BR')}</div>
        </div>
    `).join('');
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
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    loginModal.classList.add('show');
    document.getElementById('cpfInput').focus();
}

function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    loginModal.classList.remove('show');
    clearLoginForm();
}

function clearLoginForm() {
    document.getElementById('cpfInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginError').textContent = '';
}

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

function showAdminPanel() {
    if (!isAuthenticated) {
        showLoginModal();
        return;
    }
    
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.add('active');
    updateAdminStats();
    loadRecentOrders();
}

function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.remove('active');
}

// Inicialização da aplicação
function initializeApp() {
    // Verificar sessão existente
    checkSession();
    
    // Renderizar menu
    renderMenu();
    
    // Event listeners do carrinho
    document.getElementById('cartIcon').addEventListener('click', toggleCart);
    document.getElementById('cartClose').addEventListener('click', toggleCart);
    document.getElementById('cartOverlay').addEventListener('click', toggleCart);
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    
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
    document.getElementById('adminToggle').addEventListener('click', showAdminPanel);
    document.getElementById('adminClose').addEventListener('click', hideAdminPanel);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Event listeners do modal de login
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('loginClose').addEventListener('click', hideLoginModal);
    document.getElementById('loginOverlay').addEventListener('click', hideLoginModal);
    
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

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeApp);
