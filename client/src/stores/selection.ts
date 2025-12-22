import { useSyncExternalStore, useCallback } from "react";

type Listener = () => void;

let selectedIds: number[] = [];
const listeners: Set<Listener> = new Set();

export function setSelected(ids: number[]): void {
  selectedIds = [...ids];
  listeners.forEach((listener) => listener());
}

export function getSelected(): number[] {
  return selectedIds;
}

export function clearSelection(): void {
  selectedIds = [];
  listeners.forEach((listener) => listener());
}

export function toggleSelection(id: number): void {
  const index = selectedIds.indexOf(id);
  if (index === -1) {
    selectedIds = [...selectedIds, id];
  } else {
    selectedIds = selectedIds.filter((i) => i !== id);
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => selectedIds;
const getServerSnapshot = () => selectedIds;

export function useSelection(): number[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
