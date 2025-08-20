/**
 * Formate l'affichage du temps en convertissant automatiquement en heures quand >= 60 minutes
 * @param minutes - Temps en minutes
 * @returns Temps formaté (ex: "30 min", "1h", "1h30")
 */
export function formatTimeDisplay(minutes: number | undefined | null): string {
  if (minutes === null || minutes === undefined || minutes === 0) {
    return '0 min';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${remainingMinutes}`;
}

/**
 * Version plus détaillée avec les mots complets
 * @param minutes - Temps en minutes
 * @returns Temps formaté avec mots complets (ex: "1 heure 30", "2 heures")
 */
export function formatTimeDisplayLong(minutes: number | undefined | null): string {
  if (minutes === null || minutes === undefined || minutes === 0) {
    return '0 minute';
  }

  if (minutes < 60) {
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let result = hours === 1 ? '1 heure' : `${hours} heures`;
  
  if (remainingMinutes > 0) {
    const minuteText = remainingMinutes === 1 ? '1 minute' : `${remainingMinutes} minutes`;
    result += ` ${minuteText}`;
  }

  return result;
}