import { Recipe } from '@/types/recipe';

/**
 * Filter recipes based on search query
 */
export function filterRecipes(recipes: Recipe[], searchQuery: string): Recipe[] {
  if (!searchQuery.trim()) return [];
  
  const query = searchQuery.toLowerCase();
  
  return recipes.filter((recipe) => {
    const searchText = `${recipe.title} ${recipe.description || ''} ${recipe.category || ''} ${recipe.cuisine || ''}`;
    return searchText.toLowerCase().includes(query);
  });
}

/**
 * Generate autocomplete suggestion based on filtered recipes and current search value
 */
export function generateAutocompleteSuggestion(
  filteredRecipes: Recipe[],
  searchValue: string
): string {
  if (!searchValue.trim() || filteredRecipes.length === 0) return '';
  
  const suggestions: string[] = [];
  const query = searchValue.toLowerCase();

  for (const recipe of filteredRecipes) {
    const words = recipe.title.split(' ');
    
    if (words.some((word) => word.toLowerCase().startsWith(query))) {
      suggestions.push(recipe.title.toLowerCase());
    }
  }

  if (suggestions[0]) {
    const suggestion = suggestions[0];
    const searchIndex = suggestion.indexOf(query);
    return searchIndex >= 0 ? suggestion.slice(searchIndex) : '';
  }

  return '';
}

/**
 * Complete the search value with the autocomplete suggestion
 */
export function completeSearchValue(
  currentValue: string,
  suggestion: string
): string {
  if (!suggestion) return currentValue;
  
  return `${currentValue}${suggestion.slice(currentValue.length)}`;
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Scroll to element with smooth behavior
 */
export function scrollToElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}
