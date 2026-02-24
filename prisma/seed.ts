import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const users = [
  { email: "admin@vibe.com",        name: "Administrador",  password: "Admin@123",    role: "ADMIN"    as const },
  { email: "gerente@vibe.com",      name: "Carlos Mendes",  password: "Manager@123",  role: "MANAGER"  as const },
  { email: "funcionario@vibe.com",  name: "Lucas Souza",    password: "Employee@123", role: "EMPLOYEE" as const },
  { email: "visualizador@vibe.com", name: "Visualizador",   password: "Viewer@123",   role: "VIEWER"   as const },
]

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

async function main() {
  console.log("Iniciando seed...")

  // ─── USUÁRIOS ───────────────────────────────────────────────────────────────
  let adminId = ""
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10)
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { email: user.email, name: user.name, password: hashed, role: user.role, isActive: true },
    })
    if (user.role === "ADMIN") adminId = created.id
    console.log(`✓ ${created.role.padEnd(8)} — ${created.email}  (senha: ${user.password})`)
  }

  // Dados de demo — ignora se já existirem clientes
  const existingClients = await prisma.client.count()
  if (existingClients > 0) {
    console.log("\nDados de demonstração já existem. Pulando...")
    return
  }

  console.log("\nCriando dados de demonstração...")

  // ─── FUNCIONÁRIOS ────────────────────────────────────────────────────────────
  const managerUser = await prisma.user.findUniqueOrThrow({ where: { email: "gerente@vibe.com" } })
  const employeeUser = await prisma.user.findUniqueOrThrow({ where: { email: "funcionario@vibe.com" } })

  const manager = await prisma.employee.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      name: "Carlos Mendes",
      jobTitle: "Gerente de Obras",
      canPurchase: true,
      canWithdrawStock: true,
      phone: "(11) 98765-4321",
      isActive: true,
    },
  })

  const worker = await prisma.employee.upsert({
    where: { userId: employeeUser.id },
    update: {},
    create: {
      userId: employeeUser.id,
      name: "Lucas Souza",
      jobTitle: "Encarregado de Obras",
      canPurchase: true,
      canWithdrawStock: true,
      phone: "(11) 97654-3210",
      isActive: true,
    },
  })

  // ─── CLIENTES ────────────────────────────────────────────────────────────────
  const clients = await prisma.client.createManyAndReturn({
    data: [
      {
        name: "Residências Monteiro",
        email: "contato@monteiro.com.br",
        phone: "(11) 3256-7890",
        document: "12.345.678/0001-90",
        address: "Av. Paulista, 1500, São Paulo - SP",
        notes: "Cliente corporativo de alto volume. Obras residenciais de médio-alto padrão.",
      },
      {
        name: "Construtora Alfa Ltda",
        email: "obras@construtoraalfa.com.br",
        phone: "(11) 2345-6789",
        document: "98.765.432/0001-10",
        address: "Rua das Flores, 200, São Paulo - SP",
      },
      {
        name: "João Carlos Ferreira",
        email: "joao.ferreira@email.com",
        phone: "(11) 99123-4567",
        document: "123.456.789-00",
        address: "Rua Bela Vista, 45, Campinas - SP",
      },
      {
        name: "Maria das Graças Lima",
        email: "maria.lima@email.com",
        phone: "(11) 98234-5678",
        document: "234.567.890-11",
        address: "Rua das Palmeiras, 78, Santo André - SP",
      },
      {
        name: "Empresa XYZ Tecnologia LTDA",
        email: "facilities@empresaxyz.com.br",
        phone: "(11) 4567-8901",
        document: "45.678.901/0001-23",
        address: "Av. Brasil, 900, São Bernardo do Campo - SP",
        notes: "Reforma de escritórios corporativos. Contato: Dra. Ana Beatriz.",
      },
      {
        name: "Antônio Lima Santos",
        email: "antonio.santos@email.com",
        phone: "(11) 97345-6789",
        document: "345.678.901-22",
        address: "Rua Ipê Amarelo, 12, Guarulhos - SP",
      },
      {
        name: "Incorporadora Bela Vista",
        email: "projetos@belavista.com.br",
        phone: "(11) 3456-7890",
        document: "67.890.123/0001-45",
        address: "Rua Augusta, 350, São Paulo - SP",
      },
      {
        name: "Hotel Grand Palace",
        email: "manutencao@grandpalace.com.br",
        phone: "(11) 5678-9012",
        document: "78.901.234/0001-56",
        address: "Av. Atlântica, 2000, Guarujá - SP",
        notes: "Grande contrato de pintura de fachada concluído. Excelente pagador.",
      },
    ],
  })

  // ─── PRODUTOS ────────────────────────────────────────────────────────────────
  const products = await prisma.product.createManyAndReturn({
    data: [
      // Materiais (índices 0–13)
      { name: "Cimento CP-II 50kg",            category: "Materiais básicos",      unit: "KG",    type: "MATERIAL", minimumStock: 500,  isActive: true, description: "Cimento Portland composto CP-II" },
      { name: "Areia grossa lavada",             category: "Materiais básicos",      unit: "KG",    type: "MATERIAL", minimumStock: 1000, isActive: true },
      { name: "Brita 1 (pedra graduada)",        category: "Materiais básicos",      unit: "KG",    type: "MATERIAL", minimumStock: 800,  isActive: true },
      { name: "Tijolo cerâmico 9x14x19",         category: "Alvenaria",              unit: "UNIT",  type: "MATERIAL", minimumStock: 2000, isActive: true },
      { name: "Tinta acrílica branca 18L",       category: "Pintura",                unit: "UNIT",  type: "MATERIAL", minimumStock: 20,   isActive: true, description: "Tinta látex acrílica premium" },
      { name: "Piso porcelanato 60x60cm",        category: "Revestimentos",          unit: "UNIT",  type: "MATERIAL", minimumStock: 50,   isActive: true, description: "Porcelanato polido — caixa c/ 2,16m²" },
      { name: "Tubo PVC esgoto 100mm (6m)",      category: "Hidráulica",             unit: "UNIT",  type: "MATERIAL", minimumStock: 15,   isActive: true },
      { name: "Fio elétrico 2.5mm (rolo 100m)",  category: "Elétrica",               unit: "UNIT",  type: "MATERIAL", minimumStock: 10,   isActive: true },
      { name: "Gesso em pó 20kg",                category: "Acabamento",             unit: "KG",    type: "MATERIAL", minimumStock: 200,  isActive: true },
      { name: "Vergalhão CA-50 10mm",            category: "Estrutura",              unit: "METER", type: "MATERIAL", minimumStock: 100,  isActive: true },
      { name: "Cal hidratada CH-III 20kg",       category: "Materiais básicos",      unit: "UNIT",  type: "MATERIAL", minimumStock: 30,   isActive: true },
      { name: "Impermeabilizante acrílico 5L",   category: "Acabamento",             unit: "UNIT",  type: "MATERIAL", minimumStock: 10,   isActive: true },
      { name: "Rejunte cinza médio 1kg",         category: "Revestimentos",          unit: "UNIT",  type: "MATERIAL", minimumStock: 50,   isActive: true },
      { name: "Argamassa colante ACIII 20kg",    category: "Revestimentos",          unit: "UNIT",  type: "MATERIAL", minimumStock: 40,   isActive: true },
      // Ferramentas (índices 14–18)
      { name: "Betoneira 400L",                  category: "Equipamentos",           unit: "UNIT",  type: "TOOL",     minimumStock: 1,    isActive: true },
      { name: "Furadeira de impacto 800W",       category: "Ferramentas elétricas",  unit: "UNIT",  type: "TOOL",     minimumStock: 2,    isActive: true },
      { name: "Andaime metálico (trecho 2m)",    category: "Andaimes",               unit: "UNIT",  type: "TOOL",     minimumStock: 5,    isActive: true },
      { name: "Serra circular 7¼\"",             category: "Ferramentas elétricas",  unit: "UNIT",  type: "TOOL",     minimumStock: 2,    isActive: true },
      { name: "Nível a laser 30m",               category: "Ferramentas de medição", unit: "UNIT",  type: "TOOL",     minimumStock: 1,    isActive: true },
    ],
  })

  // ─── SERVIÇOS ────────────────────────────────────────────────────────────────
  const services = await prisma.service.createManyAndReturn({
    data: [
      { name: "Alvenaria",                  description: "Execução de paredes em tijolo cerâmico — valor por m²",       basePrice: 85.00,  isActive: true },
      { name: "Pintura interna",            description: "Pintura de paredes e teto com tinta acrílica — por m²",       basePrice: 18.00,  isActive: true },
      { name: "Pintura externa (fachada)",  description: "Pintura de fachada com tinta premium — por m²",               basePrice: 28.00,  isActive: true },
      { name: "Instalação elétrica",        description: "Instalação e manutenção de circuitos elétricos — por ponto",  basePrice: 120.00, isActive: true },
      { name: "Instalação hidráulica",      description: "Execução de redes de água fria e esgoto — por ponto",         basePrice: 110.00, isActive: true },
      { name: "Revestimento cerâmico",      description: "Assentamento de piso e azulejo — por m²",                     basePrice: 65.00,  isActive: true },
      { name: "Reboco e emboço",            description: "Aplicação de reboco e emboço em paredes — por m²",            basePrice: 45.00,  isActive: true },
      { name: "Demolição controlada",       description: "Demolição com retirada de entulho — por m²",                  basePrice: 95.00,  isActive: true },
      { name: "Impermeabilização",          description: "Impermeabilização de laje, terraço ou área molhada — por m²", basePrice: 75.00,  isActive: true },
      { name: "Drywall",                    description: "Instalação de divisórias em drywall — por m²",                basePrice: 110.00, isActive: true },
    ],
  })

  // ─── PROFISSIONAIS DE MÃO DE OBRA ────────────────────────────────────────────
  const pros = await prisma.laborProfessional.createManyAndReturn({
    data: [
      { name: "José Pereira (Pedreiro)",       phone: "(11) 99001-1122", dailyRate: 250.00, isActive: true },
      { name: "Carlos Eduardo (Pintor)",        phone: "(11) 99002-3344", dailyRate: 220.00, isActive: true },
      { name: "Roberto Silva (Eletricista)",    phone: "(11) 99003-5566", dailyRate: 300.00, isActive: true },
      { name: "Anderson Gomes (Encanador)",     phone: "(11) 99004-7788", dailyRate: 280.00, isActive: true },
      { name: "Fernando Alves (Servente)",      phone: "(11) 99005-9900", dailyRate: 180.00, isActive: true },
    ],
  })

  // ─── ORÇAMENTOS ──────────────────────────────────────────────────────────────

  // ORC-1: Residências Monteiro — APPROVED
  const quote1 = await prisma.quote.create({
    data: {
      clientId:    clients[0].id,
      status:      "APPROVED",
      applyFee:    false,
      notes:       "Reforma completa — 3 pavimentos. Aprovado em reunião presencial.",
      createdById: adminId,
      createdAt:   daysAgo(45),
      items: {
        create: [
          { productId: products[3].id,  quantity: 3000,  unitPrice: 1.20,  total: 3600.00 },
          { productId: products[0].id,  quantity: 500,   unitPrice: 0.80,  total: 400.00  },
          { productId: products[5].id,  quantity: 200,   unitPrice: 42.00, total: 8400.00 },
          { productId: products[13].id, quantity: 80,    unitPrice: 38.00, total: 3040.00 },
        ],
      },
      services: {
        create: [
          { serviceId: services[0].id, quantity: 60,  unitPrice: 85.00,  total: 5100.00,  description: "Paredes divisórias — novos quartos" },
          { serviceId: services[5].id, quantity: 200, unitPrice: 65.00,  total: 13000.00, description: "Piso e azulejo em todos os banheiros" },
          { serviceId: services[1].id, quantity: 350, unitPrice: 18.00,  total: 6300.00,  description: "Pintura completa de todos os cômodos" },
          { serviceId: services[3].id, quantity: 25,  unitPrice: 120.00, total: 3000.00,  description: "Pontos elétricos novos" },
        ],
      },
      statusLogs: {
        create: [
          { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, notes: "Orçamento criado",            createdAt: daysAgo(45) },
          { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, notes: "Aprovado pelo cliente",       createdAt: daysAgo(40) },
        ],
      },
    },
  })

  // ORC-2: Empresa XYZ — APPROVED (com taxa)
  const quote2 = await prisma.quote.create({
    data: {
      clientId:    clients[4].id,
      status:      "APPROVED",
      applyFee:    true,
      notes:       "Reforma corporativa — 2 salas + recepção. Taxa de 15% aplicada.",
      createdById: adminId,
      createdAt:   daysAgo(30),
      items: {
        create: [
          { productId: products[4].id, quantity: 15,  unitPrice: 89.90, total: 1348.50 },
          { productId: products[8].id, quantity: 100, unitPrice: 0.75,  total: 75.00   },
          { productId: products[5].id, quantity: 40,  unitPrice: 42.00, total: 1680.00 },
        ],
      },
      services: {
        create: [
          { serviceId: services[1].id, quantity: 160, unitPrice: 18.00,  total: 2880.00, description: "Pintura de todas as salas e recepção" },
          { serviceId: services[6].id, quantity: 80,  unitPrice: 45.00,  total: 3600.00, description: "Reboco em paredes danificadas" },
          { serviceId: services[9].id, quantity: 30,  unitPrice: 110.00, total: 3300.00, description: "Divisórias em drywall" },
        ],
      },
      statusLogs: {
        create: [
          { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(30) },
          { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, notes: "Aprovado via WhatsApp", createdAt: daysAgo(25) },
        ],
      },
    },
  })

  // ORC-3: João Ferreira — PENDING
  const quote3 = await prisma.quote.create({
    data: {
      clientId:    clients[2].id,
      status:      "PENDING",
      applyFee:    false,
      notes:       "Reforma de banheiro e cozinha. Aguardando retorno do cliente.",
      createdById: adminId,
      createdAt:   daysAgo(8),
      items: {
        create: [
          { productId: products[5].id,  quantity: 25, unitPrice: 42.00, total: 1050.00 },
          { productId: products[4].id,  quantity: 3,  unitPrice: 89.90, total: 269.70  },
          { productId: products[12].id, quantity: 15, unitPrice: 4.50,  total: 67.50   },
        ],
      },
      services: {
        create: [
          { serviceId: services[4].id, quantity: 8,  unitPrice: 110.00, total: 880.00,  description: "Troca de pontos hidráulicos" },
          { serviceId: services[5].id, quantity: 25, unitPrice: 65.00,  total: 1625.00, description: "Piso e azulejo — banheiro + cozinha" },
        ],
      },
      statusLogs: {
        create: [
          { fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(8) },
        ],
      },
    },
  })

  // ORC-4: Maria das Graças — PENDING (recente)
  const quote4 = await prisma.quote.create({
    data: {
      clientId:    clients[3].id,
      status:      "PENDING",
      applyFee:    false,
      notes:       "Ampliação — construção de suíte master.",
      createdById: adminId,
      createdAt:   daysAgo(3),
      items: {
        create: [
          { productId: products[3].id, quantity: 800, unitPrice: 1.20,  total: 960.00  },
          { productId: products[0].id, quantity: 200, unitPrice: 0.80,  total: 160.00  },
          { productId: products[9].id, quantity: 50,  unitPrice: 12.00, total: 600.00  },
        ],
      },
      services: {
        create: [
          { serviceId: services[0].id, quantity: 30, unitPrice: 85.00,  total: 2550.00, description: "Alvenaria da nova suíte" },
          { serviceId: services[3].id, quantity: 6,  unitPrice: 120.00, total: 720.00,  description: "Pontos elétricos do quarto" },
        ],
      },
      statusLogs: {
        create: [
          { fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(3) },
        ],
      },
    },
  })

  // ORC-5: Hotel Grand Palace — PAID
  const quote5 = await prisma.quote.create({
    data: {
      clientId:    clients[7].id,
      status:      "PAID",
      applyFee:    false,
      notes:       "Pintura de fachada e áreas comuns. Pago integralmente.",
      createdById: adminId,
      createdAt:   daysAgo(90),
      items: {
        create: [
          { productId: products[4].id,  quantity: 60, unitPrice: 89.90, total: 5394.00 },
          { productId: products[11].id, quantity: 20, unitPrice: 45.00, total: 900.00  },
        ],
      },
      services: {
        create: [
          { serviceId: services[2].id, quantity: 800, unitPrice: 28.00, total: 22400.00, description: "Fachada completa do hotel" },
          { serviceId: services[1].id, quantity: 500, unitPrice: 18.00, total: 9000.00,  description: "Áreas comuns e recepção" },
          { serviceId: services[8].id, quantity: 120, unitPrice: 75.00, total: 9000.00,  description: "Impermeabilização da cobertura" },
        ],
      },
      statusLogs: {
        create: [
          { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(90) },
          { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(85) },
          { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pago via transferência bancária", createdAt: daysAgo(58) },
        ],
      },
    },
  })

  // ORC-6: Antônio Lima — CANCELLED
  const quote6 = await prisma.quote.create({
    data: {
      clientId:    clients[5].id,
      status:      "CANCELLED",
      applyFee:    false,
      notes:       "Cliente cancelou por restrições financeiras.",
      createdById: adminId,
      createdAt:   daysAgo(20),
      items: {
        create: [
          { productId: products[3].id, quantity: 400, unitPrice: 1.20, total: 480.00 },
        ],
      },
      services: {
        create: [
          { serviceId: services[0].id, quantity: 15, unitPrice: 85.00, total: 1275.00, description: "Alvenaria quarto adicional" },
        ],
      },
      statusLogs: {
        create: [
          { fromStatus: null,       toStatus: "PENDING",   changedById: adminId, createdAt: daysAgo(20) },
          { fromStatus: "PENDING",  toStatus: "CANCELLED", changedById: adminId, notes: "Cancelado a pedido do cliente", createdAt: daysAgo(12) },
        ],
      },
    },
  })

  // Evitar lint warning em variáveis não usadas diretamente abaixo
  void quote3
  void quote4
  void quote6

  // ─── PROJETOS ────────────────────────────────────────────────────────────────
  const project1 = await prisma.project.create({
    data: {
      name:         "Residência Monteiro — Reforma Completa",
      clientId:     clients[0].id,
      quoteId:      quote1.id,
      totalRevenue: 42840.00,
      targetMargin: 0.35,
      status:       "ACTIVE",
      notes:        "Obra em andamento. Prazo total: 4 meses. Início: fase de alvenaria.",
      createdById:  adminId,
      startedAt:    daysAgo(40),
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name:         "Empresa XYZ — Reforma Corporativa",
      clientId:     clients[4].id,
      quoteId:      quote2.id,
      totalRevenue: 15836.33,
      targetMargin: 0.40,
      status:       "ACTIVE",
      notes:        "Reforma de escritório corporativo — 2 salas e recepção.",
      createdById:  adminId,
      startedAt:    daysAgo(22),
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name:         "Hotel Grand Palace — Fachada e Áreas Comuns",
      clientId:     clients[7].id,
      quoteId:      quote5.id,
      totalRevenue: 46694.00,
      targetMargin: 0.30,
      status:       "CLOSED",
      notes:        "Projeto concluído com sucesso. Pagamento integral recebido.",
      createdById:  adminId,
      startedAt:    daysAgo(85),
      closedAt:     daysAgo(55),
    },
  })

  // ─── DESPESAS DE PROJETO ─────────────────────────────────────────────────────
  await prisma.projectExpense.createMany({
    data: [
      { projectId: project1.id, type: "MATERIAL", description: "Tijolos cerâmicos — lote inicial",   amount: 3600.00, date: daysAgo(38), registeredById: adminId },
      { projectId: project1.id, type: "MATERIAL", description: "Cimento e areia — fundação",          amount: 1200.00, date: daysAgo(35), registeredById: adminId },
      { projectId: project1.id, type: "LABOR",    description: "Mão de obra pedreiro — semana 1",     amount: 1250.00, date: daysAgo(33), registeredById: adminId },
      { projectId: project1.id, type: "MATERIAL", description: "Piso porcelanato 60x60",              amount: 8400.00, date: daysAgo(20), registeredById: adminId },
      { projectId: project1.id, type: "LABOR",    description: "Pintor — 3 dias pavimento 1",         amount: 660.00,  date: daysAgo(12), registeredById: adminId },
      { projectId: project1.id, type: "OTHER",    description: "Frete de materiais",                  amount: 380.00,  date: daysAgo(37), registeredById: adminId },
      { projectId: project2.id, type: "MATERIAL", description: "Tintas e massas — escritório",        amount: 1423.50, date: daysAgo(20), registeredById: adminId },
      { projectId: project2.id, type: "LABOR",    description: "Pintor — 5 dias",                     amount: 1100.00, date: daysAgo(15), registeredById: adminId },
      { projectId: project2.id, type: "MATERIAL", description: "Piso escritório",                     amount: 1680.00, date: daysAgo(18), registeredById: adminId },
      { projectId: project3.id, type: "MATERIAL", description: "Tintas fachada hotel",                amount: 5394.00, date: daysAgo(80), registeredById: adminId },
      { projectId: project3.id, type: "LABOR",    description: "Equipe de pintura — 15 dias",         amount: 9900.00, date: daysAgo(75), registeredById: adminId },
      { projectId: project3.id, type: "OTHER",    description: "Aluguel de andaimes — 30 dias",       amount: 4500.00, date: daysAgo(70), registeredById: adminId },
      { projectId: project3.id, type: "MATERIAL", description: "Impermeabilizante cobertura",         amount: 900.00,  date: daysAgo(65), registeredById: adminId },
    ],
  })

  // ─── MÃO DE OBRA ─────────────────────────────────────────────────────────────
  await prisma.laborEntry.createMany({
    data: [
      { professionalId: pros[0].id, projectId: project1.id, date: daysAgo(38), dailyRate: 250, quantity: 5,  total: 1250, description: "Alvenaria — paredes divisórias pav. 1", registeredById: adminId },
      { professionalId: pros[0].id, projectId: project1.id, date: daysAgo(30), dailyRate: 250, quantity: 5,  total: 1250, description: "Alvenaria — pav. 2",                   registeredById: adminId },
      { professionalId: pros[0].id, projectId: project1.id, date: daysAgo(22), dailyRate: 250, quantity: 5,  total: 1250, description: "Alvenaria — pav. 3",                   registeredById: adminId },
      { professionalId: pros[1].id, projectId: project1.id, date: daysAgo(15), dailyRate: 220, quantity: 3,  total: 660,  description: "Pintura interna — pav. 1",             registeredById: adminId },
      { professionalId: pros[1].id, projectId: project2.id, date: daysAgo(18), dailyRate: 220, quantity: 5,  total: 1100, description: "Pintura escritório completo",          registeredById: adminId },
      { professionalId: pros[2].id, projectId: project1.id, date: daysAgo(20), dailyRate: 300, quantity: 2,  total: 600,  description: "Instalação elétrica — salas",          registeredById: adminId },
      { professionalId: pros[3].id, projectId: project1.id, date: daysAgo(12), dailyRate: 280, quantity: 3,  total: 840,  description: "Hidráulica — banheiros pav. 1",        registeredById: adminId },
      { professionalId: pros[1].id, projectId: project3.id, date: daysAgo(78), dailyRate: 220, quantity: 15, total: 3300, description: "Pintura fachada hotel — lote 1",       registeredById: adminId },
      { professionalId: pros[0].id, projectId: project3.id, date: daysAgo(70), dailyRate: 250, quantity: 12, total: 3000, description: "Serviços auxiliares fachada hotel",    registeredById: adminId },
      { professionalId: pros[4].id, projectId: project3.id, date: daysAgo(65), dailyRate: 180, quantity: 10, total: 1800, description: "Limpeza e acabamento hotel",           registeredById: adminId },
    ],
  })

  // ─── COMPRAS ─────────────────────────────────────────────────────────────────
  const purchase1 = await prisma.purchase.create({
    data: {
      buyerId:     manager.id,
      supplier:    "Depósito Central Construções",
      date:        daysAgo(36),
      projectId:   project1.id,
      totalAmount: 4800.00,
      notes:       "Materiais para início da obra — pagamento à vista com 3% desconto",
      items: {
        create: [
          { productId: products[3].id, quantity: 3000, unitPrice: 1.20, total: 3600.00 },
          { productId: products[0].id, quantity: 500,  unitPrice: 0.80, total: 400.00  },
          { productId: products[1].id, quantity: 1000, unitPrice: 0.80, total: 800.00  },
        ],
      },
    },
  })

  const purchase2 = await prisma.purchase.create({
    data: {
      buyerId:     manager.id,
      supplier:    "Loja Tintas & Cores",
      date:        daysAgo(19),
      projectId:   project2.id,
      totalAmount: 3103.50,
      notes:       "Tintas, gesso e piso para reforma escritório XYZ",
      items: {
        create: [
          { productId: products[4].id, quantity: 15,  unitPrice: 89.90, total: 1348.50 },
          { productId: products[8].id, quantity: 100, unitPrice: 0.75,  total: 75.00   },
          { productId: products[5].id, quantity: 40,  unitPrice: 42.00, total: 1680.00 },
        ],
      },
    },
  })

  const purchase3 = await prisma.purchase.create({
    data: {
      buyerId:     worker.id,
      supplier:    "Elétrica Souza Materiais",
      date:        daysAgo(24),
      projectId:   project1.id,
      totalAmount: 1390.00,
      notes:       "Material elétrico pav. 2 — fio e disjuntores",
      items: {
        create: [
          { productId: products[7].id, quantity: 10, unitPrice: 139.00, total: 1390.00 },
        ],
      },
    },
  })

  const purchase4 = await prisma.purchase.create({
    data: {
      buyerId:     manager.id,
      supplier:    "Hidrosul Materiais Hidráulicos",
      date:        daysAgo(10),
      projectId:   project1.id,
      totalAmount: 980.00,
      notes:       "Tubos PVC e conexões — hidráulica pav. 1",
      items: {
        create: [
          { productId: products[6].id, quantity: 20, unitPrice: 49.00, total: 980.00 },
        ],
      },
    },
  })

  // ─── ENTRADAS DE ESTOQUE (via compras) ───────────────────────────────────────
  const purchaseItems = await prisma.purchaseItem.findMany({
    where: { purchaseId: { in: [purchase1.id, purchase2.id, purchase3.id, purchase4.id] } },
  })

  for (const pi of purchaseItems) {
    await prisma.stockEntry.create({
      data: {
        productId:      pi.productId,
        quantity:       pi.quantity,
        type:           "PURCHASE",
        purchaseItemId: pi.id,
        registeredById: adminId,
        notes:          "Entrada automática via compra",
      },
    })
  }

  // Entrada manual — devolução
  await prisma.stockEntry.create({
    data: {
      productId:      products[4].id,
      quantity:       5,
      type:           "RETURN",
      registeredById: adminId,
      notes:          "Devolução — latas de tinta não utilizadas (projeto Hotel)",
      createdAt:      daysAgo(54),
    },
  })

  // ─── SAÍDAS DE ESTOQUE ───────────────────────────────────────────────────────
  await prisma.stockExit.createMany({
    data: [
      { productId: products[3].id, quantity: 1500, projectId: project1.id, registeredById: adminId, notes: "Uso — alvenaria pav. 1",       createdAt: daysAgo(33) },
      { productId: products[3].id, quantity: 1000, projectId: project1.id, registeredById: adminId, notes: "Uso — alvenaria pav. 2",       createdAt: daysAgo(25) },
      { productId: products[0].id, quantity: 200,  projectId: project1.id, registeredById: adminId, notes: "Uso — argamassa",              createdAt: daysAgo(28) },
      { productId: products[4].id, quantity: 8,    projectId: project2.id, registeredById: adminId, notes: "Uso — pintura sala 1 e 2",     createdAt: daysAgo(15) },
      { productId: products[7].id, quantity: 4,    projectId: project1.id, registeredById: adminId, notes: "Uso — elétrica pav. 2",        createdAt: daysAgo(22) },
      { productId: products[1].id, quantity: 500,  projectId: project1.id, registeredById: adminId, notes: "Uso — argamassa / reboco",     createdAt: daysAgo(30) },
    ],
  })

  // ─── FLUXO DE CAIXA ──────────────────────────────────────────────────────────
  await prisma.cashFlowEntry.createMany({
    data: [
      // Receitas
      { type: "QUOTE_RECEIVABLE", direction: "IN",  description: "Recebimento — Residências Monteiro",          amount: 42840.00, dueDate: daysFromNow(20), status: "PENDING",  quoteId: quote1.id, createdById: adminId },
      { type: "QUOTE_RECEIVABLE", direction: "IN",  description: "Recebimento — Empresa XYZ",                   amount: 15836.33, dueDate: daysFromNow(35), status: "PENDING",  quoteId: quote2.id, createdById: adminId },
      { type: "QUOTE_RECEIVABLE", direction: "IN",  description: "Recebimento — Hotel Grand Palace",             amount: 46694.00, dueDate: daysAgo(58), paidAt: daysAgo(58), status: "PAID", quoteId: quote5.id, createdById: adminId },
      // Despesas compras
      { type: "PURCHASE_PAYABLE", direction: "OUT", description: "Pagamento — Depósito Central Construções",    amount: 4800.00,  dueDate: daysAgo(28), paidAt: daysAgo(28), status: "PAID",    purchaseId: purchase1.id, createdById: adminId },
      { type: "PURCHASE_PAYABLE", direction: "OUT", description: "Pagamento — Loja Tintas & Cores",             amount: 3103.50,  dueDate: daysAgo(12), paidAt: daysAgo(11), status: "PAID",    purchaseId: purchase2.id, createdById: adminId },
      { type: "PURCHASE_PAYABLE", direction: "OUT", description: "Pagamento — Elétrica Souza",                  amount: 1390.00,  dueDate: daysAgo(7),                       status: "OVERDUE", purchaseId: purchase3.id, createdById: adminId },
      { type: "PURCHASE_PAYABLE", direction: "OUT", description: "Pagamento — Hidrosul",                        amount: 980.00,   dueDate: daysFromNow(5),                    status: "PENDING", purchaseId: purchase4.id, createdById: adminId },
      // Outros lançamentos
      { type: "EXTERNAL_PAYABLE", direction: "OUT", description: "Aluguel andaimes — Andaimes Brasil",          amount: 2400.00,  dueDate: daysAgo(4),                        status: "OVERDUE", createdById: adminId },
      { type: "EXTERNAL_PAYABLE", direction: "OUT", description: "Contador — honorários mensais",               amount: 850.00,   dueDate: daysFromNow(10),                   status: "PENDING", createdById: adminId },
      { type: "EXTERNAL_PAYABLE", direction: "OUT", description: "Seguro de obra — parcela 3/6",                amount: 420.00,   dueDate: daysFromNow(8),                    status: "PENDING", createdById: adminId },
      { type: "OTHER",            direction: "IN",  description: "Adiantamento — Incorporadora Bela Vista",     amount: 8000.00,  dueDate: daysAgo(5),  paidAt: daysAgo(5),  status: "PAID",    createdById: adminId },
      { type: "EXTERNAL_PAYABLE", direction: "OUT", description: "INSS mão de obra — competência janeiro",      amount: 1240.00,  dueDate: daysAgo(15), paidAt: daysAgo(14), status: "PAID",    createdById: adminId },
    ],
  })

  // ─── ALERTAS ─────────────────────────────────────────────────────────────────
  await prisma.alert.createMany({
    data: [
      {
        title:       "Estoque crítico: Cimento CP-II",
        description: "Restam apenas ~100kg de cimento. Estoque mínimo é 500kg. Compra urgente necessária.",
        priority:    "CRITICAL",
        status:      "ACTIVE",
        projectId:   project1.id,
        productId:   products[0].id,
        createdById: adminId,
        createdAt:   daysAgo(2),
      },
      {
        title:       "Prazo em risco — Reforma Monteiro",
        description: "Execução do 3º pavimento está 2 semanas atrasada. Avaliar contratação de reforço.",
        priority:    "HIGH",
        status:      "ACTIVE",
        projectId:   project1.id,
        createdById: adminId,
        createdAt:   daysAgo(4),
      },
      {
        title:       "Conta em atraso — Elétrica Souza",
        description: "Fatura de R$ 1.390,00 venceu há 7 dias. Regularizar para evitar protesto.",
        priority:    "HIGH",
        status:      "ACTIVE",
        createdById: adminId,
        createdAt:   daysAgo(7),
      },
      {
        title:       "Aluguel de andaimes vencido",
        description: "Contrato de andaimes venceu há 4 dias. Renovar ou devolver os equipamentos.",
        priority:    "MEDIUM",
        status:      "ACTIVE",
        projectId:   project1.id,
        productId:   products[16].id,
        createdById: adminId,
        createdAt:   daysAgo(4),
      },
      {
        title:       "Serra circular não devolvida",
        description: "Serra circular ainda está na obra Monteiro sem registro de devolução ao almoxarifado.",
        priority:    "LOW",
        status:      "ACTIVE",
        projectId:   project1.id,
        productId:   products[17].id,
        assignedToId: worker.id,
        createdById: adminId,
        createdAt:   daysAgo(10),
      },
      {
        title:       "Vistoria final aprovada — Hotel Grand Palace",
        description: "Vistoria pós-obra concluída com aprovação integral do cliente. Documentação arquivada.",
        priority:    "LOW",
        status:      "RESOLVED",
        projectId:   project3.id,
        createdById: adminId,
        resolvedAt:  daysAgo(54),
        createdAt:   daysAgo(58),
      },
    ],
  })

  const matCount = products.filter((p) => p.type === "MATERIAL").length
  const toolCount = products.filter((p) => p.type === "TOOL").length
  console.log("\n✅ Dados de demonstração criados com sucesso!")
  console.log(`   ${clients.length} clientes`)
  console.log(`   ${products.length} produtos (${matCount} materiais + ${toolCount} ferramentas)`)
  console.log(`   ${services.length} serviços`)
  console.log(`   5 profissionais de mão de obra`)
  console.log(`   6 orçamentos (1 pago · 2 aprovados · 2 pendentes · 1 cancelado)`)
  console.log(`   3 projetos (2 ativos · 1 encerrado)`)
  console.log(`   4 compras`)
  console.log(`   13 lançamentos de fluxo de caixa`)
  console.log(`   6 alertas`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
