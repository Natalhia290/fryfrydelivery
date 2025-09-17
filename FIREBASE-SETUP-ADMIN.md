# Configuração do Firebase para Painel Administrativo

## 1. Configurar Regras do Firestore

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione o projeto `fryfrydelivery`
3. Vá para **Firestore Database** > **Regras**
4. Substitua as regras atuais pelo conteúdo do arquivo `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para pedidos
    match /orders/{orderId} {
      allow read, write: if true;
    }
    
    // Permitir leitura e escrita para imagens de produtos
    match /produtos/{produtoId} {
      allow read, write: if true;
    }
    
    // Permitir leitura e escrita para configurações
    match /configuracoes/{configId} {
      allow read, write: if true;
    }
    
    // Permitir leitura e escrita para estatísticas
    match /estatisticas/{statId} {
      allow read, write: if true;
    }
    
    // Permitir leitura pública para cardápio
    match /cardapio/{itemId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Permitir leitura e escrita para qualquer documento
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Clique em **Publicar**

## 2. Testar o Sistema

1. **Acesse o site principal** (index.html)
2. **Clique no botão verde 🔧** para teste direto do admin
3. **Ou faça login normal:**
   - CPF: `70389409103`
   - Senha: `999999`
4. **Deve redirecionar para admin.html**

## 3. Testar Atualização em Tempo Real

1. **Abra duas abas:**
   - Aba 1: admin.html (painel administrativo)
   - Aba 2: index.html (site principal)
2. **Na aba do site principal:**
   - Adicione itens ao carrinho
   - Faça checkout com dados de teste
3. **Na aba do admin:**
   - O pedido deve aparecer automaticamente em 2 segundos

## 4. Estrutura do Banco de Dados

### Coleção: `orders`
```json
{
  "id": "FRY1DEL",
  "timestamp": "2024-09-17T15:30:00.000Z",
  "itens": [
    {
      "id": 1,
      "name": "Big Hot de Tilápia",
      "price": 49.90,
      "quantity": 2
    }
  ],
  "total": 99.80,
  "status": "pendente",
  "cliente": "João Silva",
  "telefone": "(62) 99999-9999",
  "notes": "",
  "updatedAt": "2024-09-17T15:30:00.000Z"
}
```

## 5. Solução de Problemas

### Se o admin não carregar:
1. Verifique o console do navegador (F12)
2. Verifique se as regras do Firebase estão corretas
3. Verifique se o arquivo admin.html existe

### Se os pedidos não atualizarem:
1. Verifique se há pedidos no localStorage
2. Abra o console e veja os logs
3. Verifique se a atualização em tempo real está funcionando

### Logs importantes no console:
- "Inicializando painel administrativo..."
- "Pedidos carregados: X"
- "Novos pedidos detectados, atualizando..."
- "Renderizando pedidos: X"

## 6. Recursos do Painel Admin

- **Dashboard:** Estatísticas em tempo real
- **Pedidos:** Lista com filtros e edição de status
- **Cardápio:** Visualização dos itens
- **Fotos:** Upload de imagens para produtos
- **Estatísticas:** Gráficos e relatórios

## 7. Status dos Pedidos

- **Pendente:** Novo pedido recebido
- **Preparando:** Em produção
- **Pronto:** Aguardando entrega
- **Entregue:** Finalizado
