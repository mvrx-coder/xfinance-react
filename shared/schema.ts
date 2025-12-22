import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = sqliteTable("user", {
  id: integer("id_user").primaryKey({ autoIncrement: true }),
  username: text("email").notNull(),
  password: text("hash_senha").notNull(),
  displayName: text("nome"),
  role: text("papel").default("user"),
  nick: text("nick"),
  ativo: integer("ativo"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Inspections table - main grid data (aligned with SQLite xFinance original)
export const inspections = sqliteTable("princ", {
  idPrinc: integer("id_princ").primaryKey(),
  idContr: integer("id_contr"),
  idSegur: integer("id_segur"),
  idAtivi: integer("id_ativi"),
  idUf: integer("id_uf"),
  idCidade: integer("id_cidade"),
  idUserGuy: integer("id_user_guy"),
  idUserGuilty: integer("id_user_guilty"),
  loc: integer("loc"),
  meta: integer("meta"),
  ms: integer("ms"),
  dtInspecao: text("dt_inspecao"),
  dtEntregue: text("dt_entregue"),
  prazo: integer("prazo"),
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
  obs: text("obs"),
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
