// Script final - carregar dados do painel admin via Firebase - VERCEL FORCE UPDATE 15:50
console.log('🚀 Script carregado! - VERCEL FORCE UPDATE 15:50');

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
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log('✅ Firebase inicializado!');
    }
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

// Dados do cardápio - carregados do Firebase
let menuData = {};

// Sistema de imagens personalizadas
let productImages = {};

// Elementos DOM
const menuGrid = document.getElementById('menuGrid');

// Função para carregar dados do painel admin via Firebase
async function loadMenuData() {
    console.log('📋 Carregando dados do painel admin via Firebase...');
    
    if (!db) {
        console.error('❌ Firebase não inicializado!');
        showEmptyMenuMessage();
        return;
    }
    
    try {
        // Carregar dados do Firebase
        const doc = await db.collection('cardapio').doc('menu').get();
        
        if (doc.exists) {
            menuData = doc.data();
            console.log('✅ Dados carregados do Firebase:', menuData);
            renderMenu();
        } else {
            console.log('📋 Nenhum dado encontrado no Firebase');
            showEmptyMenuMessage();
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados do Firebase:', error);
        showEmptyMenuMessage();
    }
}

// Mostrar mensagem de cardápio vazio
function showEmptyMenuMessage() {
    if (menuGrid) {
        menuGrid.innerHTML = `
            <div class="empty-menu">
                <h3>🍣 Cardápio em Configuração</h3>
                <p>O cardápio está sendo configurado no painel administrativo.</p>
                <button onclick="openPedidosPanel()" class="cta-button">Configurar Cardápio</button>
            </div>
        `;
    }
}


// Renderizar menu
function renderMenu() {
    console.log('🎨 Renderizando menu...');
    
    if (!menuGrid) {
        console.error('❌ menuGrid não encontrado!');
        return;
    }
    
    // Limpar grid
    menuGrid.innerHTML = '';
    
    // Renderizar produtos
    const categories = ['bigHots', 'miniSushiDog', 'combos', 'bebidas', 'adicionais'];
    
    categories.forEach(category => {
        if (menuData[category] && menuData[category].length > 0) {
            menuData[category].forEach(product => {
                const productCard = createProductCard(product);
                menuGrid.appendChild(productCard);
            });
        }
    });
    
    console.log('✅ Menu renderizado!');
}

// Criar card do produto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'menu-item';
    
    // Verificar se tem imagem personalizada
    const productImage = getProductImage(product);
    
    card.innerHTML = `
        <div class="menu-item-image">
            ${productImage ? 
                `<img src="${productImage}" alt="${product.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\">SEM IMAGEM</div>'">` :
                `<div class="no-image">SEM IMAGEM</div>`
            }
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

// Função para obter imagem do produto
function getProductImage(product) {
    // Primeiro verifica se há imagem personalizada
    if (productImages[product.id]) {
        return productImages[product.id];
    }
    
    // Verificar se há imagem salva no localStorage
    const savedImage = localStorage.getItem(`product_image_${product.id}`);
    if (savedImage) {
        productImages[product.id] = savedImage;
        return savedImage;
    }
    
    // Se não houver imagem personalizada, retorna null para mostrar "SEM IMAGEM"
    return null;
}

// Função para salvar imagem do produto
function saveProductImage(productId, imageData) {
    productImages[productId] = imageData;
    localStorage.setItem(`product_image_${productId}`, imageData);
    console.log(`✅ Imagem salva para produto ${productId}`);
}

// Função para upload de imagem (será chamada pelo painel admin)
function uploadProductImage(productId, file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            saveProductImage(productId, imageData);
            resolve(imageData);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Adicionar ao carrinho
function addToCart(productId) {
    alert('Produto adicionado ao carrinho! ID: ' + productId);
}

// Escutar mudanças do painel admin via Firebase
function setupSync() {
    if (!db) {
        console.error('❌ Firebase não inicializado para sincronização!');
        return;
    }
    
    // Escutar mudanças em tempo real no Firebase
    db.collection('cardapio').doc('menu').onSnapshot((doc) => {
        if (doc.exists) {
            console.log('🔄 Dados atualizados via Firebase:', doc.data());
            menuData = doc.data();
            renderMenu();
        }
    }, (error) => {
        console.error('❌ Erro ao escutar mudanças do Firebase:', error);
    });
    
    // Verificar atualizações a cada 5 segundos como fallback
    setInterval(async () => {
        try {
            const doc = await db.collection('cardapio').doc('menu').get();
            if (doc.exists) {
                const newData = doc.data();
                if (JSON.stringify(newData) !== JSON.stringify(menuData)) {
                    console.log('🔄 Atualização detectada via polling');
                    menuData = newData;
                    renderMenu();
                }
            }
        } catch (error) {
            console.error('❌ Erro ao verificar atualizações:', error);
        }
    }, 5000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM carregado - Iniciando...');
    
    // Carregar dados do Firebase
    await loadMenuData();
    
    // Configurar sincronização
    setupSync();
    
    console.log('✅ Aplicação inicializada!');
});

// Funções globais para admin
function showAdminPanel() {
    // Verificar se está logado
    const session = localStorage.getItem('fry_session');
    if (!session) {
        showLoginModal();
        return;
    }
    
    try {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        const sessionTimeout = 30 * 60 * 1000; // 30 minutos
        
        if (!sessionData.authenticated || (now - sessionData.timestamp) > sessionTimeout) {
            localStorage.removeItem('fry_session');
            showLoginModal();
            return;
        }
    } catch (error) {
        localStorage.removeItem('fry_session');
        showLoginModal();
        return;
    }
    
    alert('Redirecionando para painel admin...');
    window.open('painel-pedidos.html', '_blank');
}

function openPedidosPanel() {
    // Verificar se está logado
    const session = localStorage.getItem('fry_session');
    if (!session) {
        showLoginModal();
        return;
    }
    
    try {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        const sessionTimeout = 30 * 60 * 1000; // 30 minutos
        
        if (!sessionData.authenticated || (now - sessionData.timestamp) > sessionTimeout) {
            localStorage.removeItem('fry_session');
            showLoginModal();
            return;
        }
    } catch (error) {
        localStorage.removeItem('fry_session');
        showLoginModal();
        return;
    }
    
    alert('Redirecionando para painel de pedidos...');
    window.open('painel-pedidos.html', '_blank');
}

function openAcompanharPedido() {
    alert('Redirecionando para acompanhar pedido...');
    window.open('acompanhar-pedido.html', '_blank');
}

// Função de login básica
function login(event) {
    event.preventDefault();
    const cpf = document.getElementById('cpfInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (cpf === '70389409103' && password === '999999') {
        // Salvar sessão no localStorage
        localStorage.setItem('fry_session', JSON.stringify({
            authenticated: true,
            timestamp: Date.now()
        }));
        
        alert('Login realizado com sucesso!');
        hideLoginModal();
        
        // Redirecionar para painel admin
        window.open('painel-pedidos.html', '_blank');
    } else {
        alert('CPF ou senha incorretos!');
    }
}

// Função para fechar modal de login
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Função para mostrar modal de login
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('show');
    }
}

console.log('📄 Script final carregado!');
