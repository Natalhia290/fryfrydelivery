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
        loadProductImages();
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
    const errorEl = document.getElementById('loginError');
    
    if (cpfInput) cpfInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (errorEl) errorEl.textContent = '';
}

function login(event) {
    event.preventDefault();
    console.log('Função login chamada');
    
    const cpfInput = document.getElementById('cpfInput');
    const passwordInput = document.getElementById('passwordInput');
    const errorEl = document.getElementById('loginError');
    
    if (!cpfInput || !passwordInput) {
        console.error('Elementos de input não encontrados');
        return;
    }
    
    const cpf = cpfInput.value.replace(/\D/g, '');
    const password = passwordInput.value;
    
    console.log('Tentativa de login - CPF:', cpf, 'Password:', password);
    
    const result = authenticateUser(cpf, password);
    
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
        
        // Mostrar painel admin
        showAdminPanel();
    } else {
        if (errorEl) errorEl.textContent = result.message;
    }
}

function authenticateUser(cpf, password) {
    if (cpf === authConfig.cpf && password === authConfig.password) {
        return { success: true };
    }
    return { success: false, message: 'CPF ou senha incorretos' };
}

function logout() {
    isAuthenticated = false;
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.remove('active');
    }
    
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        sessionTimeout = null;
    }
    
    localStorage.removeItem('fry_session');
    showNotification('Logout realizado com sucesso!', 'success');
}

// Atualizar estatísticas do admin
function updateAdminStats() {
    const orders = JSON.parse(localStorage.getItem('fryOrders') || '[]');
    const today = new Date().toDateString();
    
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp).toDateString();
        return orderDate === today;
    });
    
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');
    
    if (totalOrdersEl) totalOrdersEl.textContent = todayOrders.length;
    if (totalRevenueEl) totalRevenueEl.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
}

// Carregar pedidos recentes
function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('fryOrders') || '[]');
    const recentOrdersEl = document.getElementById('recentOrders');
    
    if (!recentOrdersEl) return;
    
    if (orders.length === 0) {
        recentOrdersEl.innerHTML = '<div class="no-orders">Nenhum pedido encontrado</div>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    const sortedOrders = orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    recentOrdersEl.innerHTML = sortedOrders.slice(0, 10).map(order => `
        <div class="order-item">
            <div class="order-info">
                <span class="order-id">${order.id}</span>
                <span class="order-customer">${order.cliente}</span>
                <span class="order-total">R$ ${order.total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="order-date">${new Date(order.timestamp).toLocaleString('pt-BR')}</div>
        </div>
    `).join('');
}

// Carregar imagens dos produtos
function loadProductImages() {
    const savedImages = localStorage.getItem('fryProductImages');
    if (savedImages) {
        productImages = JSON.parse(savedImages);
    }
    
    // Atualizar select de produtos
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        productSelect.innerHTML = '<option value="">Selecione um produto</option>';
        
        // Adicionar produtos do cardápio
        const menuItems = [
            { id: 1, name: 'Big Hot de Tilápia + 2 Minis' },
            { id: 2, name: 'Combo Sushi + Temaki' },
            { id: 3, name: 'Temaki de Salmão' },
            { id: 4, name: 'Sushi de Atum' },
            { id: 5, name: 'Combo Especial' }
        ];
        
        menuItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            productSelect.appendChild(option);
        });
    }
}

// Upload de imagem
function setupImageUpload() {
    const uploadBtn = document.getElementById('uploadImageBtn');
    const imageInput = document.getElementById('imageUpload');
    const productSelect = document.getElementById('productSelect');
    const imagePreview = document.getElementById('imagePreview');
    
    if (uploadBtn && imageInput && productSelect) {
        uploadBtn.addEventListener('click', () => {
            const productId = productSelect.value;
            const file = imageInput.files[0];
            
            if (!productId) {
                showNotification('Selecione um produto primeiro!', 'error');
                return;
            }
            
            if (!file) {
                showNotification('Selecione uma imagem primeiro!', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target.result;
                productImages[productId] = base64Image;
                
                // Salvar no localStorage
                localStorage.setItem('fryProductImages', JSON.stringify(productImages));
                
                // Mostrar preview
                if (imagePreview) {
                    imagePreview.innerHTML = `
                        <img src="${base64Image}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                        <p>Imagem salva com sucesso!</p>
                    `;
                }
                
                showNotification('Imagem salva com sucesso!', 'success');
                
                // Limpar inputs
                imageInput.value = '';
                productSelect.value = '';
            };
            reader.readAsDataURL(file);
        });
    }
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (notification && notificationText) {
        notificationText.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Verificar sessão ao carregar a página
function checkSession() {
    const session = localStorage.getItem('fry_session');
    if (session) {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        const sessionAge = now - sessionData.timestamp;
        
        if (sessionAge < 30 * 60 * 1000) { // 30 minutos
            isAuthenticated = true;
            sessionTimeout = setTimeout(logout, 30 * 60 * 1000 - sessionAge);
        } else {
            localStorage.removeItem('fry_session');
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    setupImageUpload();
    
    // Event listeners
    const loginClose = document.getElementById('loginClose');
    const adminClose = document.getElementById('adminClose');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginClose) {
        loginClose.addEventListener('click', hideLoginModal);
    }
    
    if (adminClose) {
        adminClose.addEventListener('click', () => {
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) {
                adminPanel.classList.remove('active');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Fechar modal ao clicar no overlay
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                hideLoginModal();
            }
        });
    }
});
