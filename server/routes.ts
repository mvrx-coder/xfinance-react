import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInspectionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/inspections", async (req, res) => {
    try {
      const inspections = await storage.getInspections();
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inspections" });
    }
  });

  app.get("/api/inspections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid inspection ID" });
      }
      const inspection = await storage.getInspection(id);
      if (!inspection) {
        return res.status(404).json({ error: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inspection" });
    }
  });

  app.post("/api/inspections", async (req, res) => {
    try {
      const validationSchema = z.object({
        player: z.string().min(1),
        segurado: z.string().min(1),
        loc: z.number().min(1),
        nickGuilty: z.string().optional(),
        nickGuy: z.string().optional(),
        meta: z.string().optional(),
        dtInspecao: z.string().optional(),
        dtEntregue: z.string().optional(),
        prazo: z.number().optional(),
        sw: z.number().optional(),
        dtAcerto: z.string().optional(),
        dtEnvio: z.string().optional(),
        dtPago: z.string().optional(),
        honorario: z.number().optional(),
        dtDenvio: z.string().optional(),
        dtDpago: z.string().optional(),
        despesa: z.number().optional(),
        dtGuyPago: z.string().optional(),
        guyHonorario: z.number().optional(),
        dtGuyDpago: z.string().optional(),
        guyDespesa: z.number().optional(),
        atividade: z.string().optional(),
        ms: z.number().optional(),
        obs: z.string().optional(),
        uf: z.string().optional(),
        cidade: z.string().optional(),
      });

      const parsed = validationSchema.parse(req.body);
      const inspection = await storage.createInspection(parsed);
      res.status(201).json(inspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create inspection" });
    }
  });

  app.patch("/api/inspections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid inspection ID" });
      }
      const inspection = await storage.updateInspection(id, req.body);
      if (!inspection) {
        return res.status(404).json({ error: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inspection" });
    }
  });

  app.delete("/api/inspections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid inspection ID" });
      }
      const success = await storage.deleteInspection(id);
      if (!success) {
        return res.status(404).json({ error: "Inspection not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inspection" });
    }
  });

  app.get("/api/kpis", async (req, res) => {
    try {
      const kpis = await storage.getKPIs();
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KPIs" });
    }
  });

  return httpServer;
}
