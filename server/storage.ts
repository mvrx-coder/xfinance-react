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
    const honorarios = Math.random() * 5000 + 500;
    const despesas = Math.random() * 1500 + 100;
    const gHonorarios = Math.random() * 4000;
    const gDespesas = Math.random() * 1000;

    inspections.push({
      id: randomUUID(),
      player: players[Math.floor(Math.random() * players.length)],
      segurado: segurados[Math.floor(Math.random() * segurados.length)],
      loc: Math.floor(Math.random() * 5) + 1,
      guilty: guilties[Math.floor(Math.random() * guilties.length)],
      guy: guys[Math.floor(Math.random() * guys.length)],
      meta: Math.random() > 0.5 ? "Sim" : "Não",
      inspecao: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
      entregue: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
      prazo: Math.floor(Math.random() * 50) + 1,
      sw: Math.floor(Math.random() * 60) + 1,
      acerto: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
      envio: `${Math.floor(Math.random() * 28) + 1}/11`,
      pago: `${Math.floor(Math.random() * 28) + 1}/11`,
      honorarios: parseFloat(honorarios.toFixed(2)),
      dEnvio: `${Math.floor(Math.random() * 28) + 1}/10`,
      dPago: `${Math.floor(Math.random() * 28) + 1}/11`,
      despesas: parseFloat(despesas.toFixed(2)),
      gPago: `${Math.floor(Math.random() * 28) + 1}/11`,
      gHonorarios: parseFloat(gHonorarios.toFixed(2)),
      gdPago: `${Math.floor(Math.random() * 28) + 1}/09`,
      gDespesas: parseFloat(gDespesas.toFixed(2)),
      atividade: atividades[Math.floor(Math.random() * atividades.length)],
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
      this.inspections.set(inspection.id, inspection);
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
    const user: User = { ...insertUser, id };
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
    const id = randomUUID();
    const inspection: Inspection = { 
      ...insertInspection, 
      id,
      isWorkflow: insertInspection.isWorkflow ?? true,
      isRecebiveis: insertInspection.isRecebiveis ?? true,
      isPagamentos: insertInspection.isPagamentos ?? true,
    };
    this.inspections.set(id, inspection);
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
    
    const honorarios = inspections.reduce((sum, i) => sum + (i.honorarios || 0), 0);
    const despesas = inspections.reduce((sum, i) => sum + (i.despesas || 0), 0);
    const gHonorarios = inspections.reduce((sum, i) => sum + (i.gHonorarios || 0), 0);
    const gDespesas = inspections.reduce((sum, i) => sum + (i.gDespesas || 0), 0);
    
    return {
      express: honorarios + despesas - gHonorarios - gDespesas,
      honorarios,
      gHonorarios,
      despesas,
      gDespesas,
    };
  }
}

export const storage = new MemStorage();
