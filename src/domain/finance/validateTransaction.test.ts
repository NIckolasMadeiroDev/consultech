import { describe, it, expect } from "vitest";
import { validateTransaction } from "./validateTransaction";

describe("validateTransaction", () => {
  it("should create valid entry transaction", () => {
    const errors = validateTransaction({
      type: "entry",
      amount: 100,
      categoryId: "cat-1",
      paymentMethodId: "pm-1",
      cashboxDestId: "box-1",
    });
    expect(errors).toHaveLength(0);
  });

  it("should create valid exit transaction", () => {
    const errors = validateTransaction({
      type: "exit",
      amount: 50,
      categoryId: "cat-1",
      paymentMethodId: "pm-1",
      cashboxOriginId: "box-1",
    });
    expect(errors).toHaveLength(0);
  });

  it("should reject transaction with negative value", () => {
    const errors = validateTransaction({
      type: "entry",
      amount: -10,
      categoryId: "cat-1",
      paymentMethodId: "pm-1",
      cashboxDestId: "box-1",
    });
    expect(errors.some((e) => e.field === "amount" && e.message.includes("positivo"))).toBe(true);
  });

  it("should reject transaction with zero value", () => {
    const errors = validateTransaction({
      type: "entry",
      amount: 0,
      categoryId: "cat-1",
      paymentMethodId: "pm-1",
      cashboxDestId: "box-1",
    });
    expect(errors.some((e) => e.field === "amount")).toBe(true);
  });

  it("should reject entry without category", () => {
    const errors = validateTransaction({
      type: "entry",
      amount: 100,
      paymentMethodId: "pm-1",
      cashboxDestId: "box-1",
    });
    expect(errors.some((e) => e.field === "categoryId")).toBe(true);
  });

  it("should reject entry without payment method", () => {
    const errors = validateTransaction({
      type: "entry",
      amount: 100,
      categoryId: "cat-1",
      cashboxDestId: "box-1",
    });
    expect(errors.some((e) => e.field === "paymentMethodId")).toBe(true);
  });

  it("should reject entry without cashbox destination", () => {
    const errors = validateTransaction({
      type: "entry",
      amount: 100,
      categoryId: "cat-1",
      paymentMethodId: "pm-1",
    });
    expect(errors.some((e) => e.field === "cashboxDestId")).toBe(true);
  });

  it("should reject exit without cashbox origin", () => {
    const errors = validateTransaction({
      type: "exit",
      amount: 50,
      categoryId: "cat-1",
      paymentMethodId: "pm-1",
    });
    expect(errors.some((e) => e.field === "cashboxOriginId")).toBe(true);
  });

  it("should validate transfer with origin and destination", () => {
    const errors = validateTransaction({
      type: "transfer",
      amount: 100,
      cashboxOriginId: "box-a",
      cashboxDestId: "box-b",
    });
    expect(errors).toHaveLength(0);
  });

  it("should reject transfer when origin equals destination", () => {
    const errors = validateTransaction({
      type: "transfer",
      amount: 100,
      cashboxOriginId: "box-a",
      cashboxDestId: "box-a",
    });
    expect(errors.some((e) => e.field === "cashboxDestId" && e.message.includes("diferentes"))).toBe(true);
  });

  it("should reject withdraw without cashbox origin", () => {
    const errors = validateTransaction({
      type: "withdraw",
      amount: 50,
      cashboxOriginId: "",
    });
    expect(errors.some((e) => e.field === "cashboxOriginId")).toBe(true);
  });

  it("should validate supply with cashbox destination", () => {
    const errors = validateTransaction({
      type: "supply",
      amount: 200,
      cashboxDestId: "box-1",
    });
    expect(errors).toHaveLength(0);
  });
});
