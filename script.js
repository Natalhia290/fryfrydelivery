// Script de debug super simples
console.log('🚀 SCRIPT CARREGADO!');

// Função para testar se está funcionando
function testScript() {
    console.log('🧪 TESTE: Script funcionando!');
    alert('🧪 TESTE: Script funcionando!');
    
    // Testar se consegue encontrar o menuGrid
    const menuGrid = document.getElementById('menuGrid');
    if (menuGrid) {
        console.log('✅ menuGrid encontrado!');
        alert('✅ menuGrid encontrado!');
        
        // Adicionar conteúdo de teste
        menuGrid.innerHTML = `
            <div class="menu-item">
                <div class="menu-item-content">
                    <h3>🍣 TESTE - Big Hot de Tilápia</h3>
                    <p>Teste de carregamento</p>
                    <div class="menu-item-footer">
                        <span class="menu-item-price">R$ 49,90</span>
                        <button class="add-to-cart-btn">Adicionar +</button>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Conteúdo adicionado ao menuGrid!');
        alert('✅ Conteúdo adicionado ao menuGrid!');
    } else {
        console.error('❌ menuGrid NÃO encontrado!');
        alert('❌ menuGrid NÃO encontrado!');
    }
}

// Executar teste imediatamente
testScript();

// Também executar quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM CARREGADO!');
    alert('🚀 DOM CARREGADO!');
    testScript();
});

// Funções globais básicas
function showAdminPanel() {
    alert('Redirecionando para painel admin...');
    window.open('painel-pedidos.html', '_blank');
}

function openPedidosPanel() {
    alert('Redirecionando para painel de pedidos...');
    window.open('painel-pedidos.html', '_blank');
}

function openAcompanharPedido() {
    alert('Redirecionando para acompanhar pedido...');
    window.open('acompanhar-pedido.html', '_blank');
}

function login(event) {
    event.preventDefault();
    const cpf = document.getElementById('cpfInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (cpf === '70389409103' && password === '999999') {
        alert('Login realizado com sucesso!');
        window.location.href = 'admin.html';
    } else {
        alert('CPF ou senha incorretos!');
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('show');
    }
}

console.log('📄 SCRIPT FINALIZADO!');
