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
      const inspection = await storage.getInspection(req.params.id);
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
        guilty: z.string().optional(),
        guy: z.string().optional(),
        meta: z.string().optional(),
        inspecao: z.string().optional(),
        entregue: z.string().optional(),
        prazo: z.number().optional(),
        sw: z.number().optional(),
        acerto: z.string().optional(),
        envio: z.string().optional(),
        pago: z.string().optional(),
        honorarios: z.number().optional(),
        dEnvio: z.string().optional(),
        dPago: z.string().optional(),
        despesas: z.number().optional(),
        gPago: z.string().optional(),
        gHonorarios: z.number().optional(),
        gdPago: z.string().optional(),
        gDespesas: z.number().optional(),
        atividade: z.string().optional(),
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
      const inspection = await storage.updateInspection(req.params.id, req.body);
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
      const success = await storage.deleteInspection(req.params.id);
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
