/**
 * Hook para debounce de valores.
 * 
 * Útil para evitar requisições excessivas ao servidor durante digitação.
 */

import { useState, useEffect } from "react";

/**
 * Retorna valor com debounce.
 * 
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @returns Valor debounced
 * 
 * @example
 * const debouncedSearch = useDebouncedValue(search, 300);
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Retorna função com debounce.
 * 
 * @param fn - Função a ser debounced
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @returns Função debounced
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 300
): T {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  const debouncedFn = ((...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    
    const newTimer = setTimeout(() => {
      fn(...args);
    }, delay);
    
    setTimer(newTimer);
  }) as T;
  
  return debouncedFn;
}

