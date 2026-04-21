import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { calculateBalance } from "@/domain/finance/calculateBalance";

type TransactionType = "entry" | "exit" | "transfer" | "withdraw" | "supply";

function toTxForBalance(t: {
  type: string;
  amount: unknown;
  cashboxOriginId: string | null;
  cashboxDestId: string | null;
}) {
  return {
    type: t.type as TransactionType,
    amount: Number(t.amount),
    cashboxOriginId: t.cashboxOriginId,
    cashboxDestId: t.cashboxDestId,
  };
}

function startOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfNextMonth(d: Date): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  return apiHandler(async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStart = startOfMonth(now);
    const monthEnd = startOfNextMonth(now);

    const [
      allTransactions,
      monthTransactions,
      revenueGoal,
      operationalCost,
      monthPayables,
    ] = await Promise.all([
      prisma.transaction.findMany({
        select: {
          type: true,
          amount: true,
          cashboxOriginId: true,
          cashboxDestId: true,
        },
      }),
      prisma.transaction.findMany({
        where: {
          movementAt: { gte: monthStart, lt: monthEnd },
        },
        select: {
          type: true,
          amount: true,
        },
      }),
      prisma.financeRevenueGoal.findUnique({
        where: { year_month: { year, month } },
      }),
      prisma.financeOperationalCost.findUnique({
        where: { year_month: { year, month } },
      }),
      prisma.financePayable.findMany({
        where: {
          dueDate: { gte: monthStart, lt: monthEnd },
          status: "pending",
        },
      }),
    ]);

    const balance = calculateBalance(allTransactions.map(toTxForBalance));

    let entriesMonth = 0;
    let exitsMonth = 0;
    for (const t of monthTransactions) {
      const amt = Number(t.amount);
      if (t.type === "entry" || t.type === "supply") entriesMonth += amt;
      if (t.type === "exit" || t.type === "withdraw") exitsMonth += amt;
    }
    entriesMonth = Math.round(entriesMonth * 100) / 100;
    exitsMonth = Math.round(exitsMonth * 100) / 100;

    const monthLabel = now.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });

    const goalValue = revenueGoal ? Number(revenueGoal.goalValue) : null;
    const goalAchieved = goalValue ? (entriesMonth / goalValue) * 100 : null;
    const goalStatus = goalAchieved
      ? goalAchieved >= 100
        ? "green"
        : goalAchieved >= 80
        ? "yellow"
        : "red"
      : null;

    const predictedCost = operationalCost ? Number(operationalCost.predictedCost) : null;
    const pendingPayables = monthPayables.reduce((sum, p) => sum + Number(p.amount), 0);

    const remainingBudget = balance - pendingPayables;
    const cashStatus = predictedCost
      ? remainingBudget > predictedCost * 0.2
        ? "green"
        : remainingBudget > 0
        ? "yellow"
        : "red"
      : "green";

    return {
      balance,
      entriesMonth,
      exitsMonth,
      monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      revenueGoal: {
        goal: goalValue,
        achieved: entriesMonth,
        percentage: goalAchieved,
        status: goalStatus,
      },
      operationalCost: {
        predicted: predictedCost,
        realized: exitsMonth,
        pending: pendingPayables,
        remainingBudget,
        status: cashStatus,
      },
    };
  });
}

