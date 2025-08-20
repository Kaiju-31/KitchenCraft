import { useState, useEffect } from 'react';

/**
 * Hook pour gérer la persistance de données dans le localStorage
 * @param key - Clé de stockage dans le localStorage
 * @param initialValue - Valeur initiale si aucune valeur n'est trouvée
 * @returns [value, setValue] - La valeur actuelle et une fonction pour la modifier
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State pour stocker notre valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Récupérer depuis le localStorage
      const item = window.localStorage.getItem(key);
      // Parser la valeur JSON stockée ou retourner la valeur initiale
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si erreur, retourner la valeur initiale
      console.warn(`Erreur lors de la lecture du localStorage pour la clé "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour définir la valeur
  const setValue = (value: T) => {
    try {
      // Permettre à la valeur d'être une fonction pour avoir la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Sauvegarder dans le state
      setStoredValue(valueToStore);
      // Sauvegarder dans le localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // En cas d'erreur plus avancée (ex: quota dépassé)
      console.warn(`Erreur lors de l'écriture dans le localStorage pour la clé "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}