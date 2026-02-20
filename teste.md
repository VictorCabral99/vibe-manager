tudo começa com um login, usuarios com perfis e visualizações especificas. primeira funcionalidade: o Allan, que é o dono do sistema tem hoje um sistema que eu fiz, mas que quero reagregar nesse novo sistema geral. Ele monta um orçamento, coloca uma descricao dos itens, valor unitario e quantidade. coloca os serviços e o valor de cada serviço e no fim pode adicionar 15% (para geração de nota fiscal) no total do serviço como um todo. depois de criar isso, ele tem a opção e editar, gerar um pdf desse orçamento e mandar pro cliente. nesse pdf tem o QR Code Pix, e as informações de conta corrente, por cliente gerar o pagamento. ele lista esses orçamentos com o nome do projeto e o nome do cliente que pediu, e muda se o orçamento está pendente aprovação do cliente pq dai ele ajusta se necessario, pendente pagamento, se o cliente já aprovou e pago, para o cliente que já pagou. e se ele gerou o orçamento faz mais de 30 dias, ele deixa em vermelho para visualizar mais facil e cobrar o cliente, do que for preciso. também pode gerar um relatório, na tela de listagem, que lista e gera um pdf para controle dele, daqueles que ainda não pagaram. 

depois que esse cliente aprova esse orçamento, ele vira um projeto. para o projeto (que ele também pode criar um pela interface de projetos). 60% do valor total do projeto é voltado para custos, pelo menos é o que ele quer controlar. entao esses orçamentos pagos viram centros de custo. Dai considerando os itens, tem uma outra interface só para o perfil comprador, onde os compradores dele vão em lojas, comprar itens e registram no sistema. item, quantidade, valor e podem ou não relacionar esse item a algum projeto, eles sabendo para qual projeto, podem relacionar. com isso vai sendo criado despesas relacionadas aos projetos/centros de custo. e ele pode controlar se aquele projeto está dando lucro ou prejuizo, importante também que ele possa registrar despesas de mão de obra, não só itens, e relacionar diárias de determinados profissionais (marceneiros, ferreiros, soldadores, etc) para cada projeto/centro de custo. continue apenas anotando

agora vem mais um ponto, ele também terá um sistema para controle de estoque, muitas coisas que ele já tem, vão ficar registradas e catalogadas, e todas as compras novas também serão adicionadas nesse estoque que terá um usuário para controle. esse usuário irá registrar entradas de materiais e ferramentas no estoque e deixar registrado. para retirada, se for ferramenta, precisa ter uma devolução no futuro, então é meio que um emprestimos das ferramentas, um total de ferramentas e quantas disponiveis, já para materias, como pregos, meio que só sai e oq sobra volta, mas dai pode ser só uma nova adição. se algum item estiver pouco no estoque, deve haver um aviso sobre o estoque dele.

por fim teremos mais 2, 
1 é uma tela bem grande que ficará na operação, onde o allan poderá adicionar "alertas" para que profissionais especificos atuem em prioridade para determinado item de determinado projeto. então teremos os projetos listados e um alerta vai piscar para profissionais especificos agilizarem tarefas a pedido do que o alan mandar. 
e por fim, para esses projetos entrando, e essas despesas. será necessário ter um controle de fluxo de caixa. oq ele precisa pagar e receber no mês e no dia atual, em questão

isso sem contar que para os orçamentos, é feito um cadastro dos clientes, ele tem um cadastro de funcionarios, pq cada um vai ter um perfil e ser registrado quando fizer uma compra ou pegar algo do estoque. com o estoque, acho que o catalogo de produtos/serviços é necessário, e servir como busca na hora da montagem dos orçamentos, como opções durante a escrita dele. e ainda uma tela para o allan com seus dashboards

considere construir os testes unitarios para cada funcionalidade.

🏗 FASE 1 — FUNDAÇÃO ESTRUTURAL
🔐 Autenticação

 Sistema de login

 Controle de sessão

 Logout

 Recuperação de senha

 Middleware de proteção de rotas

👥 Controle de Perfis

 Criar estrutura de Roles

 Definir permissões por role

 Restringir telas por perfil

 Restringir ações por perfil

👤 Usuários

 CRUD de usuários

 Vincular usuário a funcionário

 Ativar / desativar usuário

 Registro de último acesso

🧑 Funcionários

 CRUD de funcionários

 Definir função/cargo

 Associar função operacional

 Marcar se pode registrar compras

 Marcar se pode retirar estoque

🧾 Clientes

 CRUD de clientes

 Histórico de orçamentos por cliente

 Histórico de projetos por cliente

 Campo de observações

📦 Catálogo de Produtos

 CRUD de produtos

 Categoria

 Unidade de medida

 Definir tipo (material / ferramenta)

 Definir estoque mínimo

 Campo ativo/inativo

🛠 Catálogo de Serviços

 CRUD de serviços

 Valor base opcional

 Descrição padrão

💼 FASE 2 — COMERCIAL (ORÇAMENTOS)
📄 Orçamentos

 Criar orçamento

 Editar orçamento

 Excluir orçamento

 Selecionar cliente existente

 Buscar itens no catálogo

 Buscar serviços no catálogo

💰 Cálculos

 Calcular total de itens

 Calcular total de serviços

 Aplicar 15% opcional

 Calcular total geral

🔄 Status

 Pendente aprovação

 Aprovado

 Pago

 Indicador +30 dias

 Alteração manual de status

 Log de alteração de status

📑 PDF Cliente

 Layout PDF

 Inserir dados do cliente

 Inserir itens

 Inserir serviços

 Inserir totais

 Inserir QR Code Pix

 Inserir dados bancários

📊 Relatórios

 Relatório de orçamentos pendentes

 Relatório de inadimplentes

 Exportação PDF

🔁 Conversão

 Converter orçamento pago em projeto

 Bloquear edição após conversão (decidir regra)

🏗 FASE 3 — PROJETOS / CENTRO DE CUSTO
🏢 Projetos

 Criar projeto manualmente

 Criar projeto via conversão

 Associar cliente

 Definir receita total

 Definir meta 60%

 Encerrar projeto

💸 Despesas

 Registrar despesa manual

 Classificar tipo (material / mão de obra / outro)

 Associar a projeto

 Histórico de despesas

👷 Mão de Obra

 Cadastro de profissionais

 Valor de diária

 Registrar diária

 Associar diária a projeto

 Histórico por profissional

📈 Margem

 Calcular total de despesas

 Calcular margem

 Calcular percentual de consumo

 Indicador visual (saudável / atenção / prejuízo)

🛒 FASE 4 — COMPRAS

 Registrar compra

 Identificar comprador

 Informar fornecedor (opcional)

 Informar data

 Associar a projeto (opcional)

 Gerar despesa automática

 Gerar entrada automática no estoque

 Histórico de compras

 Filtro por comprador

 Filtro por período

📦 FASE 5 — ESTOQUE
📥 Entradas

 Registrar entrada manual

 Entrada automática via compra

 Registrar responsável

 Histórico de entradas

📤 Saídas (Material)

 Registrar saída

 Associar a projeto

 Atualizar quantidade

 Histórico de saída

🔁 Ferramentas

 Registrar empréstimo

 Associar a funcionário

 Associar a projeto

 Registrar devolução

 Controlar quantidade disponível

 Indicador de ferramenta não devolvida

⚠️ Controle

 Definir estoque mínimo

 Alerta visual estoque baixo

 Tela de itens críticos

💰 FASE 6 — FLUXO DE CAIXA
📥 A Receber

 Listar orçamentos aprovados não pagos

 Informar previsão de recebimento

 Marcar como recebido

📤 A Pagar

 Listar compras

 Listar mão de obra

 Registrar contas externas (aluguel, etc)

 Informar vencimento

 Marcar como pago

📊 Visualizações

 Fluxo do dia

 Fluxo da semana

 Fluxo do mês

 Projeção futura

 Saldo consolidado

🚨 FASE 7 — OPERAÇÃO / ALERTAS

 Criar alerta

 Vincular a projeto

 Vincular a item específico

 Vincular a profissionais

 Definir prioridade

 Status do alerta (ativo / concluído)

 Tela operacional com alertas piscando

 Histórico de alertas

📊 FASE 8 — DASHBOARD ALLAN
💰 Financeiro

 Receita do mês

 Total a receber

 Total a pagar

 Saldo projetado

📈 Projetos

 Projetos ativos

 Projetos com prejuízo

 Ranking de lucratividade

 Projetos próximos da meta 60%

📦 Estoque

 Itens críticos

 Ferramentas pendentes devolução

🚨 Operação

 Alertas ativos

 Tarefas prioritárias

🔒 Segurança & Auditoria (FASE TRANSVERSAL)

 Log de ações importantes

 Log de alterações financeiras

 Registro de responsável em toda ação

 Controle de exclusão (soft delete)

 Backup periódico

🧠 Melhorias Futuras (Não MVP)

 Dashboard por cliente

 Histórico financeiro por ano

 Exportação Excel

 Sistema de notificações

 Permissões granulares por ação

 Integração Pix automática

 Centro de relatórios avançado

🎯 REGRA DE OURO

Só marque uma fase como concluída quando:

O fluxo estiver fechado

As regras estiverem consolidadas

Não depender de outro módulo

Estiver estável