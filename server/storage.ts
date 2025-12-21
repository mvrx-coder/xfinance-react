import { type User, type InsertUser, type Inspection, type InsertInspection, type KPIs } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getInspections(): Promise<Inspection[]>;
  getInspection(id: string): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: string, inspection: Partial<InsertInspection>): Promise<Inspection | undefined>;
  deleteInspection(id: string): Promise<boolean>;
  getKPIs(): Promise<KPIs>;
}

function generateMockInspections(): Inspection[] {
  const players = ["Aon", "Swiss Re", "Howden", "Inter", "Free Job", "Marsh", "Lockton", "IRB", "Gallagher"];
  const segurados = [
    "Nexa", "CLIR 2 CD", "CLO CD", "DeMilIus", "RAJLOG", "SAVOY", "Caramuru", 
    "CEDRO Min...", "Vallourec", "Maracanã", "Top Paper", "Lwart", "CPFL PCHs",
    "Belo Alimen...", "Mosaic", "ENGEPACK", "Cia Muller C...", "COMEXIM", "Echoenergí..."
  ];
  const guilties = ["AAS", "HEA", "MVR", "ARR", "ALS", "RES", "LVS"];
  const guys = ["MVR", "AAS", "HEA"];
  const atividades = ["Mineradora", "CD", "Falação, Confe", "Biodiesel", "Mineração, Be...", "GO", "Papel", "Química, Óleo", "Hidro Usina, Pn", "Alimentos, Fria", "Terminal, Velcu", "Fertilizantes", "Grãos, Café", "Fotovoltaica", "Subesta..."];

  const inspections: Inspection[] = [];

  for (let i = 0; i < 25; i++) {
    const honorario = Math.random() * 5000 + 500;
    const despesa = Math.random() * 1500 + 100;
    const guyHonorario = Math.random() * 4000;
    const guyDespesa = Math.random() * 1000;

    inspections.push({
      idPrinc: randomUUID(),
      player: players[Math.floor(Math.random() * players.length)],
      segurado: segurados[Math.floor(Math.random() * segurados.length)],
      loc: Math.floor(Math.random() * 5) + 1,
      nickGuilty: guilties[Math.floor(Math.random() * guilties.length)],
      nickGuy: guys[Math.floor(Math.random() * guys.length)],
      meta: Math.random() > 0.5 ? "Sim" : "Não",
      dtInspecao: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
      dtEntregue: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
      prazo: Math.floor(Math.random() * 50) + 1,
      sw: Math.floor(Math.random() * 60) + 1,
      dtAcerto: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
      dtEnvio: `${Math.floor(Math.random() * 28) + 1}/11`,
      dtPago: `${Math.floor(Math.random() * 28) + 1}/11`,
      honorario: parseFloat(honorario.toFixed(2)),
      dtDenvio: `${Math.floor(Math.random() * 28) + 1}/10`,
      dtDpago: `${Math.floor(Math.random() * 28) + 1}/11`,
      despesa: parseFloat(despesa.toFixed(2)),
      dtGuyPago: `${Math.floor(Math.random() * 28) + 1}/11`,
      guyHonorario: parseFloat(guyHonorario.toFixed(2)),
      dtGuyDpago: `${Math.floor(Math.random() * 28) + 1}/09`,
      guyDespesa: parseFloat(guyDespesa.toFixed(2)),
      atividade: atividades[Math.floor(Math.random() * atividades.length)],
      ms: null,
      obs: null,
      uf: null,
      cidade: null,
      isWorkflow: true,
      isRecebiveis: true,
      isPagamentos: true,
    });
  }

  return inspections;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private inspections: Map<string, Inspection>;

  constructor() {
    this.users = new Map();
    this.inspections = new Map();
    
    const mockData = generateMockInspections();
    mockData.forEach(inspection => {
      this.inspections.set(inspection.idPrinc, inspection);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      displayName: insertUser.displayName ?? null,
      role: null,
    };
    this.users.set(id, user);
    return user;
  }

  async getInspections(): Promise<Inspection[]> {
    return Array.from(this.inspections.values());
  }

  async getInspection(id: string): Promise<Inspection | undefined> {
    return this.inspections.get(id);
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const idPrinc = randomUUID();
    const inspection: Inspection = { 
      idPrinc,
      player: insertInspection.player ?? null,
      segurado: insertInspection.segurado ?? null,
      loc: insertInspection.loc ?? null,
      nickGuilty: insertInspection.nickGuilty ?? null,
      nickGuy: insertInspection.nickGuy ?? null,
      meta: insertInspection.meta ?? null,
      dtInspecao: insertInspection.dtInspecao ?? null,
      dtEntregue: insertInspection.dtEntregue ?? null,
      prazo: insertInspection.prazo ?? null,
      sw: insertInspection.sw ?? null,
      dtAcerto: insertInspection.dtAcerto ?? null,
      dtEnvio: insertInspection.dtEnvio ?? null,
      dtPago: insertInspection.dtPago ?? null,
      honorario: insertInspection.honorario ?? null,
      dtDenvio: insertInspection.dtDenvio ?? null,
      dtDpago: insertInspection.dtDpago ?? null,
      despesa: insertInspection.despesa ?? null,
      dtGuyPago: insertInspection.dtGuyPago ?? null,
      guyHonorario: insertInspection.guyHonorario ?? null,
      dtGuyDpago: insertInspection.dtGuyDpago ?? null,
      guyDespesa: insertInspection.guyDespesa ?? null,
      atividade: insertInspection.atividade ?? null,
      ms: insertInspection.ms ?? null,
      obs: insertInspection.obs ?? null,
      uf: insertInspection.uf ?? null,
      cidade: insertInspection.cidade ?? null,
      isWorkflow: insertInspection.isWorkflow ?? true,
      isRecebiveis: insertInspection.isRecebiveis ?? true,
      isPagamentos: insertInspection.isPagamentos ?? true,
    };
    this.inspections.set(idPrinc, inspection);
    return inspection;
  }

  async updateInspection(id: string, updates: Partial<InsertInspection>): Promise<Inspection | undefined> {
    const existing = this.inspections.get(id);
    if (!existing) return undefined;
    
    const updated: Inspection = { ...existing, ...updates };
    this.inspections.set(id, updated);
    return updated;
  }

  async deleteInspection(id: string): Promise<boolean> {
    return this.inspections.delete(id);
  }

  async getKPIs(): Promise<KPIs> {
    const inspections = Array.from(this.inspections.values());
    
    const honorarios = inspections.reduce((sum, i) => sum + (i.honorario || 0), 0);
    const despesas = inspections.reduce((sum, i) => sum + (i.despesa || 0), 0);
    const guyHonorario = inspections.reduce((sum, i) => sum + (i.guyHonorario || 0), 0);
    const guyDespesa = inspections.reduce((sum, i) => sum + (i.guyDespesa || 0), 0);
    
    return {
      express: honorarios + despesas - guyHonorario - guyDespesa,
      honorarios,
      guyHonorario,
      despesas,
      guyDespesa,
    };
  }
}

export const storage = new MemStorage();
