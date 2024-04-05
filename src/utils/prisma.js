const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.log("Database connection established.");
  })
  .catch((error) => {
    console.error("Unable to connect to database:", error);
    process.exit(1);
  });

module.exports = prisma;
