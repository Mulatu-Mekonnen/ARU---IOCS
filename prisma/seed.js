const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  // create some offices
  const headOffice = await prisma.office.create({ data: { name: "Head Office" } });
  const branchOffice = await prisma.office.create({ data: { name: "Branch Office" } });

  // create users
  await prisma.user.createMany({
    data: [
      {
        name: "System Admin",
        email: "admin@office.com",
        password: adminPassword,
        role: "ADMIN",
        officeId: headOffice.id,
      },
      {
        name: "Office Staff",
        email: "staff@office.com",
        password: userPassword,
        role: "STAFF",
        officeId: branchOffice.id,
      },
    ],
  });

  console.log("✅ Users and offices created successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());