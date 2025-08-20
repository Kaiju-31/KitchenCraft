

/**
 * Formate une quantité avec son unité pour l'affichage
 */
export const formatQuantity = (quantity: number, unit: string): string => {
  // Arrondir à 2 décimales si nécessaire
  const rounded = Math.round(quantity * 100) / 100;
  
  // Si c'est un nombre entier, ne pas afficher les décimales
  const displayQuantity = rounded === Math.floor(rounded) 
    ? Math.floor(rounded).toString()
    : rounded.toString();

  return `${displayQuantity} ${unit}`;
};

/**
 * Parse une quantité formatée en nombre et unité
 */
export const parseQuantity = (quantityString: string): { quantity: number; unit: string } => {
  const match = quantityString.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!match) {
    throw new Error('Format de quantité invalide');
  }

  const quantity = parseFloat(match[1]);
  const unit = match[2].trim();

  return { quantity, unit };
};


/**
 * Valide si une quantité est valide
 */
export const isValidQuantity = (quantity: number): boolean => {
  return !isNaN(quantity) && quantity > 0 && isFinite(quantity);
};

/**
 * Unités standardisées disponibles pour les recettes
 */
export const STANDARD_UNITS = [
  'g',
  'kg', 
  'ml',
  'cl',
  'l',
  'c.à.s',
  'c.à.c',
  'tasse',
  'unité'
] as const;

/**
 * Convertit des unités courantes en format standardisé
 */
export const normalizeUnit = (unit: string): string => {
  const unitMap: { [key: string]: string } = {
    'g': 'g',
    'gramme': 'g',
    'grammes': 'g',
    'kg': 'kg',
    'kilo': 'kg',
    'kilogramme': 'kg',
    'kilogrammes': 'kg',
    'cl': 'cl',
    'ml': 'ml',
    'millilitre': 'ml',
    'millilitres': 'ml',
    'l': 'l',
    'litre': 'l',
    'litres': 'l',
    'c.à.s': 'c.à.s',
    'cuillère à soupe': 'c.à.s',
    'cuillères à soupe': 'c.à.s',
    'c.à.c': 'c.à.c',
    'cuillère à café': 'c.à.c',
    'cuillères à café': 'c.à.c',
    'tasse': 'tasse',
    'tasses': 'tasse',
    'unité': 'unité',
    'unités': 'unité'
  };

  return unitMap[unit.toLowerCase()] || unit;
};