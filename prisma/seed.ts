import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const users = [
  { email: "admin@vibe.com",         name: "Administrador", password: "Admin@123",    role: "ADMIN"     as const },
  { email: "gerente@vibe.com",       name: "Gerente",       password: "Manager@123",  role: "MANAGER"   as const },
  { email: "funcionario@vibe.com",   name: "Funcionário",   password: "Employee@123", role: "EMPLOYEE"  as const },
  { email: "visualizador@vibe.com",  name: "Visualizador",  password: "Viewer@123",   role: "VIEWER"    as const },
]

async function main() {
  console.log("Iniciando seed...")

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10)
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: hashed,
        role: user.role,
        isActive: true,
      },
    })
    console.log(`✓ ${created.role.padEnd(8)} — ${created.email}  (senha: ${user.password})`)
  }

  console.log("Seed concluído.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
