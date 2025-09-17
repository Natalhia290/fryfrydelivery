# Configuração do Firebase para FRY Sushi Delivery

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
    match /pedidos/{pedidoId} {
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
  }
}
```

5. Clique em **Publicar**

## 2. Verificar Configuração do Projeto

As configurações do Firebase já estão corretas no código:
- **Project ID**: fryfrydelivery
- **API Key**: AIzaSyC9UzFuG_0wYjsXkNDf776RCY8X3TpcI1Q
- **Auth Domain**: fryfrydelivery.firebaseapp.com

## 3. Testar o Sistema

1. Acesse o painel administrativo (botão flutuante)
2. Faça login com as credenciais:
   - **CPF**: 70389409103
   - **Senha**: 999999
3. Na seção "Gerenciar Imagens":
   - Selecione um produto
   - Faça upload de uma imagem
   - A imagem será salva no Firebase e atualizada em tempo real

## 4. Estrutura do Banco de Dados

O sistema criará automaticamente as seguintes coleções:

### Coleção: `produtos`
```json
{
  "id": 1,
  "imagem": "data:image/jpeg;base64,/9j/4AAQ...",
  "timestamp": "2024-09-17T15:30:00.000Z"
}
```

### Coleção: `pedidos`
```json
{
  "id": "pedido_123",
  "cliente": "João Silva",
  "telefone": "(62) 99999-9999",
  "itens": [...],
  "total": 49.90,
  "timestamp": "2024-09-17T15:30:00.000Z"
}
```

## 5. Recursos Implementados

- ✅ **Upload de imagens** em base64
- ✅ **Salvamento no Firebase** Firestore
- ✅ **Atualização em tempo real** do cardápio
- ✅ **Fallback para localStorage** se Firebase não estiver disponível
- ✅ **Validação de arquivos** (tipo e tamanho)
- ✅ **Preview de imagens** antes do upload
- ✅ **Feedback visual** de status

## 6. Solução de Problemas

### Se as imagens não atualizarem:
1. Verifique se as regras do Firestore estão corretas
2. Verifique o console do navegador para erros
3. Verifique se o Firebase está carregando corretamente

### Se o Firebase não carregar:
- O sistema usará localStorage como fallback
- As imagens serão salvas localmente
- Funcionalidade básica continuará funcionando
