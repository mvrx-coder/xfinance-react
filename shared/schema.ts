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

// Inspections table - main grid data
export const inspections = pgTable("inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  player: text("player"),
  segurado: text("segurado"),
  loc: integer("loc"),
  guilty: text("guilty"),
  guy: text("guy"),
  meta: text("meta"),
  inspecao: text("inspecao"),
  entregue: text("entregue"),
  prazo: integer("prazo"),
  sw: integer("sw"),
  acerto: text("acerto"),
  envio: text("envio"),
  pago: text("pago"),
  honorarios: real("honorarios"),
  dEnvio: text("d_envio"),
  dPago: text("d_pago"),
  despesas: real("despesas"),
  gPago: text("g_pago"),
  gHonorarios: real("g_honorarios"),
  gdPago: text("gd_pago"),
  gDespesas: real("g_despesas"),
  atividade: text("atividade"),
  isWorkflow: boolean("is_workflow").default(true),
  isRecebiveis: boolean("is_recebiveis").default(true),
  isPagamentos: boolean("is_pagamentos").default(true),
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
});

export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;

// KPIs type for Express totals
export interface KPIs {
  express: number;
  honorarios: number;
  gHonorarios: number;
  despesas: number;
  gDespesas: number;
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
