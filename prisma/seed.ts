import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cashboxCount = await prisma.financeCashbox.count();
  if (cashboxCount > 0) {
    console.log("Seed financeiro: já existem dados. Pulando.");
    return;
  }

  await prisma.financeCashbox.create({
    data: {
      name: "Caixa Principal",
      description: "Caixa padrão para operações do dia a dia",
      isActive: true,
    },
  });
  console.log("Criado caixa: Caixa Principal");

  await prisma.financeCategory.createMany({
    data: [
      { name: "Vendas", type: "entry" },
      { name: "Serviços", type: "entry" },
      { name: "Outras receitas", type: "entry" },
      { name: "Despesas operacionais", type: "exit" },
      { name: "Energia e água", type: "exit" },
      { name: "Outras despesas", type: "exit" },
    ],
  });
  console.log("Criadas 6 categorias");

  await prisma.financePaymentMethod.createMany({
    data: [
      { name: "Dinheiro" },
      { name: "PIX" },
      { name: "Cartão de crédito" },
      { name: "Cartão de débito" },
      { name: "Boleto" },
      { name: "Transferência" },
    ],
  });
  console.log("Criadas 6 formas de pagamento.");
}

try {
  await main();
} catch (e) {
  console.error("Seed financeiro falhou:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
