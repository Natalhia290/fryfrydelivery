// Script final - carregar dados do painel admin
console.log('🚀 Script carregado!');

// Dados do cardápio - carregados do painel admin
let menuData = {};

// Elementos DOM
const menuGrid = document.getElementById('menuGrid');

// Função para carregar dados do painel admin
function loadMenuData() {
    console.log('📋 Carregando dados do painel admin...');
    
    // Verificar se há dados salvos no localStorage
    const savedData = localStorage.getItem('fryMenuData');
    
    if (savedData) {
        try {
            menuData = JSON.parse(savedData);
            console.log('✅ Dados carregados do localStorage:', menuData);
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            menuData = getDefaultData();
        }
    } else {
        console.log('📋 Nenhum dado salvo, usando dados padrão');
        menuData = getDefaultData();
        // Salvar dados padrão
        localStorage.setItem('fryMenuData', JSON.stringify(menuData));
    }
    
    renderMenu();
}

// Dados padrão corretos
function getDefaultData() {
    return {
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
    card.innerHTML = `
        <div class="menu-item-image">
            <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="${product.name}" loading="lazy">
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

// Adicionar ao carrinho
function addToCart(productId) {
    alert('Produto adicionado ao carrinho! ID: ' + productId);
}

// Escutar mudanças do painel admin
function setupSync() {
    // Escutar mudanças no localStorage
    window.addEventListener('storage', function(event) {
        if (event.key === 'fryMenuData') {
            console.log('🔄 Dados atualizados via localStorage');
            loadMenuData();
        }
    });
    
    // Verificar atualizações a cada 3 segundos
    setInterval(() => {
        const savedData = localStorage.getItem('fryMenuData');
        if (savedData) {
            try {
                const newData = JSON.parse(savedData);
                if (JSON.stringify(newData) !== JSON.stringify(menuData)) {
                    console.log('🔄 Atualização detectada via polling');
                    menuData = newData;
                    renderMenu();
                }
            } catch (error) {
                console.error('❌ Erro ao verificar atualizações:', error);
            }
        }
    }, 3000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado - Iniciando...');
    
    // Carregar dados
    loadMenuData();
    
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
