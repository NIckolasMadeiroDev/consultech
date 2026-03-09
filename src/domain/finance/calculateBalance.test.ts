import { describe, it, expect } from "vitest";
import {
  calculateBalance,
  calculateCashboxBalance,
  type TransactionForBalance,
} from "./calculateBalance";

describe("calculateBalance", () => {
  it("should return zero when no transactions exist", () => {
    expect(calculateBalance([])).toBe(0);
  });

  it("should calculate balance with only entries", () => {
    const transactions: TransactionForBalance[] = [
      { type: "entry", amount: 100 },
      { type: "supply", amount: 50 },
    ];
    expect(calculateBalance(transactions)).toBe(150);
  });

  it("should calculate balance with entries and exits", () => {
    const transactions: TransactionForBalance[] = [
      { type: "entry", amount: 100 },
      { type: "exit", amount: 40 },
    ];
    expect(calculateBalance(transactions)).toBe(60);
  });

  it("should return negative balance when exits exceed entries", () => {
    const transactions: TransactionForBalance[] = [
      { type: "entry", amount: 100 },
      { type: "exit", amount: 150 },
    ];
    expect(calculateBalance(transactions)).toBe(-50);
  });

  it("should ignore transfer for global balance (debit and credit cancel)", () => {
    const transactions: TransactionForBalance[] = [
      { type: "transfer", amount: 200, cashboxOriginId: "A", cashboxDestId: "B" },
    ];
    expect(calculateBalance(transactions)).toBe(0);
  });

  it("should round to two decimal places", () => {
    const transactions: TransactionForBalance[] = [
      { type: "entry", amount: 10.1 },
      { type: "exit", amount: 3.333 },
    ];
    expect(calculateBalance(transactions)).toBe(6.77);
  });
});

describe("calculateCashboxBalance", () => {
  const boxA = "cashbox-a";
  const boxB = "cashbox-b";

  it("should return zero when no transactions for cashbox", () => {
    expect(
      calculateCashboxBalance(boxA, [
        { type: "entry", amount: 100, cashboxDestId: boxB },
      ])
    ).toBe(0);
  });

  it("should increase balance on entry to cashbox", () => {
    const transactions = [
      { type: "entry", amount: 100, cashboxDestId: boxA },
    ];
    expect(calculateCashboxBalance(boxA, transactions)).toBe(100);
  });

  it("should decrease balance on exit from cashbox", () => {
    const transactions = [
      { type: "entry", amount: 100, cashboxDestId: boxA },
      { type: "exit", amount: 30, cashboxOriginId: boxA },
    ];
    expect(calculateCashboxBalance(boxA, transactions)).toBe(70);
  });

  it("should decrease origin and increase destination on transfer", () => {
    const transactions = [
      { type: "entry", amount: 200, cashboxDestId: boxA },
      { type: "transfer", amount: 50, cashboxOriginId: boxA, cashboxDestId: boxB },
    ];
    expect(calculateCashboxBalance(boxA, transactions)).toBe(150);
    expect(calculateCashboxBalance(boxB, transactions)).toBe(50);
  });

  it("should handle withdraw (sangria) from cashbox", () => {
    const transactions = [
      { type: "entry", amount: 100, cashboxDestId: boxA },
      { type: "withdraw", amount: 40, cashboxOriginId: boxA },
    ];
    expect(calculateCashboxBalance(boxA, transactions)).toBe(60);
  });

  it("should handle supply (suprimento) to cashbox", () => {
    const transactions = [
      { type: "supply", amount: 80, cashboxDestId: boxA },
    ];
    expect(calculateCashboxBalance(boxA, transactions)).toBe(80);
  });
});
