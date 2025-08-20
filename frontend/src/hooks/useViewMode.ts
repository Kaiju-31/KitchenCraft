import type { ViewMode } from '../types';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook pour gérer le mode d'affichage avec persistance localStorage
 * @param storageKey - Clé unique pour cette page/composant
 * @param defaultMode - Mode par défaut ('grid' ou 'list')
 * @returns [viewMode, setViewMode] - Le mode actuel et une fonction pour le modifier
 */
export function useViewMode(storageKey: string, defaultMode: ViewMode = 'grid'): [ViewMode, (mode: ViewMode) => void] {
  return useLocalStorage<ViewMode>(storageKey, defaultMode);
}