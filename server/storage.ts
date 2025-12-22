import { type User, type InsertUser, type Inspection, type InsertInspection, type KPIs } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getInspections(): Promise<Inspection[]>;
  getInspection(id: number): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: number, inspection: Partial<InsertInspection>): Promise<Inspection | undefined>;
  deleteInspection(id: number): Promise<boolean>;
  getKPIs(): Promise<KPIs>;
}

function generateMockInspections(): Inspection[] {
  const atividades = ["Mineradora", "CD", "Falação, Confe", "Biodiesel", "Mineração, Be...", "GO", "Papel", "Química, Óleo", "Hidro Usina, Pn", "Alimentos, Fria", "Terminal, Velcu", "Fertilizantes", "Grãos, Café", "Fotovoltaica", "Subesta..."];

  const inspections: Inspection[] = [];

  for (let i = 0; i < 25; i++) {
    const honorario = Math.random() * 5000 + 500;
    const despesa = Math.random() * 1500 + 100;
    const guyHonorario = Math.random() * 4000;
    const guyDespesa = Math.random() * 1000;

    inspections.push({
      idPrinc: i + 1,
      idContr: Math.floor(Math.random() * 9) + 1,
      idSegur: Math.floor(Math.random() * 19) + 1,
      idAtivi: Math.floor(Math.random() * 15) + 1,
      idUf: Math.floor(Math.random() * 27) + 1,
      idCidade: Math.floor(Math.random() * 11) + 1,
      idUserGuy: Math.floor(Math.random() * 3) + 1,
      idUserGuilty: Math.floor(Math.random() * 7) + 1,
      loc: Math.floor(Math.random() * 5) + 1,
      meta: Math.random() > 0.5 ? 1 : 0,
      ms: Math.random() > 0.7 ? 1 : 0,
      dtInspecao: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
      dtEntregue: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
      prazo: Math.floor(Math.random() * 50) + 1,
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
      obs: null,
    });
  }

  return inspections;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inspections: Map<number, Inspection>;
  private nextUserId: number = 1;
  private nextInspectionId: number = 26;

  constructor() {
    this.users = new Map();
    this.inspections = new Map();
    
    const mockData = generateMockInspections();
    mockData.forEach(inspection => {
      this.inspections.set(inspection.idPrinc, inspection);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      displayName: insertUser.displayName ?? null,
      role: "user",
      nick: null,
      ativo: 1,
    };
    this.users.set(id, user);
    return user;
  }

  async getInspections(): Promise<Inspection[]> {
    return Array.from(this.inspections.values());
  }

  async getInspection(id: number): Promise<Inspection | undefined> {
    return this.inspections.get(id);
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const idPrinc = this.nextInspectionId++;
    const inspection: Inspection = { 
      idPrinc,
      idContr: insertInspection.idContr ?? null,
      idSegur: insertInspection.idSegur ?? null,
      idAtivi: insertInspection.idAtivi ?? null,
      idUf: insertInspection.idUf ?? null,
      idCidade: insertInspection.idCidade ?? null,
      idUserGuy: insertInspection.idUserGuy ?? null,
      idUserGuilty: insertInspection.idUserGuilty ?? null,
      loc: insertInspection.loc ?? null,
      meta: insertInspection.meta ?? null,
      ms: insertInspection.ms ?? null,
      dtInspecao: insertInspection.dtInspecao ?? null,
      dtEntregue: insertInspection.dtEntregue ?? null,
      prazo: insertInspection.prazo ?? null,
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
      obs: insertInspection.obs ?? null,
    };
    this.inspections.set(idPrinc, inspection);
    return inspection;
  }

  async updateInspection(id: number, updates: Partial<InsertInspection>): Promise<Inspection | undefined> {
    const existing = this.inspections.get(id);
    if (!existing) return undefined;
    
    const updated: Inspection = { ...existing, ...updates };
    this.inspections.set(id, updated);
    return updated;
  }

  async deleteInspection(id: number): Promise<boolean> {
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
