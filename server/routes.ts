import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInspectionSchema } from "@shared/schema";
import { z } from "zod";
import fetch from "node-fetch";

// Backend FastAPI URL
const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

// Proxy manual para FastAPI
async function proxyToFastAPI(req: Request, res: Response, path?: string) {
  const targetPath = path || req.originalUrl;
  const url = `${FASTAPI_URL}${targetPath}`;
  
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (req.headers.cookie) {
      headers["Cookie"] = req.headers.cookie;
    }
    
    const fetchOptions: any = {
      method: req.method,
      headers,
    };
    
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(url, fetchOptions);
    
    // Copiar headers relevantes
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("Set-Cookie", setCookie);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    
    res.status(response.status);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).json({ error: "Backend unavailable" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Rotas que devem ir para o FastAPI
  app.all("/api/auth/*", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/acoes/*", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/lookups/*", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/performance/*", (req, res) => proxyToFastAPI(req, res));
  
  // Rota de inspections - PATCH vai para FastAPI, GET com params também
  app.patch("/api/inspections/:id", (req, res) => proxyToFastAPI(req, res));
  app.get("/api/inspections", (req, res, next) => {
    // Se tem query params, vai para FastAPI
    if (Object.keys(req.query).length > 0) {
      return proxyToFastAPI(req, res);
    }
    next();
  });

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
