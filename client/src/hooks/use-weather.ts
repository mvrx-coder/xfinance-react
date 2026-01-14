/**
 * Hook para dados de clima com cache inteligente
 * 
 * Usa WeatherAPI.com com atualização a cada 30 minutos
 * Fallback para dados mockados se API não configurada
 */

import { useState, useEffect, useCallback } from "react";
import { fetchWeather, getUserLocation, type WeatherData, type WeatherCondition } from "@/services/api/weather";

// ============================================
// CONSTANTES
// ============================================

const CACHE_KEY = "xfinance_weather_cache";
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutos
const DEFAULT_LOCATION = "Nova Iguaçu, RJ";

// ============================================
// TIPOS
// ============================================

export type { WeatherData, WeatherCondition };

export interface UseWeatherReturn {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
  location: string;
}

// ============================================
// HELPERS DE CACHE
// ============================================

function getCachedWeather(): CachedWeather | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedWeather = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;
    
    // Cache expirado
    if (age > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    // Restaura Date object
    parsed.data.updatedAt = new Date(parsed.data.updatedAt);
    return parsed;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function setCachedWeather(data: WeatherData, location: string): void {
  try {
    const cache: CachedWeather = {
      data,
      timestamp: Date.now(),
      location,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage cheio ou indisponível - ignora silenciosamente
  }
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useWeather(customLocation?: string): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Verifica cache primeiro (se não for refresh forçado)
      if (!forceRefresh) {
        const cached = getCachedWeather();
        if (cached && (!customLocation || cached.location === customLocation)) {
          setWeather(cached.data);
          setLastUpdated(new Date(cached.timestamp));
          setIsLoading(false);
          return;
        }
      }

      // Determina localização
      let location = customLocation || DEFAULT_LOCATION;
      
      // Tenta geolocalização se não houver localização customizada
      if (!customLocation) {
        const geoLocation = await getUserLocation();
        if (geoLocation) {
          location = geoLocation;
        }
      }

      // Busca dados da API
      const data = await fetchWeather(location);
      
      // Atualiza estado e cache
      setWeather(data);
      setLastUpdated(data.updatedAt);
      setCachedWeather(data, location);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar clima";
      setError(message);
      console.error("[useWeather]", message);
    } finally {
      setIsLoading(false);
    }
  }, [customLocation]);

  // Fetch inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh a cada 30 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, CACHE_DURATION_MS);

    return () => clearInterval(interval);
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return {
    weather,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
}
