# 🔥 Regras do Firebase Firestore

## Configuração Necessária

Para que os pedidos sejam salvos no Firebase, você precisa configurar as regras do Firestore:

### 1. Acesse o Console do Firebase
- Vá para: https://console.firebase.google.com/project/fryfrydelivery/firestore/databases/-default-/rules

### 2. Substitua as regras atuais por estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita na coleção 'orders'
    match /orders/{document} {
      allow read, write: if true;
    }
    
    // Permitir leitura e escrita na coleção 'admin'
    match /admin/{document} {
      allow read, write: if true;
    }
  }
}
```

### 3. Clique em "Publicar"

## ⚠️ Importante

**ATENÇÃO:** Essas regras permitem acesso público. Para produção, você deve implementar autenticação adequada.

### Regras mais seguras para produção:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas permitir escrita de pedidos (sem autenticação para clientes)
    match /orders/{document} {
      allow write: if true;
      allow read: if false; // Apenas admin pode ler
    }
    
    // Admin com autenticação
    match /admin/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 Testando

Após configurar as regras:

1. Faça um pedido no site
2. Abra o Console do navegador (F12)
3. Verifique se aparece: "Pedido salvo no Firebase com ID: [ID]"
4. Acesse o Firestore no console do Firebase
5. Verifique se o pedido aparece na coleção "orders"

## 📊 Estrutura dos Dados

Os pedidos são salvos com esta estrutura:

```json
{
  "id": "FRY123456789",
  "timestamp": "2024-12-17T14:30:00.000Z",
  "items": [
    {
      "id": 1,
      "name": "Big Hot de Salmão + 2 Minis",
      "price": 59.90,
      "quantity": 1,
      "category": "bigHots"
    }
  ],
  "total": 59.90,
  "status": "pending",
  "customer": {
    "name": "João Silva",
    "phone": "(62) 99999-9999"
  }
}
```
