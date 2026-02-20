# 📋 REALIZADO — Gestão ERP (vibe-coding)

> Gerado em: 2026-02-18
> Status: **TypeScript check em andamento** (restam erros em forms de funcionários, usuários e projetos — ver seção "Em progresso")

---

## ✅ INFRAESTRUTURA BASE

| Arquivo | Status |
|---|---|
| `prisma/schema.prisma` | ✅ Schema completo com todos os modelos |
| `prisma.config.ts` | ✅ Configuração Prisma 7 (sem url no schema) |
| `prisma/seed.ts` | ✅ Seed com usuário admin |
| `src/lib/prisma.ts` | ✅ Singleton com `@prisma/adapter-pg` |
| `src/lib/audit.ts` | ✅ Helper de auditoria (AuditLog) |
| `src/lib/format.ts` | ✅ Formatadores: currency, date, document |
| `src/types/index.ts` | ✅ ActionResult<T>, PaginatedResult<T>, SessionUser |
| `src/middleware.ts` | ✅ Proteção de rotas por sessão |
| `src/auth.ts` | ✅ NextAuth handlers |

**Stack configurada:**
- Next.js 16 + TypeScript + App Router
- PostgreSQL + Prisma 7 (`@prisma/adapter-pg`)
- NextAuth.js v5 beta (Credentials provider, JWT, 8h)
- shadcn/ui + Tailwind v4
- Zod v4 + react-hook-form v8

---

## ✅ FASE 1 — FUNDAÇÃO ESTRUTURAL

### 🔐 Autenticação
- ✅ Login (`src/app/(auth)/login/`)
- ✅ Recuperação de senha (`src/app/(auth)/recuperar-senha/`)
- ✅ Logout (via `src/domains/auth/actions.ts`)
- ✅ Middleware de proteção de rotas (`src/middleware.ts`)
- ✅ Controle de sessão (JWT, 8h)
- ✅ Config NextAuth (`src/domains/auth/config.ts`)

### 👥 Controle de Perfis / Permissões
- ✅ Roles: ADMIN, MANAGER, EMPLOYEE, VIEWER
- ✅ Hierarquia de permissões (`src/domains/auth/permissions.ts`)
- ✅ Sidebar com menu filtrado por role

### 👤 Usuários
- ✅ Domain: `src/domains/pessoas/usuarios/` (schemas, queries, actions)
- ✅ UI: listagem, novo, editar (`src/app/(dashboard)/pessoas/usuarios/`)
- ✅ CRUD completo + ativar/desativar + registro de último acesso

### 🧑 Funcionários
- ✅ Domain: `src/domains/pessoas/funcionarios/` (schemas, queries, actions)
- ✅ UI: listagem, novo, editar (`src/app/(dashboard)/pessoas/funcionarios/`)
- ✅ Permissões canPurchase / canWithdrawStock
- ✅ Vinculação usuário ↔ funcionário

### 🧾 Clientes
- ✅ Domain: `src/domains/pessoas/clientes/` (schemas, queries, actions)
- ✅ UI: listagem, novo, detalhe com histórico (`src/app/(dashboard)/pessoas/clientes/`)
- ✅ Campo de observações

### 📦 Catálogo de Produtos
- ✅ Domain: `src/domains/catalogo/produtos/` (schemas, queries, actions)
- ✅ UI: listagem, novo (`src/app/(dashboard)/catalogo/produtos/`)
- ✅ Categoria, unidade de medida, tipo (MATERIAL/TOOL), estoque mínimo, ativo/inativo

### 🛠 Catálogo de Serviços
- ✅ Domain: `src/domains/catalogo/servicos/` (schemas, queries, actions)
- ✅ UI: listagem, novo (`src/app/(dashboard)/catalogo/servicos/`)
- ✅ Valor base opcional, descrição padrão, ativo/inativo

---

## ✅ FASE 2 — COMERCIAL (ORÇAMENTOS)

### 📄 Orçamentos
- ✅ Domain: `src/domains/comercial/orcamentos/` (schemas, queries, actions, calculations, types)
- ✅ UI: listagem, novo, editar, detalhe (`src/app/(dashboard)/comercial/orcamentos/`)
- ✅ Criar / editar / excluir orçamento
- ✅ Selecionar cliente existente
- ✅ Buscar itens e serviços no catálogo

### 💰 Cálculos
- ✅ `src/domains/comercial/orcamentos/calculations.ts`
- ✅ Calcular total de itens
- ✅ Calcular total de serviços
- ✅ Aplicar 15% opcional (taxa nota fiscal)
- ✅ Calcular total geral
- ✅ Detectar orçamento com +30 dias (isQuoteOverdue)

### 🔄 Status
- ✅ Status: PENDING, APPROVED, PAID, CANCELLED
- ✅ Alteração manual de status
- ✅ Log de alteração de status (QuoteStatusLog)

### 📑 PDF / Relatórios
- ⚠️ PDF do orçamento — **NÃO IMPLEMENTADO** (pendente)
- ⚠️ QR Code Pix — **NÃO IMPLEMENTADO** (pendente)
- ⚠️ Relatório de inadimplentes — **NÃO IMPLEMENTADO** (pendente)

### 🔁 Conversão Orçamento → Projeto
- ⚠️ Converter orçamento pago em projeto — **NÃO IMPLEMENTADO** (pendente)

---

## ✅ FASE 3 — PROJETOS / CENTRO DE CUSTO

### 🏢 Projetos
- ✅ Domain: `src/domains/projetos/` (schemas, queries, actions, calculations)
- ✅ UI: listagem, novo, detalhe, fechar projeto (`src/app/(dashboard)/projetos/`)
- ✅ Criar projeto manualmente
- ✅ Associar cliente
- ✅ Definir receita total + meta de margem (60%)
- ✅ Encerrar projeto
- Status: ACTIVE, CLOSED, CANCELLED

### 💸 Despesas
- ✅ Registrar despesa manual (dialog no detalhe do projeto)
- ✅ Classificar tipo (MATERIAL, LABOR, TOOL, OTHER)
- ✅ Associar a projeto
- ✅ Histórico de despesas

### 👷 Mão de Obra
- ✅ Lançar diária de profissional no projeto
- ✅ Associar diária a projeto
- ✅ `createLaborEntrySchema` / `createLaborEntryAction`

### 📈 Margem
- ✅ `src/domains/projetos/calculations.ts`
- ✅ Calcular total de despesas
- ✅ Calcular margem / percentual de consumo
- ✅ Indicador visual (saudável/atenção/prejuízo)

---

## ✅ FASE 4 — COMPRAS

- ✅ Domain: `src/domains/compras/` (schemas, queries, actions)
- ✅ UI: listagem, nova compra (`src/app/(dashboard)/compras/`)
- ✅ Registrar compra com múltiplos itens
- ✅ Identificar comprador (funcionário)
- ✅ Fornecedor (opcional)
- ✅ Data e associação a projeto
- ✅ Gera despesa automática no projeto vinculado
- ✅ Gera entrada automática no estoque (StockEntry tipo PURCHASE)
- ✅ Gera lançamento no fluxo de caixa (PURCHASE_PAYABLE)
- ✅ Histórico de compras com filtros

---

## ✅ FASE 5 — ESTOQUE

- ✅ Domain: `src/domains/estoque/` (schemas, queries, actions)
- ✅ UI: `src/app/(dashboard)/estoque/` (tabs: Saldo/Entradas/Saídas/Ferramentas)

### 📥 Entradas
- ✅ Entrada manual (`createStockEntryAction`)
- ✅ Entrada automática via compra
- ✅ Registro de responsável
- ✅ Histórico de entradas por produto

### 📤 Saídas (Material)
- ✅ Registrar saída manual (`createStockExitAction`)
- ✅ Associar a projeto
- ✅ Histórico de saídas

### 🔁 Ferramentas
- ✅ Registrar empréstimo (`createToolLoanAction`)
- ✅ Associar a funcionário
- ✅ Registrar devolução (`returnToolAction`) — cria StockEntry tipo RETURN
- ✅ Controle de quantidade disponível (saldo = entradas - saídas - empréstimos ativos)

### ⚠️ Controle
- ✅ Estoque mínimo definido no produto
- ✅ Alerta visual estoque baixo (badge "Estoque Baixo" na tela)
- ✅ Banner de aviso no topo da página de estoque

---

## ✅ FASE 6 — FLUXO DE CAIXA

- ✅ Domain: `src/domains/financeiro/` (schemas, queries, actions, calculations)
- ✅ UI: `src/app/(dashboard)/financeiro/`

### 📥 A Receber
- ✅ Listar orçamentos aprovados não pagos
- ✅ Marcar como recebido (paidAt)

### 📤 A Pagar
- ✅ Listar compras (PURCHASE_PAYABLE)
- ✅ Listar mão de obra (LABOR_PAYABLE)
- ✅ Registrar contas externas (ExternalPayable)
- ✅ Informar vencimento
- ✅ Marcar como pago

### 📊 Visualizações
- ✅ Fluxo do mês (filtrado por período)
- ✅ Saldo consolidado
- ⚠️ Projeção futura — **parcial** (pendente detalhamento)

---

## ✅ FASE 7 — OPERAÇÃO / ALERTAS

- ✅ Domain: `src/domains/operacao/` (schemas, queries, actions)
- ✅ UI: `src/app/(dashboard)/operacao/`
- ✅ Criar alerta com prioridade (LOW/MEDIUM/HIGH/CRITICAL)
- ✅ Vincular a projeto, produto, profissional
- ✅ Status: ACTIVE / RESOLVED
- ✅ Listagem de alertas
- ⚠️ Tela operacional com alertas "piscando" — **animação pendente** (estrutura criada)
- ✅ Histórico de alertas

---

## ✅ FASE 8 — DASHBOARD ALLAN

- ✅ `src/domains/dashboard/queries.ts` — `getDashboardData()`
- ✅ `src/app/(dashboard)/dashboard/page.tsx` — Dashboard com dados reais

### 💰 Financeiro
- ✅ Entradas do mês
- ✅ Saídas do mês
- ✅ Saldo do mês
- ✅ Total a receber / a pagar

### 📈 Projetos
- ✅ Projetos ativos (contagem)
- ✅ Projetos recentes (lista com link)

### 📦 Estoque
- ✅ Alertas de estoque baixo (produtos abaixo do mínimo)

### 🚨 Operação
- ✅ Alertas do sistema (ACTIVE)

---

## ✅ SEGURANÇA / AUDITORIA (TRANSVERSAL)

- ✅ Soft delete em todos os modelos principais (`deletedAt`)
- ✅ `registeredById` / `createdById` em todos os registros
- ✅ `src/lib/audit.ts` — Helper de AuditLog pronto
- ✅ `AuditLog` model no Prisma

---

## 🔴 EM PROGRESSO — TypeScript fix

**Arquivos com erros restantes (mesmos padrões):**

### Problema: zodResolver + Zod v4 + react-hook-form v8 — union form pattern
Os forms que têm `createForm + updateForm` no mesmo componente causam erro de tipo quando usados como `const form = isEditing ? updateForm : createForm`. A solução é adicionar `as Resolver<T>` nos resolvers e/ou separar o JSX.

**Arquivos pendentes de fix:**
- `src/app/(dashboard)/pessoas/funcionarios/employee-form.tsx` — union form create/update
- `src/app/(dashboard)/pessoas/usuarios/user-form.tsx` — union form create/update
- `src/app/(dashboard)/projetos/novo/project-form.tsx` — z.number().default() mismatch
- `src/app/(dashboard)/projetos/[id]/add-expense-dialog.tsx` — z.coerce.date() mismatch
- `src/app/(dashboard)/projetos/[id]/add-labor-entry-dialog.tsx` — z.coerce.date() mismatch

**Causa raiz:** Zod v4 usa tipo de input diferente do output para `z.coerce.date()` e `.default()`. Fix: adicionar `as Resolver<InputType>` no resolver de cada `useForm`.

**Schemas já corrigidos:**
- `canPurchase/canWithdrawStock`: ainda têm `.default(false)` — remover
- `isActive` em usuários: ainda tem `.default(true)` — remover

---

## ❌ NÃO IMPLEMENTADO (fora do MVP atual)

- PDF do orçamento (layout + QR Code Pix)
- Relatório de inadimplentes (PDF)
- Conversão automática orçamento → projeto
- Tela operacional com alertas animados ("piscando")
- Testes unitários (todos os domínios)
- Dashboard por cliente
- Exportação Excel
- Notificações
- Integração Pix automática

---

## 📂 ESTRUTURA DE DOMÍNIOS CRIADOS

```
src/domains/
  auth/           config, schemas, actions, permissions
  catalogo/
    produtos/     schemas, queries, actions
    servicos/     schemas, queries, actions
  comercial/
    orcamentos/   schemas, queries, actions, calculations, types
  compras/        schemas, queries, actions
  dashboard/      queries
  estoque/        schemas, queries, actions
  financeiro/     schemas, queries, actions, calculations
  operacao/       schemas, queries, actions
  pessoas/
    clientes/     schemas, queries, actions
    funcionarios/ schemas, queries, actions
    usuarios/     schemas, queries, actions
  projetos/       schemas, queries, actions, calculations
```

---

## ⚙️ COMO RODAR

```bash
# Node via NVM
export PATH="/home/victor/.var/app/com.vscodium.codium/config/nvm/versions/node/v24.13.1/bin:$PATH"

# Instalar dependências
npm install

# TypeScript check
node node_modules/.bin/tsc --noEmit

# Dev server
npm run dev

# Migrations (Prisma 7)
npx prisma migrate dev

# Seed
npx prisma db seed
```

---

## 🎯 PRÓXIMOS PASSOS (na ordem)

1. **Finalizar TypeScript fix** nos 5 arquivos pendentes (employee-form, user-form, project-form, add-expense-dialog, add-labor-entry-dialog) — padrão: `as Resolver<T>` + remover `.default()` dos schemas de funcionário/usuário
2. **PDF do orçamento** — instalar `@react-pdf/renderer` ou `puppeteer`, criar layout, QR Code Pix
3. **Conversão orçamento → projeto** — action no detalhe do orçamento (status PAID)
4. **Testes unitários** — começar pelos domains: calculations, schemas validation, actions mock
5. **Animação alertas** — CSS pulse na tela de operação
