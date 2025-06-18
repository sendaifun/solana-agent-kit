import { integer, pgTable, text, pgEnum, bigint } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: bigint({ mode: "number" }).primaryKey().notNull(),
  address: text().notNull(),
  walletId: text().notNull(),
});

export const roleEnum = pgEnum("role", ["user", "assistant"]);

export const messagesTable = pgTable("messages", {
  id: text().primaryKey().notNull(),
  text: text().notNull(),
  createdAt: bigint({ mode: "number" }).notNull(),
  chatId: bigint({ mode: "number" }).notNull(),
  role: roleEnum(),
});
