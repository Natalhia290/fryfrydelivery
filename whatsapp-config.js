// Configuração do WhatsApp Business para FRY - Sushi Delivery
// Personalize as mensagens automáticas aqui

const whatsappBusinessConfig = {
    // Informações da empresa
    business: {
        name: 'FRY - Sushi Delivery',
        phone: '5562995045038',
        address: 'Goiânia - GO',
        hours: 'Segunda a Domingo: 18:00 às 23:00'
    },
    
    // Mensagens automáticas personalizáveis
    messages: {
        // Saudação inicial
        greeting: '🍣 *FRY - Sushi Delivery* 🍣\n\nOlá! Bem-vindo(a) ao nosso delivery de sushi premium em Goiânia! 🎉\n\nEstamos prontos para preparar o melhor sushi da cidade para você!',
        
        // Confirmação de pedido
        orderConfirmation: '✅ *Pedido Confirmado!*\n\nSeu pedido foi recebido e está sendo preparado com carinho pelos nossos chefs! 🍱\n\nEm breve você receberá mais informações sobre a entrega.',
        
        // Informações de entrega
        deliveryInfo: '🚚 *Informações de Entrega:*\n\n• ⏱️ Tempo estimado: 30-45 minutos\n• 🆓 Taxa de entrega: Grátis\n• 💳 Formas de pagamento: PIX, Dinheiro ou Cartão\n• 📍 Área de entrega: Goiânia e Região Metropolitana',
        
        // Instruções para o cliente
        clientInstructions: '📝 *Para finalizar seu pedido, por favor informe:*\n\n• 🏠 Endereço completo de entrega\n• 📍 Ponto de referência (opcional)\n• 💰 Forma de pagamento preferida\n• 📝 Observações especiais (se houver)\n• 📞 Telefone para contato',
        
        // Encerramento
        closing: 'Obrigado por escolher a FRY! 🙏\n\n*Horário de funcionamento:*\nSegunda a Domingo: 18:00 às 23:00\n\n*Contato:* (62) 99504-5038\n\n🍣 *Sushi Premium em Goiânia* 🍣',
        
        // Mensagens de status do pedido
        status: {
            preparing: '👨‍🍳 *Status do Pedido:*\n\nSeu pedido está sendo preparado pelos nossos chefs especializados! 🍱\n\nTempo estimado: 20-30 minutos',
            ready: '✅ *Pedido Pronto!*\n\nSeu pedido está pronto e saiu para entrega! 🚚\n\nO entregador chegará em breve.',
            delivered: '🎉 *Pedido Entregue!*\n\nObrigado por escolher a FRY! Esperamos que tenha gostado! 🍣\n\nAvalie nosso atendimento: ⭐⭐⭐⭐⭐'
        }
    },
    
    // Configurações de automação
    automation: {
        // Ativar notificações automáticas
        enableNotifications: true,
        
        // Tempo para enviar confirmação automática (em minutos)
        confirmationDelay: 2,
        
        // Tempo para enviar status de preparo (em minutos)
        preparingDelay: 15,
        
        // Tempo para enviar status de pronto (em minutos)
        readyDelay: 30,
        
        // Ativar lembretes de horário de funcionamento
        enableHoursReminder: true
    },
    
    // Templates de mensagens para diferentes situações
    templates: {
        // Pedido cancelado
        orderCancelled: '❌ *Pedido Cancelado*\n\nSeu pedido foi cancelado. Se precisar de ajuda, entre em contato conosco.',
        
        // Horário de funcionamento
        outsideHours: '⏰ *Fora do Horário de Funcionamento*\n\nEstamos fechados no momento.\n\n*Horário:* Segunda a Domingo: 18:00 às 23:00\n\nVolte em breve! 🍣',
        
        // Pedido muito grande
        largeOrder: '📦 *Pedido Grande Detectado*\n\nSeu pedido é muito grande! Entre em contato conosco para confirmar a disponibilidade.\n\n*Telefone:* (62) 99504-5038',
        
        // Produto indisponível
        itemUnavailable: '⚠️ *Produto Indisponível*\n\nAlguns itens do seu pedido podem estar indisponíveis no momento.\n\nEntre em contato para confirmar a disponibilidade.'
    }
};

// Exportar configuração para uso no site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = whatsappBusinessConfig;
} else {
    window.whatsappBusinessConfig = whatsappBusinessConfig;
}
