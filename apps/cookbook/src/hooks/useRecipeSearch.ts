import {
  startTransition,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";

import { Recipe } from "@/types/recipe";
import {
  completeSearchValue,
  filterRecipes,
  generateAutocompleteSuggestion,
  scrollToElement,
} from "@/utils/search";

interface UseRecipeSearchProps {
  recipes: Recipe[];
  initialValue?: string;
  onInput?: (value: string) => void;
  onEnter?: (value: string) => void;
}

export function useRecipeSearch({
  recipes,
  initialValue = "",
  onInput,
  onEnter,
}: UseRecipeSearchProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isPending, startSearchTransition] = useTransition();
  const [optimisticSearchValue, setOptimisticSearchValue] =
    useOptimistic(searchValue);

  // Memoized filtered recipes
  const filteredRecipes = useMemo(() => {
    const currentSearchValue = optimisticSearchValue || searchValue;
    return filterRecipes(recipes, currentSearchValue);
  }, [recipes, searchValue, optimisticSearchValue]);

  // Memoized autocomplete suggestion
  const placeholderSuggestion = useMemo(() => {
    const currentSearchValue = optimisticSearchValue || searchValue;
    return generateAutocompleteSuggestion(filteredRecipes, currentSearchValue);
  }, [filteredRecipes, searchValue, optimisticSearchValue]);

  // Form action handler for React 19
  const handleSearchAction = async (formData: FormData) => {
    const query = formData.get("search") as string;

    startSearchTransition(() => {
      setOptimisticSearchValue(query);
      setSearchValue(query);
      if (onInput) onInput(query);
    });
  };

  // Input change handler with transitions
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    startTransition(() => {
      setSearchValue(newValue);
      if (onInput) onInput(newValue);
    });
  };

  // Keyboard event handler
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (onEnter) {
        onEnter(searchValue);
      } else {
        // Default behavior: scroll to results
        scrollToElement("recipe-list");
      }
    } else if (event.key === "Tab" && placeholderSuggestion) {
      event.preventDefault();
      const completedValue = completeSearchValue(
        searchValue,
        placeholderSuggestion
      );

      startTransition(() => {
        setSearchValue(completedValue);
        if (onInput) onInput(completedValue);
      });
    }
  };

  // Clear search
  const clearSearch = () => {
    startTransition(() => {
      setSearchValue("");
      if (onInput) onInput("");
    });
  };

  return {
    // State
    searchValue,
    optimisticSearchValue,
    isPending,
    filteredRecipes,
    placeholderSuggestion,
    currentSearchValue: optimisticSearchValue || searchValue,

    // Handlers
    handleSearchAction,
    handleInputChange,
    handleKeyDown,
    clearSearch,

    // Utilities
    hasResults: filteredRecipes.length > 0,
    hasQuery: (optimisticSearchValue || searchValue).trim().length > 0,
  };
}
