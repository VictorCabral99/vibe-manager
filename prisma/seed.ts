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

// 18 funcionários extras (total 20 com gerente + encarregado)
const extraEmployees = [
  { email: "pedro.oliveira@vibe.com",    name: "Pedro Oliveira",    jobTitle: "Pedreiro Sênior",          phone: "(11) 98111-0001", canPurchase: false, canWithdrawStock: true  },
  { email: "ana.costa@vibe.com",         name: "Ana Paula Costa",   jobTitle: "Arquiteta",                phone: "(11) 98111-0002", canPurchase: false, canWithdrawStock: false },
  { email: "marcos.ferreira@vibe.com",   name: "Marcos Ferreira",   jobTitle: "Pintor",                   phone: "(11) 98111-0003", canPurchase: false, canWithdrawStock: true  },
  { email: "rafael.lima@vibe.com",       name: "Rafael Lima",       jobTitle: "Eletricista",              phone: "(11) 98111-0004", canPurchase: true,  canWithdrawStock: true  },
  { email: "juliana.santos@vibe.com",    name: "Juliana Santos",    jobTitle: "Encarregada de Obras",     phone: "(11) 98111-0005", canPurchase: false, canWithdrawStock: true  },
  { email: "bruno.alves@vibe.com",       name: "Bruno Alves",       jobTitle: "Mestre de Obras",          phone: "(11) 98111-0006", canPurchase: true,  canWithdrawStock: true  },
  { email: "thiago.rodrigues@vibe.com",  name: "Thiago Rodrigues",  jobTitle: "Azulejista",               phone: "(11) 98111-0007", canPurchase: false, canWithdrawStock: true  },
  { email: "carla.mendes@vibe.com",      name: "Carla Mendes",      jobTitle: "Orçamentista",             phone: "(11) 98111-0008", canPurchase: false, canWithdrawStock: false },
  { email: "eduardo.barros@vibe.com",    name: "Eduardo Barros",    jobTitle: "Carpinteiro",              phone: "(11) 98111-0009", canPurchase: false, canWithdrawStock: true  },
  { email: "fernanda.silva@vibe.com",    name: "Fernanda Silva",    jobTitle: "Assistente Administrativo",phone: "(11) 98111-0010", canPurchase: false, canWithdrawStock: false },
  { email: "gabriel.oliveira@vibe.com",  name: "Gabriel Oliveira",  jobTitle: "Servente",                 phone: "(11) 98111-0011", canPurchase: false, canWithdrawStock: false },
  { email: "leticia.castro@vibe.com",    name: "Letícia Castro",    jobTitle: "Engenheira Civil",         phone: "(11) 98111-0012", canPurchase: true,  canWithdrawStock: false },
  { email: "rodrigo.pereira@vibe.com",   name: "Rodrigo Pereira",   jobTitle: "Instalador Hidráulico",    phone: "(11) 98111-0013", canPurchase: false, canWithdrawStock: true  },
  { email: "isabela.ferreira@vibe.com",  name: "Isabela Ferreira",  jobTitle: "Auxiliar de Escritório",   phone: "(11) 98111-0014", canPurchase: false, canWithdrawStock: false },
  { email: "diego.souza@vibe.com",       name: "Diego Souza",       jobTitle: "Gesseiro",                 phone: "(11) 98111-0015", canPurchase: false, canWithdrawStock: true  },
  { email: "amanda.lima@vibe.com",       name: "Amanda Lima",       jobTitle: "Coordenadora de Projetos", phone: "(11) 98111-0016", canPurchase: true,  canWithdrawStock: false },
  { email: "felipe.santos@vibe.com",     name: "Felipe Santos",     jobTitle: "Encanador",                phone: "(11) 98111-0017", canPurchase: false, canWithdrawStock: true  },
  { email: "natalia.rodrigues@vibe.com", name: "Natalia Rodrigues", jobTitle: "Técnica de Segurança",     phone: "(11) 98111-0018", canPurchase: false, canWithdrawStock: false },
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
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED_IN_PROD) {
    throw new Error("Seed não permitido em produção. Use ALLOW_SEED_IN_PROD=true para forçar.")
  }

  console.log("Iniciando seed...")

  // ─── USUÁRIOS (sistema) ───────────────────────────────────────────────────────
  let adminId = ""
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10)
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { email: user.email, name: user.name, password: hashed, role: user.role, isActive: true },
    })
    if (user.role === "ADMIN") adminId = created.id
    if (process.env.NODE_ENV !== "production") {
      console.log(`✓ ${created.role.padEnd(8)} — ${created.email}  (senha: ${user.password})`)
    }
  }

  // ─── FUNCIONÁRIOS EXTRAS ──────────────────────────────────────────────────────
  const empPassword = await bcrypt.hash("Emp@12345", 10)
  for (const emp of extraEmployees) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: { email: emp.email, name: emp.name, password: empPassword, role: "EMPLOYEE", isActive: true },
    })
    await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: emp.name,
        jobTitle: emp.jobTitle,
        phone: emp.phone,
        canPurchase: emp.canPurchase,
        canWithdrawStock: emp.canWithdrawStock,
        isActive: true,
      },
    })
  }
  if (process.env.NODE_ENV !== "production") {
    console.log(`✓ ${extraEmployees.length} funcionários extras (senha: Emp@12345)`)
  }

  // Dados de demo — ignora se já existirem clientes
  const existingClients = await prisma.client.count()
  if (existingClients > 0) {
    console.log("\nDados de demonstração já existem. Pulando...")
    return
  }

  console.log("\nCriando dados de demonstração...")

  // ─── FUNCIONÁRIOS (sistema) ───────────────────────────────────────────────────
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

  // ─── CLIENTES (12 total) ──────────────────────────────────────────────────────
  const clients = await prisma.client.createManyAndReturn({
    data: [
      // [0-7] Clientes originais
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
      // [8-11] Novos clientes
      {
        name: "Condomínio Parque das Flores",
        email: "sindico@parquedasflores.com.br",
        phone: "(11) 4789-1234",
        document: "89.012.345/0001-67",
        address: "Rua das Orquídeas, 500, Osasco - SP",
        notes: "Condomínio residencial com 120 unidades. Contato: síndico José Augusto.",
      },
      {
        name: "Distribuidora São Paulo LTDA",
        email: "compras@distribuidorasp.com.br",
        phone: "(11) 3678-5432",
        document: "56.789.012/0001-34",
        address: "Av. dos Estados, 2500, Santo André - SP",
        notes: "Grande galpão logístico. Obras de expansão em andamento.",
      },
      {
        name: "Dr. Roberto Marques",
        email: "roberto.marques@email.com",
        phone: "(11) 99678-1234",
        document: "456.789.012-33",
        address: "Rua das Hortênsias, 23, São Paulo - SP",
      },
      {
        name: "Clínica Saúde Plena",
        email: "administrativo@saudeplena.com.br",
        phone: "(11) 3567-8901",
        document: "23.456.789/0001-01",
        address: "Av. Higienópolis, 180, São Paulo - SP",
        notes: "Clínica médica multidisciplinar. Reforma em fases.",
      },
    ],
  })

  // ─── PRODUTOS ─────────────────────────────────────────────────────────────────
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

  // ─── SERVIÇOS ─────────────────────────────────────────────────────────────────
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

  // ─── PROFISSIONAIS DE MÃO DE OBRA ─────────────────────────────────────────────
  const pros = await prisma.laborProfessional.createManyAndReturn({
    data: [
      { name: "José Pereira (Pedreiro)",    phone: "(11) 99001-1122", dailyRate: 250.00, isActive: true },
      { name: "Carlos Eduardo (Pintor)",    phone: "(11) 99002-3344", dailyRate: 220.00, isActive: true },
      { name: "Roberto Silva (Eletricista)",phone: "(11) 99003-5566", dailyRate: 300.00, isActive: true },
      { name: "Anderson Gomes (Encanador)", phone: "(11) 99004-7788", dailyRate: 280.00, isActive: true },
      { name: "Fernando Alves (Servente)",  phone: "(11) 99005-9900", dailyRate: 180.00, isActive: true },
    ],
  })

  // ─── ORÇAMENTOS ───────────────────────────────────────────────────────────────

  // ORC-1: Residências Monteiro — APPROVED
  const quote1 = await prisma.quote.create({
    data: {
      clientId: clients[0].id, status: "APPROVED", applyFee: false,
      notes: "Reforma completa — 3 pavimentos. Aprovado em reunião presencial.",
      createdById: adminId, createdAt: daysAgo(45),
      items: { create: [
        { productId: products[3].id,  quantity: 3000, unitPrice: 1.20,  total: 3600.00 },
        { productId: products[0].id,  quantity: 500,  unitPrice: 0.80,  total: 400.00  },
        { productId: products[5].id,  quantity: 200,  unitPrice: 42.00, total: 8400.00 },
        { productId: products[13].id, quantity: 80,   unitPrice: 38.00, total: 3040.00 },
      ]},
      services: { create: [
        { serviceId: services[0].id, quantity: 60,  unitPrice: 85.00,  total: 5100.00,  description: "Paredes divisórias — novos quartos" },
        { serviceId: services[5].id, quantity: 200, unitPrice: 65.00,  total: 13000.00, description: "Piso e azulejo em todos os banheiros" },
        { serviceId: services[1].id, quantity: 350, unitPrice: 18.00,  total: 6300.00,  description: "Pintura completa de todos os cômodos" },
        { serviceId: services[3].id, quantity: 25,  unitPrice: 120.00, total: 3000.00,  description: "Pontos elétricos novos" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",  changedById: adminId, notes: "Orçamento criado",      createdAt: daysAgo(45) },
        { fromStatus: "PENDING", toStatus: "APPROVED", changedById: adminId, notes: "Aprovado pelo cliente", createdAt: daysAgo(40) },
      ]},
    },
  })

  // ORC-2: Empresa XYZ — APPROVED (com taxa)
  const quote2 = await prisma.quote.create({
    data: {
      clientId: clients[4].id, status: "APPROVED", applyFee: true,
      notes: "Reforma corporativa — 2 salas + recepção. Taxa de 15% aplicada.",
      createdById: adminId, createdAt: daysAgo(30),
      items: { create: [
        { productId: products[4].id, quantity: 15,  unitPrice: 89.90, total: 1348.50 },
        { productId: products[8].id, quantity: 100, unitPrice: 0.75,  total: 75.00   },
        { productId: products[5].id, quantity: 40,  unitPrice: 42.00, total: 1680.00 },
      ]},
      services: { create: [
        { serviceId: services[1].id, quantity: 160, unitPrice: 18.00,  total: 2880.00, description: "Pintura de todas as salas e recepção" },
        { serviceId: services[6].id, quantity: 80,  unitPrice: 45.00,  total: 3600.00, description: "Reboco em paredes danificadas" },
        { serviceId: services[9].id, quantity: 30,  unitPrice: 110.00, total: 3300.00, description: "Divisórias em drywall" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(30) },
        { fromStatus: "PENDING", toStatus: "APPROVED", changedById: adminId, notes: "Aprovado via WhatsApp", createdAt: daysAgo(25) },
      ]},
    },
  })

  // ORC-3: João Ferreira — PENDING
  await prisma.quote.create({
    data: {
      clientId: clients[2].id, status: "PENDING", applyFee: false,
      notes: "Reforma de banheiro e cozinha. Aguardando retorno do cliente.",
      createdById: adminId, createdAt: daysAgo(8),
      items: { create: [
        { productId: products[5].id,  quantity: 25, unitPrice: 42.00, total: 1050.00 },
        { productId: products[4].id,  quantity: 3,  unitPrice: 89.90, total: 269.70  },
        { productId: products[12].id, quantity: 15, unitPrice: 4.50,  total: 67.50   },
      ]},
      services: { create: [
        { serviceId: services[4].id, quantity: 8,  unitPrice: 110.00, total: 880.00,  description: "Troca de pontos hidráulicos" },
        { serviceId: services[5].id, quantity: 25, unitPrice: 65.00,  total: 1625.00, description: "Piso e azulejo — banheiro + cozinha" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(8) }]},
    },
  })

  // ORC-4: Maria das Graças Lima — PENDING (recente)
  await prisma.quote.create({
    data: {
      clientId: clients[3].id, status: "PENDING", applyFee: false,
      notes: "Ampliação — construção de suíte master.",
      createdById: adminId, createdAt: daysAgo(3),
      items: { create: [
        { productId: products[3].id, quantity: 800, unitPrice: 1.20,  total: 960.00 },
        { productId: products[0].id, quantity: 200, unitPrice: 0.80,  total: 160.00 },
        { productId: products[9].id, quantity: 50,  unitPrice: 12.00, total: 600.00 },
      ]},
      services: { create: [
        { serviceId: services[0].id, quantity: 30, unitPrice: 85.00,  total: 2550.00, description: "Alvenaria da nova suíte" },
        { serviceId: services[3].id, quantity: 6,  unitPrice: 120.00, total: 720.00,  description: "Pontos elétricos do quarto" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(3) }]},
    },
  })

  // ORC-5: Hotel Grand Palace — PAID
  const quote5 = await prisma.quote.create({
    data: {
      clientId: clients[7].id, status: "PAID", applyFee: false,
      notes: "Pintura de fachada e áreas comuns. Pago integralmente.",
      createdById: adminId, createdAt: daysAgo(90),
      items: { create: [
        { productId: products[4].id,  quantity: 60, unitPrice: 89.90, total: 5394.00 },
        { productId: products[11].id, quantity: 20, unitPrice: 45.00, total: 900.00  },
      ]},
      services: { create: [
        { serviceId: services[2].id, quantity: 800, unitPrice: 28.00, total: 22400.00, description: "Fachada completa do hotel" },
        { serviceId: services[1].id, quantity: 500, unitPrice: 18.00, total: 9000.00,  description: "Áreas comuns e recepção" },
        { serviceId: services[8].id, quantity: 120, unitPrice: 75.00, total: 9000.00,  description: "Impermeabilização da cobertura" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(90) },
        { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(85) },
        { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pago via transferência bancária", createdAt: daysAgo(58) },
      ]},
    },
  })

  // ORC-6: Antônio Lima — CANCELLED
  await prisma.quote.create({
    data: {
      clientId: clients[5].id, status: "CANCELLED", applyFee: false,
      notes: "Cliente cancelou por restrições financeiras.",
      createdById: adminId, createdAt: daysAgo(20),
      items:    { create: [{ productId: products[3].id, quantity: 400, unitPrice: 1.20, total: 480.00 }]},
      services: { create: [{ serviceId: services[0].id, quantity: 15, unitPrice: 85.00, total: 1275.00, description: "Alvenaria quarto adicional" }]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",   changedById: adminId, createdAt: daysAgo(20) },
        { fromStatus: "PENDING", toStatus: "CANCELLED", changedById: adminId, notes: "Cancelado a pedido do cliente", createdAt: daysAgo(12) },
      ]},
    },
  })

  // ORC-7: Incorporadora Bela Vista — Fachada Residencial — PAID
  const quote7 = await prisma.quote.create({
    data: {
      clientId: clients[6].id, status: "PAID", applyFee: false,
      notes: "Pintura de fachada do conjunto residencial Bela Vista I. Concluído.",
      createdById: adminId, createdAt: daysAgo(120),
      items: { create: [
        { productId: products[4].id,  quantity: 80, unitPrice: 89.90, total: 7192.00 },
        { productId: products[11].id, quantity: 30, unitPrice: 45.00, total: 1350.00 },
      ]},
      services: { create: [
        { serviceId: services[2].id, quantity: 1200, unitPrice: 28.00, total: 33600.00, description: "Fachada conj. residencial — 4 blocos" },
        { serviceId: services[8].id, quantity: 200,  unitPrice: 75.00, total: 15000.00, description: "Impermeabilização terraços" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(120) },
        { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(115) },
        { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pago em 3 parcelas", createdAt: daysAgo(90) },
      ]},
    },
  })

  // ORC-8: Incorporadora Bela Vista — Área de Lazer — APPROVED
  const quote8 = await prisma.quote.create({
    data: {
      clientId: clients[6].id, status: "APPROVED", applyFee: false,
      notes: "Reforma e ampliação da área de lazer — piscina, churrasqueira e playground.",
      createdById: adminId, createdAt: daysAgo(35),
      items: { create: [
        { productId: products[5].id,  quantity: 150, unitPrice: 42.00, total: 6300.00 },
        { productId: products[13].id, quantity: 60,  unitPrice: 38.00, total: 2280.00 },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 150, unitPrice: 65.00,  total: 9750.00, description: "Revestimento piscina e áreas molhadas" },
        { serviceId: services[8].id, quantity: 80,  unitPrice: 75.00,  total: 6000.00, description: "Impermeabilização piscina" },
        { serviceId: services[3].id, quantity: 15,  unitPrice: 120.00, total: 1800.00, description: "Pontos elétricos área de lazer" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(35) },
        { fromStatus: "PENDING", toStatus: "APPROVED", changedById: adminId, notes: "Assinado contrato", createdAt: daysAgo(28) },
      ]},
    },
  })

  // ORC-9: Incorporadora Bela Vista — Obras Internas — PENDING
  await prisma.quote.create({
    data: {
      clientId: clients[6].id, status: "PENDING", applyFee: true,
      notes: "Obras internas nas unidades 101–120. Aguardando aprovação do síndico.",
      createdById: adminId, createdAt: daysAgo(5),
      items: { create: [
        { productId: products[5].id, quantity: 400, unitPrice: 42.00, total: 16800.00 },
        { productId: products[4].id, quantity: 50,  unitPrice: 89.90, total: 4495.00  },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 400, unitPrice: 65.00, total: 26000.00, description: "Piso e revestimento 20 unidades" },
        { serviceId: services[1].id, quantity: 600, unitPrice: 18.00, total: 10800.00, description: "Pintura interna unidades" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(5) }]},
    },
  })

  // ORC-10: Construtora Alfa Ltda — Revestimento Externo — PAID
  const quote10 = await prisma.quote.create({
    data: {
      clientId: clients[1].id, status: "PAID", applyFee: false,
      notes: "Revestimento cerâmico externo — edifício comercial. Concluído e pago.",
      createdById: adminId, createdAt: daysAgo(100),
      items: { create: [
        { productId: products[5].id,  quantity: 500, unitPrice: 42.00, total: 21000.00 },
        { productId: products[13].id, quantity: 100, unitPrice: 38.00, total: 3800.00  },
        { productId: products[12].id, quantity: 80,  unitPrice: 4.50,  total: 360.00   },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 500, unitPrice: 65.00, total: 32500.00, description: "Revestimento fachada edifício" },
        { serviceId: services[6].id, quantity: 200, unitPrice: 45.00, total: 9000.00,  description: "Emboço e reboco externo" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(100) },
        { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(95)  },
        { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pago em 2x", createdAt: daysAgo(65) },
      ]},
    },
  })

  // ORC-11: Construtora Alfa Ltda — Instalações Hidráulicas — APPROVED
  await prisma.quote.create({
    data: {
      clientId: clients[1].id, status: "APPROVED", applyFee: false,
      notes: "Instalações hidráulicas — bloco B do condomínio Parque Norte.",
      createdById: adminId, createdAt: daysAgo(28),
      items: { create: [
        { productId: products[6].id, quantity: 80, unitPrice: 49.00,  total: 3920.00 },
        { productId: products[7].id, quantity: 5,  unitPrice: 139.00, total: 695.00  },
      ]},
      services: { create: [
        { serviceId: services[4].id, quantity: 40, unitPrice: 110.00, total: 4400.00, description: "Pontos hidráulicos bloco B" },
        { serviceId: services[3].id, quantity: 20, unitPrice: 120.00, total: 2400.00, description: "Pontos elétricos bloco B" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(28) },
        { fromStatus: "PENDING", toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(22) },
      ]},
    },
  })

  // ORC-12: Construtora Alfa Ltda — Drywall — CANCELLED
  await prisma.quote.create({
    data: {
      clientId: clients[1].id, status: "CANCELLED", applyFee: false,
      notes: "Divisórias drywall — projeto suspenso por mudança no layout.",
      createdById: adminId, createdAt: daysAgo(50),
      services: { create: [
        { serviceId: services[9].id, quantity: 200, unitPrice: 110.00, total: 22000.00, description: "Drywall escritórios bloco A" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",   changedById: adminId, createdAt: daysAgo(50) },
        { fromStatus: "PENDING", toStatus: "CANCELLED", changedById: adminId, notes: "Projeto suspenso pelo cliente", createdAt: daysAgo(42) },
      ]},
    },
  })

  // ORC-13: Hotel Grand Palace — Quartos Ala Norte — APPROVED
  await prisma.quote.create({
    data: {
      clientId: clients[7].id, status: "APPROVED", applyFee: true,
      notes: "Reforma de 30 quartos da ala norte. Piso, pintura e banheiros.",
      createdById: adminId, createdAt: daysAgo(20),
      items: { create: [
        { productId: products[5].id, quantity: 300, unitPrice: 42.00, total: 12600.00 },
        { productId: products[4].id, quantity: 40,  unitPrice: 89.90, total: 3596.00  },
        { productId: products[8].id, quantity: 200, unitPrice: 0.75,  total: 150.00   },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 300, unitPrice: 65.00,  total: 19500.00, description: "Piso e azulejo 30 quartos" },
        { serviceId: services[1].id, quantity: 600, unitPrice: 18.00,  total: 10800.00, description: "Pintura quartos e banheiros" },
        { serviceId: services[4].id, quantity: 30,  unitPrice: 110.00, total: 3300.00,  description: "Troca hidráulica banheiros" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(20) },
        { fromStatus: "PENDING", toStatus: "APPROVED", changedById: adminId, notes: "Aprovado pela direção do hotel", createdAt: daysAgo(14) },
      ]},
    },
  })

  // ORC-14: Hotel Grand Palace — Restaurante — PENDING
  await prisma.quote.create({
    data: {
      clientId: clients[7].id, status: "PENDING", applyFee: false,
      notes: "Reforma completa do restaurante: piso, revestimento e iluminação.",
      createdById: adminId, createdAt: daysAgo(7),
      items: { create: [
        { productId: products[5].id, quantity: 120, unitPrice: 42.00,  total: 5040.00 },
        { productId: products[7].id, quantity: 8,   unitPrice: 139.00, total: 1112.00 },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 120, unitPrice: 65.00,  total: 7800.00, description: "Piso porcelanato restaurante" },
        { serviceId: services[3].id, quantity: 30,  unitPrice: 120.00, total: 3600.00, description: "Iluminação nova restaurante" },
        { serviceId: services[9].id, quantity: 40,  unitPrice: 110.00, total: 4400.00, description: "Divisórias cozinha industrial" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(7) }]},
    },
  })

  // ORC-15: Condomínio Parque das Flores — Pintura Fachada — PAID
  const quote15 = await prisma.quote.create({
    data: {
      clientId: clients[8].id, status: "PAID", applyFee: false,
      notes: "Pintura da fachada do condomínio e áreas comuns. Encerrado.",
      createdById: adminId, createdAt: daysAgo(150),
      items: { create: [
        { productId: products[4].id,  quantity: 50, unitPrice: 89.90, total: 4495.00 },
        { productId: products[11].id, quantity: 10, unitPrice: 45.00, total: 450.00  },
      ]},
      services: { create: [
        { serviceId: services[2].id, quantity: 600, unitPrice: 28.00, total: 16800.00, description: "Pintura fachada condomínio" },
        { serviceId: services[1].id, quantity: 200, unitPrice: 18.00, total: 3600.00,  description: "Pintura hall e áreas comuns" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(150) },
        { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(145) },
        { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pago via boleto", createdAt: daysAgo(120) },
      ]},
    },
  })

  // ORC-16: Condomínio Parque das Flores — Salão de Festas — APPROVED
  await prisma.quote.create({
    data: {
      clientId: clients[8].id, status: "APPROVED", applyFee: false,
      notes: "Reforma do salão de festas: demolição, alvenaria, piso e pintura.",
      createdById: adminId, createdAt: daysAgo(40),
      items: { create: [
        { productId: products[3].id, quantity: 500, unitPrice: 1.20,  total: 600.00  },
        { productId: products[5].id, quantity: 80,  unitPrice: 42.00, total: 3360.00 },
        { productId: products[4].id, quantity: 10,  unitPrice: 89.90, total: 899.00  },
      ]},
      services: { create: [
        { serviceId: services[7].id, quantity: 30,  unitPrice: 95.00, total: 2850.00, description: "Demolição paredes antigas" },
        { serviceId: services[0].id, quantity: 20,  unitPrice: 85.00, total: 1700.00, description: "Nova divisória alvenaria" },
        { serviceId: services[5].id, quantity: 80,  unitPrice: 65.00, total: 5200.00, description: "Piso e azulejo salão" },
        { serviceId: services[1].id, quantity: 120, unitPrice: 18.00, total: 2160.00, description: "Pintura salão e copa" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(40) },
        { fromStatus: "PENDING", toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(33) },
      ]},
    },
  })

  // ORC-17: Condomínio Parque das Flores — Playground — PENDING
  await prisma.quote.create({
    data: {
      clientId: clients[8].id, status: "PENDING", applyFee: false,
      notes: "Instalação de playground e revitalização da área verde.",
      createdById: adminId, createdAt: daysAgo(10),
      services: { create: [
        { serviceId: services[5].id, quantity: 60, unitPrice: 65.00,  total: 3900.00, description: "Piso emborrachado playground" },
        { serviceId: services[3].id, quantity: 10, unitPrice: 120.00, total: 1200.00, description: "Iluminação área externa" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(10) }]},
    },
  })

  // ORC-18: Distribuidora São Paulo LTDA — Ampliação Galpão — PAID
  const quote18 = await prisma.quote.create({
    data: {
      clientId: clients[9].id, status: "PAID", applyFee: false,
      notes: "Ampliação de galpão logístico — 800m². Obra concluída, pago.",
      createdById: adminId, createdAt: daysAgo(180),
      items: { create: [
        { productId: products[3].id, quantity: 5000, unitPrice: 1.20,  total: 6000.00 },
        { productId: products[0].id, quantity: 1500, unitPrice: 0.80,  total: 1200.00 },
        { productId: products[9].id, quantity: 200,  unitPrice: 12.00, total: 2400.00 },
        { productId: products[7].id, quantity: 20,   unitPrice: 139.00,total: 2780.00 },
      ]},
      services: { create: [
        { serviceId: services[0].id, quantity: 300, unitPrice: 85.00,  total: 25500.00, description: "Alvenaria ampliação galpão" },
        { serviceId: services[3].id, quantity: 50,  unitPrice: 120.00, total: 6000.00,  description: "Instalação elétrica industrial" },
        { serviceId: services[4].id, quantity: 20,  unitPrice: 110.00, total: 2200.00,  description: "Hidráulica novos sanitários" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(180) },
        { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(175) },
        { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pago em 5 parcelas", createdAt: daysAgo(130) },
      ]},
    },
  })

  // ORC-19: Distribuidora São Paulo LTDA — Escritórios — CANCELLED
  await prisma.quote.create({
    data: {
      clientId: clients[9].id, status: "CANCELLED", applyFee: false,
      notes: "Reforma dos escritórios administrativos. Cancelado por restrições orçamentárias.",
      createdById: adminId, createdAt: daysAgo(60),
      services: { create: [
        { serviceId: services[9].id, quantity: 100, unitPrice: 110.00, total: 11000.00, description: "Drywall novos escritórios" },
        { serviceId: services[1].id, quantity: 150, unitPrice: 18.00,  total: 2700.00,  description: "Pintura toda a área" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",   changedById: adminId, createdAt: daysAgo(60) },
        { fromStatus: "PENDING", toStatus: "CANCELLED", changedById: adminId, notes: "Budget cortado pela diretoria", createdAt: daysAgo(52) },
      ]},
    },
  })

  // ORC-20: Dr. Roberto Marques — Casa Térrea — PAID
  const quote20 = await prisma.quote.create({
    data: {
      clientId: clients[10].id, status: "PAID", applyFee: false,
      notes: "Construção de casa térrea 120m². Concluído e pago.",
      createdById: adminId, createdAt: daysAgo(200),
      items: { create: [
        { productId: products[3].id, quantity: 8000, unitPrice: 1.20,  total: 9600.00 },
        { productId: products[0].id, quantity: 2000, unitPrice: 0.80,  total: 1600.00 },
        { productId: products[9].id, quantity: 300,  unitPrice: 12.00, total: 3600.00 },
        { productId: products[5].id, quantity: 140,  unitPrice: 42.00, total: 5880.00 },
        { productId: products[4].id, quantity: 20,   unitPrice: 89.90, total: 1798.00 },
        { productId: products[7].id, quantity: 8,    unitPrice: 139.00,total: 1112.00 },
        { productId: products[6].id, quantity: 30,   unitPrice: 49.00, total: 1470.00 },
      ]},
      services: { create: [
        { serviceId: services[0].id, quantity: 120, unitPrice: 85.00,  total: 10200.00, description: "Alvenaria completa" },
        { serviceId: services[5].id, quantity: 140, unitPrice: 65.00,  total: 9100.00,  description: "Piso e revestimentos" },
        { serviceId: services[1].id, quantity: 240, unitPrice: 18.00,  total: 4320.00,  description: "Pintura interna" },
        { serviceId: services[2].id, quantity: 100, unitPrice: 28.00,  total: 2800.00,  description: "Pintura fachada" },
        { serviceId: services[3].id, quantity: 20,  unitPrice: 120.00, total: 2400.00,  description: "Instalação elétrica" },
        { serviceId: services[4].id, quantity: 15,  unitPrice: 110.00, total: 1650.00,  description: "Instalação hidráulica" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(200) },
        { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(194) },
        { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pagamento final recebido", createdAt: daysAgo(140) },
      ]},
    },
  })

  // ORC-21: Dr. Roberto Marques — Garagem Coberta — PENDING
  await prisma.quote.create({
    data: {
      clientId: clients[10].id, status: "PENDING", applyFee: false,
      notes: "Cobertura de garagem com telha metálica e fechamento lateral.",
      createdById: adminId, createdAt: daysAgo(12),
      items:    { create: [{ productId: products[3].id, quantity: 300, unitPrice: 1.20, total: 360.00 }]},
      services: { create: [
        { serviceId: services[0].id, quantity: 10, unitPrice: 85.00,  total: 850.00, description: "Mureta lateral garagem" },
        { serviceId: services[3].id, quantity: 4,  unitPrice: 120.00, total: 480.00, description: "Pontos elétricos garagem" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(12) }]},
    },
  })

  // ORC-22: Clínica Saúde Plena — Recepção — PAID
  await prisma.quote.create({
    data: {
      clientId: clients[11].id, status: "PAID", applyFee: false,
      notes: "Reforma da recepção e hall de entrada. Pago.",
      createdById: adminId, createdAt: daysAgo(70),
      items: { create: [
        { productId: products[5].id, quantity: 60, unitPrice: 42.00, total: 2520.00 },
        { productId: products[4].id, quantity: 5,  unitPrice: 89.90, total: 449.50  },
        { productId: products[8].id, quantity: 50, unitPrice: 0.75,  total: 37.50   },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 60, unitPrice: 65.00,  total: 3900.00, description: "Piso porcelanato recepção" },
        { serviceId: services[1].id, quantity: 100,unitPrice: 18.00,  total: 1800.00, description: "Pintura recepção" },
        { serviceId: services[9].id, quantity: 20, unitPrice: 110.00, total: 2200.00, description: "Drywall divisórias" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(70) },
        { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(65) },
        { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pago em 2x", createdAt: daysAgo(45) },
      ]},
    },
  })

  // ORC-23: Clínica Saúde Plena — Consultórios — APPROVED
  const quote23 = await prisma.quote.create({
    data: {
      clientId: clients[11].id, status: "APPROVED", applyFee: false,
      notes: "Reforma de 8 consultórios: instalações e acabamento.",
      createdById: adminId, createdAt: daysAgo(25),
      items: { create: [
        { productId: products[5].id, quantity: 100, unitPrice: 42.00,  total: 4200.00 },
        { productId: products[7].id, quantity: 6,   unitPrice: 139.00, total: 834.00  },
        { productId: products[6].id, quantity: 10,  unitPrice: 49.00,  total: 490.00  },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 100, unitPrice: 65.00,  total: 6500.00, description: "Piso 8 consultórios" },
        { serviceId: services[3].id, quantity: 24,  unitPrice: 120.00, total: 2880.00, description: "Pontos elétricos consultórios" },
        { serviceId: services[4].id, quantity: 16,  unitPrice: 110.00, total: 1760.00, description: "Pontos hidráulicos banheiros" },
        { serviceId: services[1].id, quantity: 160, unitPrice: 18.00,  total: 2880.00, description: "Pintura consultórios" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(25) },
        { fromStatus: "PENDING", toStatus: "APPROVED", changedById: adminId, notes: "Aprovado pela diretoria médica", createdAt: daysAgo(18) },
      ]},
    },
  })

  // ORC-24: Clínica Saúde Plena — Acessibilidade — PENDING
  await prisma.quote.create({
    data: {
      clientId: clients[11].id, status: "PENDING", applyFee: false,
      notes: "Adequação para acessibilidade: rampas, banheiro adaptado e sinalização.",
      createdById: adminId, createdAt: daysAgo(6),
      services: { create: [
        { serviceId: services[0].id, quantity: 15, unitPrice: 85.00,  total: 1275.00, description: "Rampas de acesso" },
        { serviceId: services[5].id, quantity: 20, unitPrice: 65.00,  total: 1300.00, description: "Piso tátil e antiderrapante" },
        { serviceId: services[4].id, quantity: 6,  unitPrice: 110.00, total: 660.00,  description: "Adaptação banheiro PCD" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(6) }]},
    },
  })

  // ORC-25: João Carlos Ferreira — Reforma Lavabo — PAID
  await prisma.quote.create({
    data: {
      clientId: clients[2].id, status: "PAID", applyFee: false,
      notes: "Reforma completa do lavabo social.",
      createdById: adminId, createdAt: daysAgo(60),
      items: { create: [
        { productId: products[5].id,  quantity: 8, unitPrice: 42.00, total: 336.00 },
        { productId: products[12].id, quantity: 5, unitPrice: 4.50,  total: 22.50  },
        { productId: products[6].id,  quantity: 3, unitPrice: 49.00, total: 147.00 },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 8,  unitPrice: 65.00,  total: 520.00, description: "Piso e azulejo lavabo" },
        { serviceId: services[4].id, quantity: 3,  unitPrice: 110.00, total: 330.00, description: "Hidráulica lavabo" },
        { serviceId: services[1].id, quantity: 15, unitPrice: 18.00,  total: 270.00, description: "Pintura lavabo" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(60) },
        { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(57) },
        { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pago à vista", createdAt: daysAgo(45) },
      ]},
    },
  })

  // ORC-26: Maria das Graças Lima — Cozinha Gourmet — APPROVED
  await prisma.quote.create({
    data: {
      clientId: clients[3].id, status: "APPROVED", applyFee: false,
      notes: "Reforma e ampliação da cozinha com bancadas e área gourmet.",
      createdById: adminId, createdAt: daysAgo(18),
      items: { create: [
        { productId: products[5].id,  quantity: 30, unitPrice: 42.00, total: 1260.00 },
        { productId: products[12].id, quantity: 15, unitPrice: 4.50,  total: 67.50   },
        { productId: products[4].id,  quantity: 4,  unitPrice: 89.90, total: 359.60  },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 30, unitPrice: 65.00,  total: 1950.00, description: "Revestimento cozinha e gourmet" },
        { serviceId: services[4].id, quantity: 5,  unitPrice: 110.00, total: 550.00,  description: "Pontos hidráulicos novos" },
        { serviceId: services[3].id, quantity: 6,  unitPrice: 120.00, total: 720.00,  description: "Pontos elétricos coifa e iluminação" },
        { serviceId: services[1].id, quantity: 40, unitPrice: 18.00,  total: 720.00,  description: "Pintura cozinha" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(18) },
        { fromStatus: "PENDING", toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(12) },
      ]},
    },
  })

  // ORC-27: Antônio Lima Santos — Fachada Residência — PENDING
  await prisma.quote.create({
    data: {
      clientId: clients[5].id, status: "PENDING", applyFee: false,
      notes: "Pintura e impermeabilização de fachada residencial.",
      createdById: adminId, createdAt: daysAgo(4),
      items: { create: [
        { productId: products[4].id,  quantity: 5, unitPrice: 89.90, total: 449.50 },
        { productId: products[11].id, quantity: 3, unitPrice: 45.00, total: 135.00 },
      ]},
      services: { create: [
        { serviceId: services[2].id, quantity: 80, unitPrice: 28.00, total: 2240.00, description: "Pintura fachada residência" },
        { serviceId: services[8].id, quantity: 30, unitPrice: 75.00, total: 2250.00, description: "Impermeabilização laje" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(4) }]},
    },
  })

  // ORC-28: Empresa XYZ — 2ª Fase Reforma — PAID
  await prisma.quote.create({
    data: {
      clientId: clients[4].id, status: "PAID", applyFee: true,
      notes: "Segunda fase da reforma corporativa: sala de reuniões e auditório.",
      createdById: adminId, createdAt: daysAgo(110),
      items: { create: [
        { productId: products[5].id, quantity: 60, unitPrice: 42.00,  total: 2520.00 },
        { productId: products[4].id, quantity: 12, unitPrice: 89.90,  total: 1078.80 },
        { productId: products[7].id, quantity: 5,  unitPrice: 139.00, total: 695.00  },
      ]},
      services: { create: [
        { serviceId: services[9].id, quantity: 50,  unitPrice: 110.00, total: 5500.00, description: "Drywall sala de reuniões" },
        { serviceId: services[5].id, quantity: 60,  unitPrice: 65.00,  total: 3900.00, description: "Piso auditório" },
        { serviceId: services[3].id, quantity: 20,  unitPrice: 120.00, total: 2400.00, description: "Sonorização e elétrica auditório" },
        { serviceId: services[1].id, quantity: 120, unitPrice: 18.00,  total: 2160.00, description: "Pintura salas" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,       toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(110) },
        { fromStatus: "PENDING",  toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(105) },
        { fromStatus: "APPROVED", toStatus: "PAID",     changedById: adminId, notes: "Pago após vistoria", createdAt: daysAgo(75) },
      ]},
    },
  })

  // ORC-29: Residências Monteiro — Área Externa — APPROVED
  await prisma.quote.create({
    data: {
      clientId: clients[0].id, status: "APPROVED", applyFee: false,
      notes: "Urbanização da área externa: jardim, calçada e estacionamento.",
      createdById: adminId, createdAt: daysAgo(15),
      items: { create: [
        { productId: products[5].id,  quantity: 100, unitPrice: 42.00, total: 4200.00 },
        { productId: products[13].id, quantity: 30,  unitPrice: 38.00, total: 1140.00 },
      ]},
      services: { create: [
        { serviceId: services[5].id, quantity: 100, unitPrice: 65.00,  total: 6500.00, description: "Piso calçada e estacionamento" },
        { serviceId: services[3].id, quantity: 10,  unitPrice: 120.00, total: 1200.00, description: "Iluminação externa" },
      ]},
      statusLogs: { create: [
        { fromStatus: null,      toStatus: "PENDING",  changedById: adminId, createdAt: daysAgo(15) },
        { fromStatus: "PENDING", toStatus: "APPROVED", changedById: adminId, createdAt: daysAgo(10) },
      ]},
    },
  })

  // ORC-30: Residências Monteiro — Cobertura/Terraço — PENDING
  await prisma.quote.create({
    data: {
      clientId: clients[0].id, status: "PENDING", applyFee: false,
      notes: "Construção de cobertura e terraço gourmet no 3º pavimento.",
      createdById: adminId, createdAt: daysAgo(2),
      items: { create: [
        { productId: products[0].id, quantity: 300, unitPrice: 0.80,  total: 240.00 },
        { productId: products[9].id, quantity: 80,  unitPrice: 12.00, total: 960.00 },
      ]},
      services: { create: [
        { serviceId: services[8].id, quantity: 60, unitPrice: 75.00, total: 4500.00, description: "Impermeabilização laje terraço" },
        { serviceId: services[0].id, quantity: 20, unitPrice: 85.00, total: 1700.00, description: "Alvenaria muretas terraço" },
        { serviceId: services[2].id, quantity: 40, unitPrice: 28.00, total: 1120.00, description: "Pintura externa cobertura" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(2) }]},
    },
  })

  // ORC-31: Construtora Alfa Ltda — Novo Empreendimento — PENDING
  await prisma.quote.create({
    data: {
      clientId: clients[1].id, status: "PENDING", applyFee: false,
      notes: "Construção de 2 blocos residenciais — etapa 1. Orçamento preliminar.",
      createdById: adminId, createdAt: daysAgo(1),
      items: { create: [
        { productId: products[3].id, quantity: 10000, unitPrice: 1.20, total: 12000.00 },
        { productId: products[0].id, quantity: 3000,  unitPrice: 0.80, total: 2400.00  },
        { productId: products[9].id, quantity: 500,   unitPrice: 12.00,total: 6000.00  },
      ]},
      services: { create: [
        { serviceId: services[0].id, quantity: 400, unitPrice: 85.00, total: 34000.00, description: "Alvenaria blocos A e B" },
        { serviceId: services[6].id, quantity: 800, unitPrice: 45.00, total: 36000.00, description: "Reboco e emboço toda a estrutura" },
      ]},
      statusLogs: { create: [{ fromStatus: null, toStatus: "PENDING", changedById: adminId, createdAt: daysAgo(1) }]},
    },
  })

  // ─── PROJETOS (10 total) ───────────────────────────────────────────────────────

  // Projetos originais (1–3)
  const project1 = await prisma.project.create({
    data: {
      name: "Residência Monteiro — Reforma Completa",
      clientId: clients[0].id, quoteId: quote1.id,
      totalRevenue: 42840.00, targetMargin: 0.35, status: "ACTIVE",
      notes: "Obra em andamento. Prazo total: 4 meses. Início: fase de alvenaria.",
      createdById: adminId, startedAt: daysAgo(40),
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: "Empresa XYZ — Reforma Corporativa",
      clientId: clients[4].id, quoteId: quote2.id,
      totalRevenue: 15836.33, targetMargin: 0.40, status: "ACTIVE",
      notes: "Reforma de escritório corporativo — 2 salas e recepção.",
      createdById: adminId, startedAt: daysAgo(22),
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name: "Hotel Grand Palace — Fachada e Áreas Comuns",
      clientId: clients[7].id, quoteId: quote5.id,
      totalRevenue: 46694.00, targetMargin: 0.30, status: "CLOSED",
      notes: "Projeto concluído com sucesso. Pagamento integral recebido.",
      createdById: adminId, startedAt: daysAgo(85), closedAt: daysAgo(55),
    },
  })

  // Projetos novos (4–10)
  const project4 = await prisma.project.create({
    data: {
      name: "Incorporadora Bela Vista — Fachada Residencial",
      clientId: clients[6].id, quoteId: quote7.id,
      totalRevenue: 57142.00, targetMargin: 0.32, status: "CLOSED",
      notes: "Fachada do conj. residencial Bela Vista I concluída e entregue.",
      createdById: adminId, startedAt: daysAgo(115), closedAt: daysAgo(88),
    },
  })

  const project5 = await prisma.project.create({
    data: {
      name: "Incorporadora Bela Vista — Área de Lazer",
      clientId: clients[6].id, quoteId: quote8.id,
      totalRevenue: 26130.00, targetMargin: 0.38, status: "ACTIVE",
      notes: "Reforma da área de lazer em andamento. Fase: revestimento piscina.",
      createdById: adminId, startedAt: daysAgo(25),
    },
  })

  const project6 = await prisma.project.create({
    data: {
      name: "Construtora Alfa — Revestimento Externo",
      clientId: clients[1].id, quoteId: quote10.id,
      totalRevenue: 66660.00, targetMargin: 0.35, status: "CLOSED",
      notes: "Revestimento fachada edifício comercial concluído e entregue.",
      createdById: adminId, startedAt: daysAgo(95), closedAt: daysAgo(62),
    },
  })

  const project7 = await prisma.project.create({
    data: {
      name: "Condomínio Parque das Flores — Pintura Fachada",
      clientId: clients[8].id, quoteId: quote15.id,
      totalRevenue: 25345.00, targetMargin: 0.30, status: "CLOSED",
      notes: "Pintura de fachada e áreas comuns concluída.",
      createdById: adminId, startedAt: daysAgo(145), closedAt: daysAgo(118),
    },
  })

  const project8 = await prisma.project.create({
    data: {
      name: "Distribuidora São Paulo — Ampliação Galpão",
      clientId: clients[9].id, quoteId: quote18.id,
      totalRevenue: 46080.00, targetMargin: 0.28, status: "CLOSED",
      notes: "Ampliação do galpão logístico 800m² concluída.",
      createdById: adminId, startedAt: daysAgo(175), closedAt: daysAgo(128),
    },
  })

  const project9 = await prisma.project.create({
    data: {
      name: "Dr. Roberto Marques — Construção Casa Térrea",
      clientId: clients[10].id, quoteId: quote20.id,
      totalRevenue: 55060.00, targetMargin: 0.40, status: "CLOSED",
      notes: "Construção de casa térrea 120m² concluída.",
      createdById: adminId, startedAt: daysAgo(194), closedAt: daysAgo(138),
    },
  })

  const project10 = await prisma.project.create({
    data: {
      name: "Clínica Saúde Plena — Reforma Consultórios",
      clientId: clients[11].id, quoteId: quote23.id,
      totalRevenue: 18864.00, targetMargin: 0.42, status: "ACTIVE",
      notes: "Reforma de 8 consultórios em andamento. Fase: piso e elétrica.",
      createdById: adminId, startedAt: daysAgo(15),
    },
  })

  // ─── DESPESAS DE PROJETO ───────────────────────────────────────────────────────
  await prisma.projectExpense.createMany({
    data: [
      // Projetos originais
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
      // Projetos novos
      { projectId: project4.id, type: "MATERIAL", description: "Tintas e impermeabilizante fachada",  amount: 8542.00, date: daysAgo(112), registeredById: adminId },
      { projectId: project4.id, type: "LABOR",    description: "Equipe pintura fachada — 20 dias",    amount: 13200.00,date: daysAgo(100), registeredById: adminId },
      { projectId: project4.id, type: "OTHER",    description: "Andaimes — 25 dias",                  amount: 5000.00, date: daysAgo(105), registeredById: adminId },
      { projectId: project5.id, type: "MATERIAL", description: "Piso e revestimento piscina",         amount: 8580.00, date: daysAgo(22),  registeredById: adminId },
      { projectId: project5.id, type: "LABOR",    description: "Azulejista — 10 dias",                amount: 3000.00, date: daysAgo(15),  registeredById: adminId },
      { projectId: project6.id, type: "MATERIAL", description: "Piso, argamassa e rejunte",           amount: 25160.00,date: daysAgo(92),  registeredById: adminId },
      { projectId: project6.id, type: "LABOR",    description: "Equipe revestimento — 30 dias",       amount: 22500.00,date: daysAgo(85),  registeredById: adminId },
      { projectId: project7.id, type: "MATERIAL", description: "Tintas e impermeabilizante",          amount: 4945.00, date: daysAgo(142), registeredById: adminId },
      { projectId: project7.id, type: "LABOR",    description: "Pintura fachada — 15 dias",           amount: 9900.00, date: daysAgo(135), registeredById: adminId },
      { projectId: project8.id, type: "MATERIAL", description: "Materiais construção galpão",         amount: 12380.00,date: daysAgo(172), registeredById: adminId },
      { projectId: project8.id, type: "LABOR",    description: "Equipe galpão — 45 dias",             amount: 18900.00,date: daysAgo(160), registeredById: adminId },
      { projectId: project9.id, type: "MATERIAL", description: "Materiais construção casa",           amount: 25060.00,date: daysAgo(190), registeredById: adminId },
      { projectId: project9.id, type: "LABOR",    description: "Equipe multidisciplinar — 50 dias",   amount: 18750.00,date: daysAgo(175), registeredById: adminId },
      { projectId: project10.id,type: "MATERIAL", description: "Piso e instalações consultórios",     amount: 5524.00, date: daysAgo(12),  registeredById: adminId },
      { projectId: project10.id,type: "LABOR",    description: "Equipe mista — 8 dias",               amount: 3200.00, date: daysAgo(8),   registeredById: adminId },
    ],
  })

  // ─── MÃO DE OBRA ──────────────────────────────────────────────────────────────
  await prisma.laborEntry.createMany({
    data: [
      { professionalId: pros[0].id, projectId: project1.id, date: daysAgo(38), dailyRate: 250, quantity: 5,  total: 1250, description: "Alvenaria — paredes divisórias pav. 1", registeredById: adminId },
      { professionalId: pros[0].id, projectId: project1.id, date: daysAgo(30), dailyRate: 250, quantity: 5,  total: 1250, description: "Alvenaria — pav. 2",                   registeredById: adminId },
      { professionalId: pros[0].id, projectId: project1.id, date: daysAgo(22), dailyRate: 250, quantity: 5,  total: 1250, description: "Alvenaria — pav. 3",                   registeredById: adminId },
      { professionalId: pros[1].id, projectId: project1.id, date: daysAgo(15), dailyRate: 220, quantity: 3,  total: 660,  description: "Pintura interna — pav. 1",             registeredById: adminId },
      { professionalId: pros[1].id, projectId: project2.id, date: daysAgo(18), dailyRate: 220, quantity: 5,  total: 1100, description: "Pintura escritório completo",           registeredById: adminId },
      { professionalId: pros[2].id, projectId: project1.id, date: daysAgo(20), dailyRate: 300, quantity: 2,  total: 600,  description: "Instalação elétrica — salas",           registeredById: adminId },
      { professionalId: pros[3].id, projectId: project1.id, date: daysAgo(12), dailyRate: 280, quantity: 3,  total: 840,  description: "Hidráulica — banheiros pav. 1",         registeredById: adminId },
      { professionalId: pros[1].id, projectId: project3.id, date: daysAgo(78), dailyRate: 220, quantity: 15, total: 3300, description: "Pintura fachada hotel — lote 1",        registeredById: adminId },
      { professionalId: pros[0].id, projectId: project3.id, date: daysAgo(70), dailyRate: 250, quantity: 12, total: 3000, description: "Serviços auxiliares fachada hotel",     registeredById: adminId },
      { professionalId: pros[4].id, projectId: project3.id, date: daysAgo(65), dailyRate: 180, quantity: 10, total: 1800, description: "Limpeza e acabamento hotel",            registeredById: adminId },
    ],
  })

  // ─── COMPRAS ───────────────────────────────────────────────────────────────────
  const purchase1 = await prisma.purchase.create({
    data: {
      buyerId: manager.id, supplier: "Depósito Central Construções",
      date: daysAgo(36), projectId: project1.id, totalAmount: 4800.00,
      notes: "Materiais para início da obra — pagamento à vista com 3% desconto",
      items: { create: [
        { productId: products[3].id, quantity: 3000, unitPrice: 1.20, total: 3600.00 },
        { productId: products[0].id, quantity: 500,  unitPrice: 0.80, total: 400.00  },
        { productId: products[1].id, quantity: 1000, unitPrice: 0.80, total: 800.00  },
      ]},
    },
  })

  const purchase2 = await prisma.purchase.create({
    data: {
      buyerId: manager.id, supplier: "Loja Tintas & Cores",
      date: daysAgo(19), projectId: project2.id, totalAmount: 3103.50,
      notes: "Tintas, gesso e piso para reforma escritório XYZ",
      items: { create: [
        { productId: products[4].id, quantity: 15,  unitPrice: 89.90, total: 1348.50 },
        { productId: products[8].id, quantity: 100, unitPrice: 0.75,  total: 75.00   },
        { productId: products[5].id, quantity: 40,  unitPrice: 42.00, total: 1680.00 },
      ]},
    },
  })

  const purchase3 = await prisma.purchase.create({
    data: {
      buyerId: worker.id, supplier: "Elétrica Souza Materiais",
      date: daysAgo(24), projectId: project1.id, totalAmount: 1390.00,
      notes: "Material elétrico pav. 2 — fio e disjuntores",
      items: { create: [
        { productId: products[7].id, quantity: 10, unitPrice: 139.00, total: 1390.00 },
      ]},
    },
  })

  const purchase4 = await prisma.purchase.create({
    data: {
      buyerId: manager.id, supplier: "Hidrosul Materiais Hidráulicos",
      date: daysAgo(10), projectId: project1.id, totalAmount: 980.00,
      notes: "Tubos PVC e conexões — hidráulica pav. 1",
      items: { create: [
        { productId: products[6].id, quantity: 20, unitPrice: 49.00, total: 980.00 },
      ]},
    },
  })

  // ─── ENTRADAS DE ESTOQUE (via compras) ────────────────────────────────────────
  const purchaseItems = await prisma.purchaseItem.findMany({
    where: { purchaseId: { in: [purchase1.id, purchase2.id, purchase3.id, purchase4.id] } },
  })

  for (const pi of purchaseItems) {
    await prisma.stockEntry.create({
      data: {
        productId: pi.productId, quantity: pi.quantity,
        type: "PURCHASE", purchaseItemId: pi.id,
        registeredById: adminId, notes: "Entrada automática via compra",
      },
    })
  }

  await prisma.stockEntry.create({
    data: {
      productId: products[4].id, quantity: 5, type: "RETURN",
      registeredById: adminId,
      notes: "Devolução — latas de tinta não utilizadas (projeto Hotel)",
      createdAt: daysAgo(54),
    },
  })

  // ─── SAÍDAS DE ESTOQUE ─────────────────────────────────────────────────────────
  await prisma.stockExit.createMany({
    data: [
      { productId: products[3].id, quantity: 1500, projectId: project1.id, registeredById: adminId, notes: "Uso — alvenaria pav. 1",   createdAt: daysAgo(33) },
      { productId: products[3].id, quantity: 1000, projectId: project1.id, registeredById: adminId, notes: "Uso — alvenaria pav. 2",   createdAt: daysAgo(25) },
      { productId: products[0].id, quantity: 200,  projectId: project1.id, registeredById: adminId, notes: "Uso — argamassa",          createdAt: daysAgo(28) },
      { productId: products[4].id, quantity: 8,    projectId: project2.id, registeredById: adminId, notes: "Uso — pintura sala 1 e 2", createdAt: daysAgo(15) },
      { productId: products[7].id, quantity: 4,    projectId: project1.id, registeredById: adminId, notes: "Uso — elétrica pav. 2",    createdAt: daysAgo(22) },
      { productId: products[1].id, quantity: 500,  projectId: project1.id, registeredById: adminId, notes: "Uso — argamassa / reboco", createdAt: daysAgo(30) },
    ],
  })

  // ─── FLUXO DE CAIXA ────────────────────────────────────────────────────────────
  await prisma.cashFlowEntry.createMany({
    data: [
      // Receitas
      { type: "QUOTE_RECEIVABLE", direction: "IN",  description: "Recebimento — Residências Monteiro",       amount: 42840.00, dueDate: daysFromNow(20), status: "PENDING",  quoteId: quote1.id, createdById: adminId },
      { type: "QUOTE_RECEIVABLE", direction: "IN",  description: "Recebimento — Empresa XYZ",                amount: 15836.33, dueDate: daysFromNow(35), status: "PENDING",  quoteId: quote2.id, createdById: adminId },
      { type: "QUOTE_RECEIVABLE", direction: "IN",  description: "Recebimento — Hotel Grand Palace",          amount: 46694.00, dueDate: daysAgo(58), paidAt: daysAgo(58), status: "PAID", quoteId: quote5.id, createdById: adminId },
      // Despesas compras
      { type: "PURCHASE_PAYABLE", direction: "OUT", description: "Pagamento — Depósito Central Construções", amount: 4800.00,  dueDate: daysAgo(28), paidAt: daysAgo(28), status: "PAID",    purchaseId: purchase1.id, createdById: adminId },
      { type: "PURCHASE_PAYABLE", direction: "OUT", description: "Pagamento — Loja Tintas & Cores",          amount: 3103.50,  dueDate: daysAgo(12), paidAt: daysAgo(11), status: "PAID",    purchaseId: purchase2.id, createdById: adminId },
      { type: "PURCHASE_PAYABLE", direction: "OUT", description: "Pagamento — Elétrica Souza",               amount: 1390.00,  dueDate: daysAgo(7),                       status: "OVERDUE", purchaseId: purchase3.id, createdById: adminId },
      { type: "PURCHASE_PAYABLE", direction: "OUT", description: "Pagamento — Hidrosul",                     amount: 980.00,   dueDate: daysFromNow(5),                    status: "PENDING", purchaseId: purchase4.id, createdById: adminId },
      // Outros lançamentos
      { type: "EXTERNAL_PAYABLE", direction: "OUT", description: "Aluguel andaimes — Andaimes Brasil",       amount: 2400.00,  dueDate: daysAgo(4),                        status: "OVERDUE", createdById: adminId },
      { type: "EXTERNAL_PAYABLE", direction: "OUT", description: "Contador — honorários mensais",            amount: 850.00,   dueDate: daysFromNow(10),                   status: "PENDING", createdById: adminId },
      { type: "EXTERNAL_PAYABLE", direction: "OUT", description: "Seguro de obra — parcela 3/6",             amount: 420.00,   dueDate: daysFromNow(8),                    status: "PENDING", createdById: adminId },
      { type: "OTHER",            direction: "IN",  description: "Adiantamento — Incorporadora Bela Vista",  amount: 8000.00,  dueDate: daysAgo(5),  paidAt: daysAgo(5),  status: "PAID",    createdById: adminId },
      { type: "EXTERNAL_PAYABLE", direction: "OUT", description: "INSS mão de obra — competência janeiro",   amount: 1240.00,  dueDate: daysAgo(15), paidAt: daysAgo(14), status: "PAID",    createdById: adminId },
    ],
  })

  // ─── ALERTAS ───────────────────────────────────────────────────────────────────
  await prisma.alert.createMany({
    data: [
      {
        title: "Estoque crítico: Cimento CP-II",
        description: "Restam apenas ~100kg de cimento. Estoque mínimo é 500kg. Compra urgente necessária.",
        priority: "CRITICAL", status: "ACTIVE",
        projectId: project1.id, productId: products[0].id,
        createdById: adminId, createdAt: daysAgo(2),
      },
      {
        title: "Prazo em risco — Reforma Monteiro",
        description: "Execução do 3º pavimento está 2 semanas atrasada. Avaliar contratação de reforço.",
        priority: "HIGH", status: "ACTIVE",
        projectId: project1.id,
        createdById: adminId, createdAt: daysAgo(4),
      },
      {
        title: "Conta em atraso — Elétrica Souza",
        description: "Fatura de R$ 1.390,00 venceu há 7 dias. Regularizar para evitar protesto.",
        priority: "HIGH", status: "ACTIVE",
        createdById: adminId, createdAt: daysAgo(7),
      },
      {
        title: "Aluguel de andaimes vencido",
        description: "Contrato de andaimes venceu há 4 dias. Renovar ou devolver os equipamentos.",
        priority: "MEDIUM", status: "ACTIVE",
        projectId: project1.id, productId: products[16].id,
        createdById: adminId, createdAt: daysAgo(4),
      },
      {
        title: "Serra circular não devolvida",
        description: "Serra circular ainda está na obra Monteiro sem registro de devolução ao almoxarifado.",
        priority: "LOW", status: "ACTIVE",
        projectId: project1.id, productId: products[17].id, assignedToId: worker.id,
        createdById: adminId, createdAt: daysAgo(10),
      },
      {
        title: "Vistoria final aprovada — Hotel Grand Palace",
        description: "Vistoria pós-obra concluída com aprovação integral do cliente. Documentação arquivada.",
        priority: "LOW", status: "RESOLVED",
        projectId: project3.id,
        createdById: adminId, resolvedAt: daysAgo(54), createdAt: daysAgo(58),
      },
    ],
  })

  const matCount  = products.filter((p) => p.type === "MATERIAL").length
  const toolCount = products.filter((p) => p.type === "TOOL").length
  console.log("\n✅ Dados de demonstração criados com sucesso!")
  console.log(`   ${clients.length} clientes`)
  console.log(`   ${products.length} produtos (${matCount} materiais + ${toolCount} ferramentas)`)
  console.log(`   ${services.length} serviços`)
  console.log(`   5 profissionais de mão de obra`)
  console.log(`   20 funcionários (2 sistema + 18 extras — senha extras: Emp@12345)`)
  console.log(`   31 orçamentos (9 pagos · 7 aprovados · 11 pendentes · 4 cancelados)`)
  console.log(`   10 projetos (4 ativos · 6 encerrados)`)
  console.log(`   4 compras`)
  console.log(`   12 lançamentos de fluxo de caixa`)
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
