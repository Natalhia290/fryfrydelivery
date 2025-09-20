// Script para forçar dados do painel admin
console.log('🔥 FORÇANDO DADOS DO PAINEL ADMIN!');

// Dados corretos do painel admin
const adminData = {
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

// Forçar salvamento no localStorage
localStorage.setItem('fryMenuData', JSON.stringify(adminData));
console.log('✅ Dados do painel admin forçados!', adminData);

// Disparar evento de atualização
window.dispatchEvent(new CustomEvent('menuDataUpdated', {
    detail: { menuData: adminData }
}));

console.log('🚀 Dados forçados e evento disparado!');
