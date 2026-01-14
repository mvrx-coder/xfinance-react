/**
 * Weather API Service - WeatherAPI.com
 * 
 * Documentação: https://www.weatherapi.com/docs/
 * Limite gratuito: 1M chamadas/mês
 */

// ============================================
// TIPOS
// ============================================

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: WeatherCondition;
  conditionText: string;
  location: string;
  updatedAt: Date;
}

export type WeatherCondition = 
  | "sunny" 
  | "cloudy" 
  | "rainy" 
  | "partly-cloudy" 
  | "night" 
  | "night-cloudy";

interface WeatherAPIResponse {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    is_day: number;
    condition: {
      text: string;
      code: number;
    };
  };
}

// ============================================
// MAPEAMENTO DE CONDIÇÕES
// ============================================

/**
 * Mapeia códigos da WeatherAPI para nossas condições simplificadas
 * Códigos: https://www.weatherapi.com/docs/weather_conditions.json
 */
function mapConditionCode(code: number, isDay: boolean): WeatherCondition {
  // Códigos de chuva: 1063, 1180-1201, 1240-1246, 1273-1276
  const rainyCodes = [1063, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246, 1273, 1276];
  
  // Códigos de nublado pesado: 1006, 1009, 1030, 1135, 1147
  const cloudyCodes = [1006, 1009, 1030, 1135, 1147];
  
  // Códigos de parcialmente nublado: 1003
  const partlyCloudyCodes = [1003];
  
  // Códigos de limpo/ensolarado: 1000
  const clearCodes = [1000];

  if (rainyCodes.includes(code)) {
    return "rainy";
  }
  
  if (cloudyCodes.includes(code)) {
    return isDay ? "cloudy" : "night-cloudy";
  }
  
  if (partlyCloudyCodes.includes(code)) {
    return isDay ? "partly-cloudy" : "night-cloudy";
  }
  
  if (clearCodes.includes(code)) {
    return isDay ? "sunny" : "night";
  }
  
  // Default: parcialmente nublado
  return isDay ? "partly-cloudy" : "night-cloudy";
}

// ============================================
// API FETCH
// ============================================

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "";
const WEATHER_API_BASE = "https://api.weatherapi.com/v1";

/**
 * Busca dados de clima para uma localização
 * @param location - Cidade ou coordenadas (ex: "São Paulo" ou "-23.55,-46.63")
 */
export async function fetchWeather(location: string = "Nova Iguaçu, RJ"): Promise<WeatherData> {
  // Se não há API key, retorna dados mockados
  if (!WEATHER_API_KEY) {
    console.warn("[Weather] API key não configurada. Usando dados mockados.");
    return getMockedWeather(location);
  }

  try {
    const url = `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&lang=pt`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data: WeatherAPIResponse = await response.json();
    
    return {
      temperature: Math.round(data.current.temp_c),
      feelsLike: Math.round(data.current.feelslike_c),
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
      condition: mapConditionCode(data.current.condition.code, data.current.is_day === 1),
      conditionText: data.current.condition.text,
      location: data.location.name,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("[Weather] Erro ao buscar clima:", error);
    return getMockedWeather(location);
  }
}

// ============================================
// FALLBACK MOCKADO
// ============================================

function getMockedWeather(location: string): WeatherData {
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;
  
  // Simula condições variadas baseadas na hora
  let condition: WeatherCondition;
  let temperature: number;
  
  if (hour >= 6 && hour < 10) {
    condition = "partly-cloudy";
    temperature = 22;
  } else if (hour >= 10 && hour < 16) {
    condition = "sunny";
    temperature = 28;
  } else if (hour >= 16 && hour < 19) {
    condition = "partly-cloudy";
    temperature = 25;
  } else {
    condition = isDay ? "cloudy" : "night";
    temperature = 20;
  }
  
  return {
    temperature,
    feelsLike: temperature + 2,
    humidity: 65,
    windSpeed: 12,
    condition,
    conditionText: "Dados simulados",
    location: location.split(",")[0],
    updatedAt: new Date(),
  };
}

// ============================================
// GEOLOCALIZAÇÃO
// ============================================

/**
 * Obtém localização do usuário via Geolocation API
 * @returns Coordenadas no formato "lat,lon" ou null se não disponível
 */
export function getUserLocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(`${position.coords.latitude},${position.coords.longitude}`);
      },
      () => {
        // Erro ou permissão negada - usa localização padrão
        resolve(null);
      },
      { timeout: 5000, maximumAge: 300000 } // Cache de 5 minutos
    );
  });
}
