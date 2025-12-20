# 🧪 Guia de Testes - Sistema de Pagamentos

## 📋 Índice
1. [Testes Locais](#testes-locais)
2. [Testes em Produção](#testes-em-produção)
3. [Testes de Webhook](#testes-de-webhook)
4. [Verificação de Dados](#verificação-de-dados)

---

## 🏠 Testes Locais

### Pré-requisitos
```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local (opcional)
supabase start
```

### Testar create-billing localmente

#### 1. Preparar payload de teste
Crie um arquivo `test-billing.json`:
```json
{
  "planSlug": "pro",
  "planName": "Pro",
  "priceInCents": 2600,
  "customer": {
    "name": "João Silva Teste",
    "email": "joao.teste@example.com",
    "cellphone": "11999999999",
    "taxId": "12345678901"
  }
}
```

#### 2. Executar função localmente
```bash
# Obter token de autenticação
# (faça login na aplicação e copie o token do localStorage ou console)
export AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Testar função
curl -X POST \
  http://localhost:54321/functions/v1/create-billing \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-billing.json
```

#### 3. Resposta esperada
```json
{
  "success": true,
  "billingId": "abacate_billing_xyz123",
  "paymentUrl": "https://pay.abacatepay.com/...",
  "status": "pending",
  "paymentId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 🌐 Testes em Produção

### 1. Teste de Criação de Pagamento

#### Via Interface da Aplicação
1. Acesse a aplicação em produção
2. Faça login com um usuário de teste
3. Vá para `/pricing`
4. Clique em "Assinar" no plano desejado
5. Preencha os dados:
   - Nome: Teste Usuario
   - Email: teste@example.com
   - Telefone: (11) 99999-9999
   - CPF: 123.456.789-01
6. Clique em "Pagar com PIX"

#### Verificações
- [ ] Redirecionamento para página do AbacatePay
- [ ] QR Code PIX gerado
- [ ] Registro criado na tabela `payments` com status "pending"

### 2. Teste de Confirmação de Pagamento

#### Simular Pagamento (Ambiente de Teste)
1. Use o ambiente sandbox do AbacatePay
2. Complete o pagamento de teste
3. Aguarde webhook ser chamado

#### Verificações
- [ ] Webhook foi chamado (verificar logs)
- [ ] Pagamento atualizado para status "completed"
- [ ] Subscription criada com status "active"
- [ ] Redirecionamento para `/dashboard?payment_status=success`
- [ ] Toast de confirmação exibido

---

## 🔗 Testes de Webhook

### Testar Webhook Localmente

#### 1. Usar ngrok para expor localhost
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 54321
```

#### 2. Configurar webhook no AbacatePay
Use a URL do ngrok:
```
https://abc123.ngrok.io/functions/v1/abacatepay-webhook
```

#### 3. Simular evento de webhook

Crie um arquivo `test-webhook.json`:
```json
{
  "event": "billing.paid",
  "data": {
    "id": "abacate_billing_test123",
    "status": "paid",
    "amount": 2600,
    "customer": {
      "email": "joao.teste@example.com",
      "name": "João Silva Teste",
      "taxId": "12345678901",
      "cellphone": "11999999999"
    },
    "products": [
      {
        "externalId": "pro",
        "name": "Pro",
        "price": 2600,
        "quantity": 1
      }
    ],
    "metadata": {
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "planId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "planSlug": "pro"
    }
  }
}
```

#### 4. Enviar webhook manualmente
```bash
curl -X POST \
  https://splljyokmwsqgczjrvpo.supabase.co/functions/v1/abacatepay-webhook \
  -H "Content-Type: application/json" \
  -d @test-webhook.json
```

#### 5. Resposta esperada
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## 🔍 Verificação de Dados

### Verificar Pagamentos no Supabase

#### Via SQL Editor
```sql
-- Ver todos os pagamentos
SELECT 
  p.id,
  p.status,
  p.amount,
  p.external_payment_id,
  u.email as user_email,
  pl.name as plan_name,
  p.created_at
FROM payments p
JOIN auth.users u ON p.user_id = u.id
JOIN plans pl ON p.plan_id = pl.id
ORDER BY p.created_at DESC
LIMIT 10;
```

#### Via Table Editor
1. Acesse Supabase Dashboard
2. Vá em **Table Editor**
3. Selecione tabela `payments`
4. Verifique os registros

### Verificar Subscriptions

#### Via SQL Editor
```sql
-- Ver subscriptions ativas
SELECT 
  s.id,
  s.status,
  u.email as user_email,
  pl.name as plan_name,
  s.start_at,
  s.end_at,
  s.end_at - NOW() as time_remaining
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
JOIN plans pl ON s.plan_id = pl.id
WHERE s.status = 'active'
ORDER BY s.created_at DESC;
```

### Verificar Logs das Funções

#### create-billing
1. Acesse Supabase Dashboard
2. Vá em **Edge Functions** → **create-billing** → **Logs**
3. Procure por:
   ```
   ✅ "Authenticated user: [user_id]"
   ✅ "Creating billing for: ..."
   ✅ "Billing created successfully: [billing_id]"
   ✅ "Payment record created: [payment_id]"
   ```

#### abacatepay-webhook
1. Acesse Supabase Dashboard
2. Vá em **Edge Functions** → **abacatepay-webhook** → **Logs**
3. Procure por:
   ```
   ✅ "Webhook received: ..."
   ✅ "Payment created: [payment_id]"
   ✅ "Subscription created: [subscription_id]"
   ```

---

## 🐛 Testes de Cenários de Erro

### 1. Teste: Usuário não autenticado

#### Comando
```bash
curl -X POST \
  https://splljyokmwsqgczjrvpo.supabase.co/functions/v1/create-billing \
  -H "Content-Type: application/json" \
  -d @test-billing.json
```

#### Resposta esperada
```json
{
  "success": false,
  "error": "Unauthorized"
}
```
**Status:** 401

### 2. Teste: Plano inexistente

#### Payload
```json
{
  "planSlug": "plano-inexistente",
  "planName": "Plano Inexistente",
  "priceInCents": 1000,
  "customer": { ... }
}
```

#### Resposta esperada
```json
{
  "success": false,
  "error": "Plano não encontrado"
}
```
**Status:** 404

### 3. Teste: Dados inválidos

#### Payload
```json
{
  "planSlug": "pro",
  "planName": "Pro",
  "priceInCents": -100,
  "customer": {
    "name": "AB",
    "email": "email-invalido",
    "cellphone": "123",
    "taxId": "123"
  }
}
```

#### Resposta esperada
```json
{
  "success": false,
  "error": "Dados de entrada inválidos",
  "details": {
    "priceInCents": { ... },
    "customer": {
      "name": { ... },
      "email": { ... },
      "cellphone": { ... },
      "taxId": { ... }
    }
  }
}
```
**Status:** 400

### 4. Teste: Webhook com email não cadastrado

#### Payload
```json
{
  "event": "billing.paid",
  "data": {
    "customer": {
      "email": "usuario-nao-existe@example.com",
      ...
    },
    ...
  }
}
```

#### Resposta esperada
```json
{
  "success": false,
  "error": "User not found with email: usuario-nao-existe@example.com"
}
```
**Status:** 500

---

## ✅ Checklist de Testes

### Testes Funcionais
- [ ] Criar pagamento com usuário autenticado
- [ ] Criar pagamento sem autenticação (deve falhar)
- [ ] Criar pagamento com plano inexistente (deve falhar)
- [ ] Criar pagamento com dados inválidos (deve falhar)
- [ ] Webhook processa pagamento confirmado
- [ ] Webhook cria subscription
- [ ] Webhook renova subscription existente
- [ ] Webhook com email não cadastrado (deve falhar)

### Testes de Integração
- [ ] Fluxo completo: criar → pagar → confirmar
- [ ] Redirecionamento após pagamento
- [ ] Toast de confirmação exibido
- [ ] Dados salvos corretamente no banco

### Testes de Performance
- [ ] Tempo de resposta de create-billing < 3s
- [ ] Tempo de resposta de webhook < 2s
- [ ] Múltiplos pagamentos simultâneos

### Testes de Segurança
- [ ] RLS impede acesso a pagamentos de outros usuários
- [ ] Webhook não aceita dados maliciosos
- [ ] Validação de entrada funciona corretamente

---

## 📊 Métricas de Sucesso

### KPIs para Monitorar
- **Taxa de sucesso de pagamentos:** > 95%
- **Tempo médio de processamento:** < 3s
- **Taxa de erro de webhook:** < 1%
- **Subscriptions criadas vs pagamentos:** 100%

### Queries de Monitoramento

#### Taxa de conversão
```sql
SELECT 
  COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / 
  COUNT(*)::float * 100 as conversion_rate
FROM payments
WHERE created_at > NOW() - INTERVAL '7 days';
```

#### Pagamentos por dia
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_payments,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(amount) FILTER (WHERE status = 'completed') as total_revenue
FROM payments
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🔧 Ferramentas Úteis

### Postman Collection
Importe esta collection para testar as APIs:

```json
{
  "info": {
    "name": "Lucrofy Payment System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Billing",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{auth_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"planSlug\": \"pro\",\n  \"planName\": \"Pro\",\n  \"priceInCents\": 2600,\n  \"customer\": {\n    \"name\": \"João Silva\",\n    \"email\": \"joao@example.com\",\n    \"cellphone\": \"11999999999\",\n    \"taxId\": \"12345678901\"\n  }\n}"
        },
        "url": {
          "raw": "https://splljyokmwsqgczjrvpo.supabase.co/functions/v1/create-billing",
          "protocol": "https",
          "host": ["splljyokmwsqgczjrvpo", "supabase", "co"],
          "path": ["functions", "v1", "create-billing"]
        }
      }
    },
    {
      "name": "Webhook Simulation",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"event\": \"billing.paid\",\n  \"data\": {\n    \"id\": \"test_billing_123\",\n    \"status\": \"paid\",\n    \"amount\": 2600,\n    \"customer\": {\n      \"email\": \"joao@example.com\",\n      \"name\": \"João Silva\",\n      \"taxId\": \"12345678901\",\n      \"cellphone\": \"11999999999\"\n    },\n    \"products\": [{\n      \"externalId\": \"pro\",\n      \"name\": \"Pro\",\n      \"price\": 2600,\n      \"quantity\": 1\n    }]\n  }\n}"
        },
        "url": {
          "raw": "https://splljyokmwsqgczjrvpo.supabase.co/functions/v1/abacatepay-webhook",
          "protocol": "https",
          "host": ["splljyokmwsqgczjrvpo", "supabase", "co"],
          "path": ["functions", "v1", "abacatepay-webhook"]
        }
      }
    }
  ]
}
```

---

**Última atualização:** 20/12/2025
