import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  role: text("role").default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Inspections table - main grid data (aligned with SQLite xFinance original)
export const inspections = pgTable("inspections", {
  idPrinc: varchar("id_princ").primaryKey().default(sql`gen_random_uuid()`),
  player: text("player"),
  segurado: text("segurado"),
  loc: integer("loc"),
  nickGuilty: text("nick_guilty"),
  nickGuy: text("nick_guy"),
  meta: text("meta"),
  dtInspecao: text("dt_inspecao"),
  dtEntregue: text("dt_entregue"),
  prazo: integer("prazo"),
  sw: integer("sw"),
  dtAcerto: text("dt_acerto"),
  dtEnvio: text("dt_envio"),
  dtPago: text("dt_pago"),
  honorario: real("honorario"),
  dtDenvio: text("dt_denvio"),
  dtDpago: text("dt_dpago"),
  despesa: real("despesa"),
  dtGuyPago: text("dt_guy_pago"),
  guyHonorario: real("guy_honorario"),
  dtGuyDpago: text("dt_guy_dpago"),
  guyDespesa: real("guy_despesa"),
  atividade: text("atividade"),
  ms: integer("ms"),
  obs: text("obs"),
  uf: text("uf"),
  cidade: text("cidade"),
  isWorkflow: boolean("is_workflow").default(true),
  isRecebiveis: boolean("is_recebiveis").default(true),
  isPagamentos: boolean("is_pagamentos").default(true),
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  idPrinc: true,
});

export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;

// KPIs type for Express totals (aligned with SQLite xFinance original)
export interface KPIs {
  express: number;
  honorarios: number;
  guyHonorario: number;
  despesas: number;
  guyDespesa: number;
}

// Filter state type
export interface FilterState {
  player: boolean;
  myJob: boolean;
  dbLimit: boolean;
  columnGroups: {
    workflow: boolean;
    recebiveis: boolean;
    pagamentos: boolean;
  };
}

// Weather info type
export interface WeatherInfo {
  temperature: number;
  condition: string;
}
