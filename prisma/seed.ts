import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando seed...")

  // Cria usuário administrador padrão
  const hashedPassword = await bcrypt.hash("admin123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@empresa.com" },
    update: {},
    create: {
      email: "admin@empresa.com",
      password: hashedPassword,
      name: "Administrador",
      role: "ADMIN",
      isActive: true,
    },
  })

  console.log(`Usuário admin criado: ${admin.email}`)
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
